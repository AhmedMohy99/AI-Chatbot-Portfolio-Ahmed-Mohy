import os
import json
from http.server import BaseHTTPRequestHandler
import openai

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))  # repo root
DATA_DIR = os.path.join(BASE_DIR, "data")

def load_faq(path: str) -> str:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except Exception:
        return ""

FAQ_EN = load_faq(os.path.join(DATA_DIR, "faq_en.txt"))
FAQ_AR = load_faq(os.path.join(DATA_DIR, "faq_ar.txt"))

SYSTEM_EN = f"""
You are Ahmed Mohy's portfolio assistant.
Goal: answer questions about Ahmed's services, pricing (starter estimates), and contact details.
Style: professional, concise, friendly. If the question is unclear, ask 1 short follow-up question.

Use the FAQ below as the single source of truth. Do not invent projects or experience not stated.
If user asks for exact pricing, explain it depends on scope and ask 1–2 questions.

FAQ:
{FAQ_EN}
""".strip()

SYSTEM_AR = f"""
أنت مساعد بورتفوليو أحمد محي.
الهدف: الرد على الأسئلة عن الخدمات والأسعار المبدئية وطرق التواصل.
الأسلوب: احترافي، مختصر، ودود. إذا كان السؤال غير واضح اسأل سؤالاً واحداً للتوضيح.

استخدم ملف الأسئلة الشائعة كمصدر أساسي ولا تخترع خبرات أو مشاريع غير موجودة.
إذا سأل المستخدم عن سعر نهائي قل أنه يعتمد على تفاصيل المشروع واسأل سؤال/سؤالين.

الأسئلة الشائعة:
{FAQ_AR}
""".strip()

class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            data = json.loads(raw)

            message = (data.get("message") or "").strip()
            lang = (data.get("lang") or "en").lower()
            history = data.get("history") or []  # [{role:"user"/"assistant", content:"..."}]

            if not message:
                return self._send_json(400, {"reply": "Empty message."})

            api_key = os.environ.get("OPENAI_API_KEY")
            if not api_key:
                return self._send_json(500, {"reply": "OPENAI_API_KEY is missing in Vercel Environment Variables."})

            openai.api_key = api_key

            system_context = SYSTEM_AR if lang == "ar" else SYSTEM_EN

            # Build messages with simple memory (limited)
            messages = [{"role": "system", "content": system_context}]

            # Keep last 10 turns max for cost + speed
            for item in history[-20:]:
                role = item.get("role")
                content = item.get("content")
                if role in ("user", "assistant") and isinstance(content, str) and content.strip():
                    messages.append({"role": role, "content": content.strip()})

            messages.append({"role": "user", "content": message})

            resp = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.4
            )

            reply = resp["choices"][0]["message"]["content"]
            return self._send_json(200, {"reply": reply})

        except openai.error.AuthenticationError:
            return self._send_json(
                401,
                {"reply": "Invalid API key. Please update OPENAI_API_KEY in Vercel (Settings → Environment Variables) and redeploy."}
            )
        except Exception as e:
            return self._send_json(500, {"reply": f"Server error: {str(e)}"})
