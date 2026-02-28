import os
import json
from http.server import BaseHTTPRequestHandler
import openai

OWNER_NAME = "Ahmed Mohy"
EMAIL = "Ahmed171684@gmail.com"
WHATSAPP_DISPLAY = "01016286261"
WHATSAPP_LINK = "https://wa.me/201016286261"
INSTAGRAM = "https://www.instagram.com/ahmed.abdrabboo/"
GITHUB = "https://github.com/AhmedMohy99"
LINKEDIN = "https://www.linkedin.com/in/ahmed-mohy-83b447220/"

FAQ_EN = {
    "services": (
        "I offer:\n"
        "1) Website AI chatbot (customer support / FAQs)\n"
        "2) Data analysis dashboards (CSV/Excel → insights)\n"
        "3) Machine Learning models (classification/regression)\n"
        "4) CNN image classification\n"
    ),
    "pricing": (
        "Starter pricing (depends on scope):\n"
        "- Chatbot: from $50\n"
        "- Dashboard: from $40\n"
        "- Small ML task: from $30\n\n"
        "To confirm a price:\n"
        "1) What is the goal?\n"
        "2) What data do you have?\n"
        "3) Deadline?\n"
    ),
    "contact": (
        f"Email: {EMAIL}\n"
        f"WhatsApp: {WHATSAPP_DISPLAY}\n"
        f"WhatsApp link: {WHATSAPP_LINK}\n"
        f"Instagram: {INSTAGRAM}\n"
        f"GitHub: {GITHUB}\n"
        f"LinkedIn: {LINKEDIN}\n"
    ),
    "about": (
        "Ahmed Mohy is an Artificial Intelligence graduate from The British University in Egypt.\n"
        "He specializes in Machine Learning, Deep Learning, and CNN."
    )
}

FAQ_AR = {
    "services": (
        "الخدمات:\n"
        "1) شات بوت للمواقع (دعم عملاء / أسئلة شائعة)\n"
        "2) داشبورد وتحليل بيانات (CSV/Excel)\n"
        "3) نماذج تعلم آلة (تصنيف/تنبؤ)\n"
        "4) تصنيف صور باستخدام CNN\n"
    ),
    "pricing": (
        "أسعار مبدئية (حسب تفاصيل المشروع):\n"
        "- شات بوت: يبدأ من 50$\n"
        "- داشبورد: يبدأ من 40$\n"
        "- مهمة ML صغيرة: تبدأ من 30$\n\n"
        "لتأكيد السعر:\n"
        "1) ما هو الهدف؟\n"
        "2) ما هي البيانات المتاحة؟\n"
        "3) ما هو الموعد النهائي؟\n"
    ),
    "contact": (
        f"البريد: {EMAIL}\n"
        f"واتساب: {WHATSAPP_DISPLAY}\n"
        f"رابط واتساب: {WHATSAPP_LINK}\n"
        f"إنستجرام: {INSTAGRAM}\n"
        f"GitHub: {GITHUB}\n"
        f"LinkedIn: {LINKEDIN}\n"
    ),
    "about": (
        "أحمد محي خريج ذكاء اصطناعي من الجامعة البريطانية في مصر.\n"
        "متخصص في تعلم الآلة، التعلم العميق، و CNN."
    )
}

def faq_reply(user_text: str, lang: str) -> str:
    text = (user_text or "").lower()
    bank = FAQ_AR if lang == "ar" else FAQ_EN

    if any(k in text for k in ["service", "services", "offer", "do you do", "خدمة", "الخدمات", "بتقدم", "تقدم"]):
        return bank["services"]
    if any(k in text for k in ["price", "pricing", "cost", "how much", "سعر", "تكلفة", "بكام", "كم"]):
        return bank["pricing"]
    if any(k in text for k in ["contact", "email", "whatsapp", "instagram", "github", "linkedin", "تواصل", "واتساب", "بريد", "انستجرام", "لينكدإن"]):
        return bank["contact"]
    if any(k in text for k in ["who are you", "about", "bio", "نبذة", "من انت", "مين", "تعريف"]):
        return bank["about"]

    return (
        "مرحباً! اسألني عن الخدمات أو الأسعار أو التواصل."
        if lang == "ar"
        else "Hi! Ask me about services, pricing, or contact."
    )

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
            history = data.get("history") or []

            if not message:
                return self._send_json(400, {"reply": "Empty message.", "mode": "faq"})

            api_key = os.environ.get("OPENAI_API_KEY", "").strip()

            # ✅ No key => FAQ mode
            if not api_key:
                return self._send_json(200, {"reply": faq_reply(message, lang), "mode": "faq"})

            # Try AI mode
            openai.api_key = api_key
            system_context = (
                f"You are {OWNER_NAME}'s professional portfolio assistant. Use facts only. Be concise."
                if lang != "ar"
                else f"أنت مساعد بورتفوليو {OWNER_NAME}. استخدم حقائق فقط وكن مختصراً."
            )

            messages = [{"role": "system", "content": system_context}]

            # Keep last 10 turns (20 messages) max
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
            return self._send_json(200, {"reply": reply, "mode": "ai"})

        except openai.error.AuthenticationError:
            # ✅ Invalid key => FAQ mode
            return self._send_json(200, {"reply": faq_reply("contact", lang), "mode": "faq"})
        except Exception:
            # ✅ Any other error => FAQ mode
            return self._send_json(200, {"reply": faq_reply(message, lang), "mode": "faq"})
