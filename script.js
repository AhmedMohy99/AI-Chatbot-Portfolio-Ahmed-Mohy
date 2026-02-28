const chat = document.getElementById("chat");
const msg = document.getElementById("msg");
const send = document.getElementById("send");
const langBtn = document.getElementById("langBtn");
const clearBtn = document.getElementById("clearBtn");
const modeText = document.getElementById("modeText");
const quick = document.getElementById("quick");

const UI = {
  en: {
    title: "Ahmed Mohy — AI Assistant",
    subtitle: "AI Engineer | Machine Learning | Deep Learning | CNN Specialist",
    placeholder: "Type your message...",
    send: "Send",
    clear: "Clear",
    modeAI: "Mode: AI",
    modeFAQ: "Mode: FAQ",
    you: "You",
    bot: "Bot",
    welcome: "Hi! I’m Ahmed Mohy’s assistant. Ask me about services, pricing, or contact.",
    quick: {
      services: "What services do you offer?",
      pricing: "How much does a chatbot cost?",
      contact: "How can I contact you?"
    }
  },
  ar: {
    title: "أحمد محي — مساعد ذكي",
    subtitle: "مهندس ذكاء اصطناعي | تعلم آلة | تعلم عميق | متخصص CNN",
    placeholder: "اكتب رسالتك...",
    send: "إرسال",
    clear: "مسح",
    modeAI: "الوضع: AI",
    modeFAQ: "الوضع: FAQ",
    you: "أنت",
    bot: "المساعد",
    welcome: "مرحباً! أنا مساعد أحمد محي. اسألني عن الخدمات أو الأسعار أو التواصل.",
    quick: {
      services: "ما هي الخدمات التي تقدمها؟",
      pricing: "كم تكلفة الشات بوت؟",
      contact: "كيف أتواصل معك؟"
    }
  }
};

function getLang(){ return localStorage.getItem("lang") || "en"; }
function setLang(lang){
  localStorage.setItem("lang", lang);
  document.body.classList.toggle("rtl", lang === "ar");
  document.documentElement.lang = lang;

  document.getElementById("title").textContent = UI[lang].title;
  document.getElementById("subtitle").textContent = UI[lang].subtitle;

  msg.placeholder = UI[lang].placeholder;
  send.textContent = UI[lang].send;
  clearBtn.textContent = UI[lang].clear;

  // toggle button shows the OTHER language
  langBtn.textContent = (lang === "ar") ? "EN" : "AR";

  // quick buttons text
  const btns = quick.querySelectorAll(".quickBtn");
  btns[0].textContent = UI[lang].quick.services;
  btns[1].textContent = UI[lang].quick.pricing;
  btns[2].textContent = UI[lang].quick.contact;

  // update mode label language only
  const currentMode = (modeText.dataset.mode || "faq");
  setMode(currentMode);
}

function setMode(mode){
  modeText.dataset.mode = mode;
  const lang = getLang();
  modeText.textContent = (mode === "ai") ? UI[lang].modeAI : UI[lang].modeFAQ;
}

function loadHistory(){
  try { return JSON.parse(localStorage.getItem("history") || "[]"); }
  catch { return []; }
}
function saveHistory(h){
  localStorage.setItem("history", JSON.stringify(h.slice(-20)));
}

function addBubble(role, text){
  const lang = getLang();
  const wrap = document.createElement("div");
  wrap.className = `bubble ${role}`;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = (role === "user") ? UI[lang].you : UI[lang].bot;

  const body = document.createElement("div");
  body.textContent = text;

  wrap.appendChild(meta);
  wrap.appendChild(body);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(textOverride=null){
  const text = (textOverride ?? msg.value).trim();
  if(!text) return;

  // don’t paste keys in chat
  if(text.toLowerCase().startsWith("sk-") || text.toUpperCase().startsWith("SK-")){
    addBubble("bot", "Don’t paste API keys here. Add OPENAI_API_KEY in Vercel → Settings → Environment Variables.");
    msg.value = "";
    return;
  }

  addBubble("user", text);
  msg.value = "";
  send.disabled = true;

  const lang = getLang();
  const history = loadHistory();
  history.push({ role: "user", content: text });

  try{
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ message: text, lang, history })
    });

    const data = await res.json();
    const reply = data.reply || "No reply.";
    addBubble("bot", reply);

    history.push({ role: "assistant", content: reply });
    saveHistory(history);

    setMode(data.mode || "faq");
  }catch(e){
    addBubble("bot", "Network error. Please check Vercel logs.");
    setMode("faq");
  }finally{
    send.disabled = false;
    msg.focus();
  }
}

function clearChat(){
  localStorage.removeItem("history");
  chat.innerHTML = "";
  addBubble("bot", UI[getLang()].welcome);
  setMode("faq");
}

// events
send.addEventListener("click", ()=>sendMessage());
msg.addEventListener("keydown", (e)=>{ if(e.key === "Enter") sendMessage(); });

langBtn.addEventListener("click", ()=>{
  const current = getLang();
  setLang(current === "en" ? "ar" : "en");
});

clearBtn.addEventListener("click", clearChat);

quick.addEventListener("click", (e)=>{
  const btn = e.target.closest(".quickBtn");
  if(!btn) return;
  const key = btn.dataset.q;
  const lang = getLang();
  const qText = UI[lang].quick[key] || btn.textContent;
  sendMessage(qText);
});

// init
setLang(getLang());
clearChat();
