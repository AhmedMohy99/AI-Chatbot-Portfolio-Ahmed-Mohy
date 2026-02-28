import os
import json
from http.server import BaseHTTPRequestHandler
import openai

OWNER_NAME = "Ahmed Mohy"
EMAIL = "Ahmed171684@gmail.com"
WHATSAPP = "01016286261"
WHATSAPP_LINK = "https://wa.me/201016286261"
INSTAGRAM = "https://www.instagram.com/ahmed.abdrabboo/"
GITHUB = "https://github.com/AhmedMohy99"
LINKEDIN = "https://www.linkedin.com/in/ahmed-mohy-83b447220/"

def faq_reply(text: str, lang: str) -> str:
    t = text.lower()

    # Pricing detection FIRST (important)
    if any(k in t for k in ["price", "cost", "how much", "pricing", "سعر", "تكلفة", "كم", "بكام"]):
        if lang == "ar":
            return (
                "💰 الأسعار المبدئية:\n"
                "• شات بوت: يبدأ من 50$\n"
                "• داشبورد بيانات: يبدأ من 40$\n"
                "• مهمة ML صغيرة: تبدأ من 30$\n\n"
                "لتحديد السعر بدقة:\n"
                "1) ما الهدف من المشروع؟\n"
                "2) ما هي البيانات المتاحة؟\n"
                "3) ما هو الموعد النهائي؟"
            )
        return (
            "💰 Starter pricing:\n"
            "• Chatbot: from $50\n"
            "• Data dashboard: from $40\n"
            "• Small ML task: from $30\n\n"
            "To confirm exact price:\n"
            "1) What is the goal?\n"
            "2) What data do you have?\n"
            "3) What is the deadline?"
        )

    # Services
    if any(k in t for k in ["service", "offer", "do you do", "خدمة", "الخدمات", "بتقدم", "تقدم"]):
        if lang == "ar":
            return (
                "🤖 الخدمات:\n"
                "• شات بوت للمواقع\n"
                "• تحليل بيانات ولوحات معلومات\n"
                "• نماذج تعلم آلة\n"
                "• تصنيف صور باستخدام CNN"
            )
        return (
            "🤖 Services:\n"
            "• Website AI Chatbots\n"
            "• Data Analysis Dashboards\n"
            "• Machine Learning Models\n"
            "• CNN Image Classification"
        )

    # Contact
    if any(k in t for k in ["contact", "email", "whatsapp", "instagram", "github", "linkedin", "تواصل", "واتساب", "بريد", "لينكد"]):
        if lang == "ar":
            return (
                f"📩 البريد: {EMAIL}\n"
                f"📱 واتساب: {WHATSAPP}\n"
                f"🔗 لينكدإن: {LINKEDIN}"
            )
        return (
            f"📩 Email: {EMAIL}\n"
            f"📱 WhatsApp: {WHATSAPP}\n"
            f"🔗 LinkedIn: {LINKEDIN}"
        )

    # Default
    return (
        "مرحباً 👋 اسألني عن الخدمات أو الأسعار أو التواصل."
        if lang == "ar"
        else "Hi 👋 Ask me about services, pricing, or contact."
    )

class handler(BaseHTTPRequestHandler):
    def _send(self, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length).decode("utf-8")
            data = json.loads(raw)

            message = data.get("message", "")
            lang = data.get("lang", "en")

            api_key = os.environ.get("OPENAI_API_KEY", "").strip()

            # If no key -> FAQ mode
            if not api_key:
                return self._send({"reply": faq_reply(message, lang), "mode": "faq"})

            # AI mode
            openai.api_key = api_key
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"You are {OWNER_NAME}'s professional portfolio assistant."},
                    {"role": "user", "content": message}
                ],
                temperature=0.4
            )

            reply = response["choices"][0]["message"]["content"]
            return self._send({"reply": reply, "mode": "ai"})

        except Exception:
            return self._send({"reply": faq_reply(message, lang), "mode": "faq"})
