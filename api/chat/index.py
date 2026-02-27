import os
import json
from http.server import BaseHTTPRequestHandler
from openai import OpenAI

OWNER_NAME = "Ahmed Mohy"
EMAIL = "Ahmed171684@gmail.com"
WHATSAPP_DISPLAY = "01016286261"
WHATSAPP_LINK = "https://wa.me/201016286261"
INSTAGRAM = "https://www.instagram.com/ahmed.abdrabboo/"
GITHUB = "https://github.com/AhmedMohy99"

BUSINESS_CONTEXT_EN = f"""
You are a helpful assistant for {OWNER_NAME}'s AI services portfolio.
Be polite, clear, and professional.

About:
- Artificial Intelligence Graduate – The British University in Egypt
- AI Engineer | Machine Learning | Deep Learning | CNN

Services:
- AI Chatbots for websites
- Data analysis dashboards (CSV/Excel → insights)
- Machine Learning models (classification/regression)
- Image classification (CNN)

Contact:
- Email: {EMAIL}
- WhatsApp: {WHATSAPP_DISPLAY} (Link: {WHATSAPP_LINK})
- Instagram: {INSTAGRAM}
- GitHub: {GITHUB}

Starter pricing:
- Chatbot: from $50
- Dashboard: from $40
- Small ML task: from $30
If asked about price, say it depends on scope and ask 1–2 short questions.
"""

BUSINESS_CONTEXT_AR = f"""
أنت مساعد ذكي لبورتفوليو أحمد محي.
كن مهذباً وواضحاً ومختصراً.

نبذة:
- خريج ذكاء اصطناعي – الجامعة البريطانية في مصر
- مهندس ذكاء اصطناعي | تعلم الآلة | تعلم عميق | متخصص CNN

الخدمات:
- شات بوت للمواقع
- تحليل بيانات ولوحات معلومات (CSV/Excel)
- نماذج تعلم آلة (تصنيف/تنبؤ)
- تصنيف صور باستخدام CNN

التواصل:
- البريد: {EMAIL}
- واتساب: {WHATSAPP_DISPLAY} (الرابط: {WHATSAPP_LINK})
- إنستجرام: {INSTAGRAM}
- GitHub: {GITHUB}

أسعار مبدئية:
- شات بوت: يبدأ من 50$
- داشبورد: يبدأ من 40$
- مهمة ML صغيرة: تبدأ من 30$
وعند سؤال السعر قل أنه يعتمد على التفاصيل واسأل سؤال/سؤالين للتوضيح.
"""

class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
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

            if not message:
                return self._send_json(400, {"reply": "Empty message."})

            api_key = os.environ.get("OPENAI_API_KEY")
            if not api_key:
                return self._send_json(500, {"reply": "OPENAI_API_KEY missing in Vercel Environment Variables."})

            client = OpenAI(api_key=api_key)
            system_context = BUSINESS_CONTEXT_AR if lang == "ar" else BUSINESS_CONTEXT_EN

            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_context},
                    {"role": "user", "content": message}
                ],
                temperature=0.4
            )

            reply = resp.choices[0].message.content
            return self._send_json(200, {"reply": reply})

        except Exception as e:
            return self._send_json(500, {"reply": f"Server error: {str(e)}"})
