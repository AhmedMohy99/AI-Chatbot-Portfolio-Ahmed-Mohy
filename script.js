const chat = document.getElementById("chat");
const msg = document.getElementById("msg");
const send = document.getElementById("send");
const langBtn = document.getElementById("langBtn");

const UI = {
  en: {
    placeholder: "Type a message… (e.g., What services do you offer?)",
    send: "Send",
    welcome: "Hi! I’m Ahmed Mohy’s AI assistant. Ask me about services, pricing, or contact.",
    you: "You",
    bot: "Bot",
    tips: "Try: “What services do you offer?” • “How much does a chatbot cost?” • “How can I contact you?”"
  },
  ar: {
    placeholder: "اكتب رسالة… (مثال: ما هي الخدمات التي تقدمها؟)",
    send: "إرسال",
    welcome: "مرحباً! أنا مساعد أحمد محي. اسألني عن الخدمات والأسعار وطرق التواصل.",
    you: "أنت",
    bot: "المساعد",
    tips: "جرّب: “ما هي الخدمات التي تقدمها؟” • “كم تكلفة الشات بوت؟” • “كيف أتواصل معك؟”"
  }
};

function getLang(){ return localStorage.getItem("lang") || "en"; }
function setLang(lang){
  localStorage.setItem("lang", lang);
  document.body.classList.toggle("rtl", lang === "ar");
  langBtn.textContent = (lang === "ar") ? "EN" : "AR";
  msg.placeholder = UI[lang].placeholder;
  send.textContent = UI[lang].send;
  document.getElementById("tips").textContent = UI[lang].tips;
}

function getHistory(){
  try { return JSON.parse(localStorage.getItem("history") || "[]"); }
  catch { return []; }
}
function setHistory(h){ localStorage.setItem("history", JSON.stringify(h)); }

function addMessage(role, text){
  const lang = getLang();
  const wrap = document.createElement("div");
  wrap.className = `msg ${role}`;
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = role === "user" ? UI[lang].you : UI[lang].bot;
  const body = document.createElement("div");
  body.textContent = text;
  wrap.append(meta, body);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(){
  const text = msg.value.trim();
  if(!text) return;

  // Prevent people from typing API keys here
  if(text.toLowerCase().startsWith("sk-") || text.toUpperCase().startsWith("SK-")){
    addMessage("bot", "Don’t paste API keys in chat. Add it in Vercel → Settings → Environment Variables as OPENAI_API_KEY.");
    msg.value = "";
    return;
  }

  addMessage("user", text);
  msg.value = "";
  send.disabled = true;

  const history = getHistory();
  history.push({ role: "user", content: text });

  try{
    const lang = getLang();
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ message: text, lang, history })
    });

    const data = await res.json();
    const reply = data.reply || "No reply.";
    addMessage("bot", reply);

    history.push({ role: "assistant", content: reply });
    setHistory(history.slice(-20)); // keep last 20 messages

  }catch(e){
    addMessage("bot", "Network error. Check Vercel logs.");
  }finally{
    send.disabled = false;
    msg.focus();
  }
}

send.addEventListener("click", sendMessage);
msg.addEventListener("keydown", (e)=>{ if(e.key === "Enter") sendMessage(); });

langBtn.addEventListener("click", ()=>{
  const current = getLang();
  setLang(current === "en" ? "ar" : "en");
});

// init
setLang(getLang());
addMessage("bot", UI[getLang()].welcome);
