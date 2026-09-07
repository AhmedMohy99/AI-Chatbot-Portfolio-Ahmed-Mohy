import json
import os
from http.server import BaseHTTPRequestHandler

from openai import OpenAI

OWNER_NAME = "Ahmed Mohy"
EMAIL = "Ahmed171684@gmail.com"
WHATSAPP = "01016286261"
WHATSAPP_LINK = "https://wa.me/201016286261"
INSTAGRAM = "https://www.instagram.com/ahmed.abdrabboo/"
GITHUB = "https://github.com/AhmedMohy99"
LINKEDIN = "https://www.linkedin.com/in/ahmed-mohy-83b447220/"
MODEL = os.environ.get("OPENAI_MODEL", "gpt-5.6-luna")


def faq_reply(text: str, lang: str) -> str:
    t = (text or "").lower()

    if any(k in t for k in ["price", "cost", "how much", "pricing", "سعر", "تكلفة", "كم", "بكام"]):
        if lang == "ar":
            return (
                "💰 الأسعار المبدئية:\n"
                "• Business Website: من 5,000 EGP\n"
                "• Online Store: من 12,000 EGP\n"
                "• Web Application: من 20,000 EGP\n"
                "• Mobile App MVP: من 35,000 EGP\n"
                "• Landing Page: من 4,000 EGP\n"
                "• Digital Marketing: من 3,500 EGP شهرياً\n\n"
                "السعر النهائي يعتمد على نطاق المشروع والمتطلبات."
            )
        return (
            "💰 Starting rates:\n"
            "• Business Website: from EGP 5,000\n"
            "• Online Store: from EGP 12,000\n"
            "• Web Application: from EGP 20,000\n"
            "• Mobile App MVP: from EGP 35,000\n"
            "• Landing Page: from EGP 4,000\n"
            "• Digital Marketing: from EGP 3,500/month\n\n"
            "Final pricing depends on project scope and requirements."
        )

    if any(k in t for k in ["service", "offer", "do you do", "خدمة", "الخدمات", "بتقدم", "تقدم"]):
        return (
            "🤖 الخدمات:\n• Websites & Web Apps\n• AI Chatbots & Automation\n• Shopify & WooCommerce\n• UI/UX & 3D\n• Data Analytics & Dashboards"
            if lang == "ar"
            else "🤖 Services:\n• Websites & Web Apps\n• AI Chatbots & Automation\n• Shopify & WooCommerce\n• UI/UX & 3D\n• Data Analytics & Dashboards"
        )

    if any(k in t for k in ["project", "projects", "work", "portfolio", "مشروع", "المشاريع", "أعمال"]):
        return (
            "🧩 الأعمال تشمل: We Wave Agency, LARO Cosmetics, Saffa Fashion, IRIS, SWAY Maverick, ZREX, UCYPTA, Elprof10 وRoyal Watch."
            if lang == "ar"
            else "🧩 Selected work includes We Wave Agency, LARO Cosmetics, Saffa Fashion, IRIS, SWAY Maverick, ZREX, UCYPTA, Elprof10 and Royal Watch."
        )

    if any(k in t for k in ["contact", "email", "whatsapp", "instagram", "github", "linkedin", "تواصل", "واتساب", "بريد", "لينكد"]):
        return (
            f"📩 البريد: {EMAIL}\n📱 واتساب: {WHATSAPP_LINK}\n📸 Instagram: {INSTAGRAM}\n🔗 LinkedIn: {LINKEDIN}\n💻 GitHub: {GITHUB}"
            if lang == "ar"
            else f"📩 Email: {EMAIL}\n📱 WhatsApp: {WHATSAPP_LINK}\n📸 Instagram: {INSTAGRAM}\n🔗 LinkedIn: {LINKEDIN}\n💻 GitHub: {GITHUB}"
        )

    return (
        "مرحباً 👋 اسألني عن الخدمات أو المشاريع أو الأسعار أو التواصل."
        if lang == "ar"
        else "Hi 👋 Ask me about services, projects, pricing, or contact."
    )


class handler(BaseHTTPRequestHandler):
    def _send(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        message = ""
        lang = "en"

        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 12000:
                return self._send({"reply": "Invalid request.", "mode": "faq"}, 400)

            data = json.loads(self.rfile.read(length).decode("utf-8"))
            message = str(data.get("message", "")).strip()[:2000]
            lang = "ar" if data.get("lang") == "ar" else "en"

            if not message:
                return self._send({"reply": faq_reply("", lang), "mode": "faq"})

            api_key = os.environ.get("OPENAI_API_KEY", "").strip()
            if not api_key:
                return self._send({"reply": faq_reply(message, lang), "mode": "faq"})

            client = OpenAI(api_key=api_key, timeout=10.0, max_retries=1)
            response = client.responses.create(
                model=MODEL,
                instructions=(
                    f"You are {OWNER_NAME}'s professional portfolio assistant. "
                    f"Answer in {'Arabic' if lang == 'ar' else 'English'}. Be concise and accurate. "
                    "Do not invent projects, results, prices, technologies or availability. "
                    "Services: websites, web apps, AI chatbots, RAG, automation, Shopify, WooCommerce, UI/UX, 3D and data analytics. "
                    "Selected projects: We Wave Agency, LARO Cosmetics, Saffa Fashion, IRIS, SWAY Maverick, ZREX, UCYPTA, Elprof10 and Royal Watch."
                ),
                input=message,
            )

            reply = (response.output_text or "").strip()[:4000]
            return self._send({"reply": reply or faq_reply(message, lang), "mode": "ai" if reply else "faq"})

        except Exception:
            return self._send({"reply": faq_reply(message, lang), "mode": "faq"})
