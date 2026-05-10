// phone.js — phone chat skin
(function phoneMount() {
  const mount = document.getElementById('skin-mount');
  if (!mount) return;

  mount.innerHTML = `
<div id="phone-card" class="p-phone">
  <div class="ph ph-row1">
    <img src="skins/phone/chat.png" class="oz-model-icon" alt="chat" style="height:28px;width:auto;border-radius:4px">
    <span class="ph-title" style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-weight:600;color:#e0d0ff">phone</span>
    <div class="coder-jewels">
      <div class="coder-jewel cj-r" id="phone-jsr"></div>
      <div class="coder-jewel cj-a" id="phone-jsa"></div>
      <div class="coder-jewel cj-g" id="phone-jsg"></div>
    </div>
    <button class="bot-stop" id="phone-stop" style="display:none">⏹</button>
  </div>
  <img src="skins/phone/phone-purple.png" class="phone-frame-overlay" alt="">
  <div class="phone-body" id="phone-body">
    <div class="phone-msgs" id="phone-msgs"></div>
    <div class="phone-floor" onclick="event.stopPropagation()">
      <textarea class="phone-input-field" id="phone-input" placeholder="message..." rows="1"></textarea>
      <button class="phone-send-btn" id="phone-send">↑</button>
    </div>
  </div>
</div>`;

  toto.mount({
    skinId:  'phone',
    cardId:  'phone-card',
    msgsId:  'phone-msgs',
    inputId: 'phone-input',
    sendId:  'phone-send',
    stopId:  'phone-stop',
  });

  // auto-expand textarea: 1 line → 4 lines → scroll
  const _pi = document.getElementById('phone-input');
  if (_pi) {
    const MAX_H = 168; // ~4 lines at 28px font * 1.4lh + padding
    _pi.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, MAX_H) + 'px';
    });
  }
})();
