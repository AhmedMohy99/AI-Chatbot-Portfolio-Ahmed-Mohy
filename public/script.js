let currentLang = "en";

function setLang(lang){
currentLang = lang;
}

function addMessage(text, sender){
const box = document.getElementById("chatbox");
const div = document.createElement("div");
div.innerHTML = "<b>" + sender + ":</b> " + text;
box.appendChild(div);
box.scrollTop = box.scrollHeight;
}

async function sendMessage(){
const input = document.getElementById("message");
const text = input.value;
if(!text) return;

addMessage(text, "You");
input.value = "";

const res = await fetch("/api/chat", {
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:text, lang:currentLang})
});

const data = await res.json();
addMessage(data.reply, "Bot");
}
