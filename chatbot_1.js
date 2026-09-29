// ── Saffron Market AI Chatbot — powered by Claude ──
// Drop <script src="chatbot.js"></script> before </body> on any page

(function() {

const SYSTEM_PROMPT = `You are Pari (پری), the friendly AI assistant for Saffron Market — a family-owned Persian and Middle Eastern grocery chain in Greater Vancouver, BC, Canada. Founded in 1996. You speak English and Persian (Farsi).

ABOUT SAFFRON MARKET:
- 10 locations: Broadway/Kitsilano, Kingsway/Burnaby, Marine Dr/West Van (closes 8:30pm), Commercial Drive, Marine Dr/North Van (closes 10pm), Prince Edward/South Van, Main St, Lonsdale/North Van (largest & newest), Port Coquitlam, Warehouse Vancouver (closes 5pm)
- Phone: (604) 555-0142 | Email: hello@example.com
- Hours: Most branches open 9am–9pm daily
- Slogan: "Eat Well, Save Money."
- Tagline in Persian: سوپرمارکت زعفران | Spanish: el mercado azafrán | Chinese: 藏红花市场

PRODUCTS WE CARRY:
- Halal meat (lamb, beef, chicken, kabob mix)
- Persian rice varieties (basmati, long grain)
- Fresh herbs (mint, dill, parsley, fenugreek)
- Dairy (feta in brine, kashk, thick yogurt, doogh, halloumi)
- Bread (sangak baked daily, lavash, barbari)
- Spices (premium saffron, turmeric, advieh, rose petals, rose water)
- Sweets (baklava, gaz/Persian nougat, Mazafati dates, wild honey)
- Teas (Persian black tea from Lahijan, pomegranate juice, doogh)
- Pickles (torshi liteh, pomegranate paste, kashk-e bademjan)
- Nuts & dried fruit (pistachios, walnuts, barberries/zereshk, dried apricots)
- Fresh produce (Persian mini cucumbers, vine tomatoes, local BC greens)

STAFF DISCOUNT: $500/month limit. Resets on 1st of each month.

LOYALTY POINTS: Customers earn 10 points per $1 spent. Tiers: Silver (500pts), Gold (1000pts), Platinum (5000pts — 3× points).

CULTURAL EVENTS WE CELEBRATE: Nowruz (Mar 20), Shab-e Yalda (Dec 21), Mehregan (Oct 2), Eid al-Fitr, Eid al-Adha, and multicultural events year-round.

YOUR PERSONALITY:
- Warm, helpful, and knowledgeable about Persian culture and food
- Keep replies short and friendly (2–4 sentences max unless asking for detail)
- If someone writes in Persian/Farsi, reply in Persian
- Use occasional food emojis to be friendly 🌿🍞🧀
- If you don't know something specific (like exact current prices or today's inventory), suggest they call (604) 555-0142 or visit their nearest branch
- Never make up store hours — always direct to the branches page for accuracy
- You can help with: product questions, recipes using our ingredients, branch locations, events, loyalty points, staff discounts, ordering info`;

let chatHistory = [];
let isOpen = false;
let isTyping = false;

// ── Inject CSS ──
const style = document.createElement('style');
style.textContent = `
#pf-chat-btn {
  position: fixed; bottom: 28px; right: 28px; z-index: 999;
  width: 58px; height: 58px; border-radius: 50%;
  background: linear-gradient(135deg, #1B5E35, #25A865);
  border: none; cursor: pointer; box-shadow: 0 6px 24px rgba(27,94,53,0.45);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; transition: all 0.3s ease;
  animation: chatPulse 3s infinite;
}
#pf-chat-btn:hover { transform: scale(1.1); box-shadow: 0 8px 32px rgba(27,94,53,0.6); }
@keyframes chatPulse {
  0%,100% { box-shadow: 0 6px 24px rgba(27,94,53,0.45); }
  50% { box-shadow: 0 6px 32px rgba(27,94,53,0.7), 0 0 0 8px rgba(27,94,53,0.1); }
}
#pf-chat-btn .notif-dot {
  position: absolute; top: 2px; right: 2px;
  width: 14px; height: 14px; background: #E8A020;
  border-radius: 50%; border: 2px solid white;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; color: #1A1008;
}
#pf-chat-window {
  position: fixed; bottom: 100px; right: 28px; z-index: 998;
  width: 360px; max-width: calc(100vw - 40px);
  height: 520px; max-height: calc(100vh - 130px);
  background: white; border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.1);
  display: flex; flex-direction: column; overflow: hidden;
  transform: scale(0.8) translateY(20px); opacity: 0;
  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  pointer-events: none;
}
#pf-chat-window.open {
  transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
}
.pf-chat-header {
  background: linear-gradient(135deg, #1B5E35, #0F1A0F);
  padding: 16px 18px; display: flex; align-items: center; gap: 12px;
  border-bottom: 2px solid #E8A020;
}
.pf-chat-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #E8A020, #F5C842);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.pf-chat-header-info { flex: 1; }
.pf-chat-name { font-size: 14px; font-weight: 700; color: white; font-family: 'Outfit', sans-serif; }
.pf-chat-status { font-size: 11px; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 4px; }
.pf-chat-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #4CAF50; display: inline-block; }
.pf-chat-close {
  background: rgba(255,255,255,0.1); border: none; color: white;
  width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
  font-size: 16px; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.pf-chat-close:hover { background: rgba(255,255,255,0.2); }
.pf-chat-messages {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
  background: #F5F3EE;
  scrollbar-width: thin; scrollbar-color: #ddd transparent;
}
.pf-chat-messages::-webkit-scrollbar { width: 4px; }
.pf-chat-messages::-webkit-scrollbar-track { background: transparent; }
.pf-chat-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
.pf-msg { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.5; font-family: 'Outfit', sans-serif; word-break: break-word; }
.pf-msg-bot { background: white; color: #1A1008; border-radius: 14px 14px 14px 4px; align-self: flex-start; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
.pf-msg-user { background: #1B5E35; color: white; border-radius: 14px 14px 4px 14px; align-self: flex-end; }
.pf-msg-fa { direction: rtl; text-align: right; font-size: 14px; }
.pf-typing { display: flex; gap: 5px; padding: 12px 16px; background: white; border-radius: 14px 14px 14px 4px; align-self: flex-start; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
.pf-typing span { width: 7px; height: 7px; background: #1B5E35; border-radius: 50%; animation: pfBounce 1.2s infinite; opacity: 0.4; }
.pf-typing span:nth-child(2) { animation-delay: 0.2s; }
.pf-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes pfBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-6px);opacity:1} }
.pf-quick-btns { padding: 8px 16px; display: flex; gap: 6px; flex-wrap: wrap; background: white; border-top: 1px solid #f0e8d8; }
.pf-quick-btn {
  background: #FDF6E3; border: 1px solid rgba(200,160,60,0.3);
  border-radius: 20px; padding: 5px 12px; font-size: 11px; font-weight: 600;
  color: #5C4A2A; cursor: pointer; font-family: 'Outfit', sans-serif;
  transition: all 0.2s; white-space: nowrap;
}
.pf-quick-btn:hover { background: #1B5E35; color: white; border-color: #1B5E35; }
.pf-chat-input-row {
  padding: 12px 16px; background: white; border-top: 1px solid #f0e8d8;
  display: flex; gap: 8px; align-items: center;
}
.pf-chat-input {
  flex: 1; border: 1.5px solid rgba(200,160,60,0.3); border-radius: 25px;
  padding: 9px 16px; font-size: 13px; outline: none; font-family: 'Outfit', sans-serif;
  background: #FDF6E3; color: #1A1008; transition: border-color 0.2s;
}
.pf-chat-input:focus { border-color: #1B5E35; }
.pf-chat-input::placeholder { color: #aaa; }
.pf-send-btn {
  width: 38px; height: 38px; background: #1B5E35; border: none; border-radius: 50%;
  color: white; font-size: 16px; cursor: pointer; display: flex; align-items: center;
  justify-content: center; transition: all 0.2s; flex-shrink: 0;
}
.pf-send-btn:hover { background: #25A865; transform: scale(1.05); }
.pf-send-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
`;
document.head.appendChild(style);

// ── Inject HTML ──
const chatHTML = `
<button id="pf-chat-btn" onclick="pfToggleChat()" title="Chat with Pari — AI assistant">
  🌿
  <span class="notif-dot">1</span>
</button>
<div id="pf-chat-window">
  <div class="pf-chat-header">
    <div class="pf-chat-avatar">🌺</div>
    <div class="pf-chat-header-info">
      <div class="pf-chat-name">Pari — پری</div>
      <div class="pf-chat-status">AI Assistant · Saffron Market</div>
    </div>
    <button class="pf-chat-close" onclick="pfToggleChat()">✕</button>
  </div>
  <div class="pf-chat-messages" id="pfChatMessages">
    <div class="pf-msg pf-msg-bot">سلام! Hi! I'm <strong>Pari</strong> 🌺 — your Saffron Market assistant.<br><br>I can help with products, branches, hours, recipes, loyalty points, and more. What can I help you with? 😊</div>
  </div>
  <div class="pf-quick-btns">
    <button class="pf-quick-btn" onclick="pfQuick('Where is the nearest branch?')">📍 Branches</button>
    <button class="pf-quick-btn" onclick="pfQuick('What are your hours?')">🕘 Hours</button>
    <button class="pf-quick-btn" onclick="pfQuick('Tell me about loyalty points')">⭐ Points</button>
    <button class="pf-quick-btn" onclick="pfQuick('What halal meat do you carry?')">🥩 Halal meat</button>
    <button class="pf-quick-btn" onclick="pfQuick('Do you have saffron?')">🌺 Saffron</button>
    <button class="pf-quick-btn" onclick="pfQuick('چه محصولاتی دارید؟')">🇮🇷 فارسی</button>
  </div>
  <div class="pf-chat-input-row">
    <input class="pf-chat-input" id="pfChatInput" placeholder="Ask me anything… or بپرس!" onkeydown="if(event.key==='Enter')pfSend()">
    <button class="pf-send-btn" id="pfSendBtn" onclick="pfSend()">➤</button>
  </div>
</div>`;

const wrapper = document.createElement('div');
wrapper.innerHTML = chatHTML;
document.body.appendChild(wrapper);

// ── Functions ──
window.pfToggleChat = function() {
  isOpen = !isOpen;
  document.getElementById('pf-chat-window').classList.toggle('open', isOpen);
  // Remove notif dot on first open
  const dot = document.querySelector('#pf-chat-btn .notif-dot');
  if (dot) dot.remove();
  if (isOpen) setTimeout(() => document.getElementById('pfChatInput').focus(), 300);
};

window.pfQuick = function(text) {
  document.getElementById('pfChatInput').value = text;
  pfSend();
};

window.pfSend = async function() {
  const input = document.getElementById('pfChatInput');
  const msg = input.value.trim();
  if (!msg || isTyping) return;

  input.value = '';
  isTyping = true;
  document.getElementById('pfSendBtn').disabled = true;

  // Add user message
  pfAddMsg(msg, 'user');

  // Add to history
  chatHistory.push({ role: 'user', content: msg });

  // Show typing indicator
  const typingEl = document.createElement('div');
  typingEl.className = 'pf-typing';
  typingEl.innerHTML = '<span></span><span></span><span></span>';
  typingEl.id = 'pfTyping';
  document.getElementById('pfChatMessages').appendChild(typingEl);
  pfScrollBottom();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: chatHistory.slice(-10) // keep last 10 turns for context
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Sorry, I couldn't connect right now. Please call us at (604) 555-0142! 😊";

    // Remove typing
    document.getElementById('pfTyping')?.remove();

    // Add bot reply
    pfAddMsg(reply, 'bot');
    chatHistory.push({ role: 'assistant', content: reply });

  } catch (err) {
    document.getElementById('pfTyping')?.remove();
    pfAddMsg("Sorry, I'm having trouble connecting right now. You can always reach us at (604) 555-0142 or hello@example.com 🌿", 'bot');
  }

  isTyping = false;
  document.getElementById('pfSendBtn').disabled = false;
  document.getElementById('pfChatInput').focus();
};

function pfAddMsg(text, type) {
  const msgs = document.getElementById('pfChatMessages');
  const div = document.createElement('div');
  const isFarsi = /[\u0600-\u06FF]/.test(text) && type === 'bot';
  div.className = `pf-msg pf-msg-${type}${isFarsi ? ' pf-msg-fa' : ''}`;
  // Render line breaks
  div.innerHTML = text.replace(/\n/g, '<br>');
  msgs.appendChild(div);
  pfScrollBottom();
}

function pfScrollBottom() {
  const msgs = document.getElementById('pfChatMessages');
  msgs.scrollTop = msgs.scrollHeight;
}

})();
