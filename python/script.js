const messages = document.getElementById('messages');
const promptEl = document.getElementById('prompt');
const tempEl = document.getElementById('temp');
const sendBtn = document.getElementById('send');

function add(role, text){
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

sendBtn.onclick = async () => {
  const prompt = promptEl.value.trim();
  if (!prompt) return;
  add('user', prompt);
  promptEl.value = '';
  sendBtn.disabled = true;

  try{
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, temperature: Number(tempEl.value) })
    });
    const data = await res.json();
    add(data.success ? 'assistant' : 'assistant', data.response || data.error);
  }catch(e){
    add('assistant', String(e));
  } finally {
    sendBtn.disabled = false;
  }
};
