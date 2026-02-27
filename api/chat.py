import os
import json
from openai import OpenAI

OWNER_NAME = "Ahmed Mohy"
EMAIL = "Ahmed171684@gmail.com"
WHATSAPP_DISPLAY = "02 01016286261"
WHATSAPP_LINK = "https://wa.me/201016286261"
INSTAGRAM = "https://www.instagram.com/ahmed.abdrabboo/"
GITHUB = "https://github.com/AhmedMohy99"

BUSINESS_CONTEXT_EN = f"""
You are a helpful assistant for {OWNER_NAME}'s AI services portfolio.
Be polite and professional.

About:
- AI Graduate – British University in Egypt
- AI Engineer | ML | DL | CNN

Services:
- AI Chatbots
- Data Dashboards
- ML Models
- Image Classification

Contact:
Email: {EMAIL}
WhatsApp: {WHATSAPP_DISPLAY}
Instagram: {INSTAGRAM}
GitHub: {GITHUB}

Starter Pricing:
Chatbot from $50
Dashboard from $40
ML task from $30
"""

BUSINESS_CONTEXT_AR = f"""
أنت مساعد ذكي لموقع {OWNER_NAME}.
كن مهذباً وواضحاً.

الخدمات:
- شات بوت
- تحليل بيانات
- نماذج تعلم آلة
- تصنيف صور CNN

التواصل:
البريد: {EMAIL}
واتساب: {WHATSAPP_DISPLAY}
إنستجرام: {INSTAGRAM}
GitHub: {GITHUB}
"""

def handler(request):
    try:
        body = json.loads(request.get_body())
        message = body.get("message", "")
        lang = body.get("lang", "en")

        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

        context = BUSINESS_CONTEXT_AR if lang == "ar" else BUSINESS_CONTEXT_EN

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": message}
            ],
            temperature=0.4
        )

        reply = response.choices[0].message.content

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"reply": reply})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"reply": str(e)})
        }
