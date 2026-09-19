import json
import os
from http.server import BaseHTTPRequestHandler
from openai import OpenAI

class handler(BaseHTTPRequestHandler):
    def _send(self, payload, status=200):
        body=json.dumps(payload,ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Cache-Control','no-store')
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            n=int(self.headers.get('Content-Length','0'))
            data=json.loads(self.rfile.read(n).decode('utf-8'))
            business=str(data.get('business','')).strip()[:3000]
            website=str(data.get('website','')).strip()[:1000]
            language='Arabic' if data.get('language')=='ar' else 'English'
            if not business: return self._send({'error':'Business description is required.'},400)
            key=os.environ.get('OPENAI_API_KEY','').strip()
            if not key: return self._send({'error':'OPENAI_API_KEY is not configured.'},503)
            client=OpenAI(api_key=key,timeout=25.0,max_retries=1)
            prompt=('Create a practical marketing blueprint. Business: '+business+' Website: '+(website or 'not provided')+' Language: '+language+' Return ONLY valid JSON with exactly these keys: strategy, contentPlan, seo, geoVisibility, metaCampaign, googleCampaign. Each value must contain summary, priorities array of 3 strings, and actions array of 4 strings. Do not invent traffic, revenue, rankings, customers, awards, or performance results. For SEO/GEO give checks and opportunities, not claims of an audit. Meta/Google are draft ideas, not guarantees.')
            response=client.responses.create(model=os.environ.get('OPENAI_MODEL','gpt-5.6-luna'),instructions='You are a careful digital marketing strategist. Output strict JSON only.',input=prompt)
            raw=(response.output_text or '').strip().replace('```json','').replace('```','').strip()
            return self._send({'blueprint':json.loads(raw)})
        except json.JSONDecodeError: return self._send({'error':'The AI returned invalid JSON.'},502)
        except Exception: return self._send({'error':'Blueprint generation is temporarily unavailable.'},500)