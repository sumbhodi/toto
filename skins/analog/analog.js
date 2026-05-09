// analog.js — IBM mainframe / printer skin
(function analogMount() {
  const mount = document.getElementById('skin-mount');
  if (!mount) return;

  mount.innerHTML = `
<div id="analog-card" class="p-analog">
  <div class="ph ph-row1" id="analog-ph">
    <svg class="oz-model-icon" viewBox="0 0 24 28" width="24" height="28" fill="none">
      <line x1="12" y1="0" x2="12" y2="4" stroke="#8A9A80" stroke-width="1.5"/>
      <circle cx="12" cy="1.5" r="1.5" fill="#8A9A80"/>
      <rect x="5" y="4" width="14" height="10" rx="2" fill="#6A7A60" stroke="#8A9A80" stroke-width="0.8"/>
      <rect x="7" y="7" width="3" height="2" rx="1" fill="#FF9900" opacity="0.9"/>
      <rect x="14" y="7" width="3" height="2" rx="1" fill="#FF9900" opacity="0.9"/>
      <line x1="8" y1="11.5" x2="16" y2="11.5" stroke="#8A9A80" stroke-width="0.6"/>
      <rect x="10" y="14" width="4" height="2" fill="#5A6A50"/>
      <rect x="3" y="16" width="18" height="11" rx="2" fill="#5A6A50" stroke="#7A8A70" stroke-width="0.8"/>
      <rect x="7" y="18" width="10" height="6" rx="1" fill="#3A4A30" stroke="#6A7A60" stroke-width="0.5"/>
      <circle cx="9" cy="21" r="1" fill="#00CC44" opacity="0.8"/>
      <circle cx="12" cy="21" r="1" fill="#FF9900" opacity="0.6"/>
      <circle cx="15" cy="21" r="1" fill="#CC2200" opacity="0.5"/>
    </svg>
    <span class="ph-title analog-title">analog</span>
    <div class="coder-jewels">
      <div class="coder-jewel cj-r" id="analog-jsr"></div>
      <div class="coder-jewel cj-a" id="analog-jsa"></div>
      <div class="coder-jewel cj-g" id="analog-jsg"></div>
    </div>
    <button class="bot-stop" id="analog-stop" style="display:none">⏹</button>
  </div>
  <div class="analog-teeth"></div>
  <div class="analog-printer" id="analog-msgs"></div>
  <div class="analog-dock" onclick="event.stopPropagation()">
    <textarea id="analog-input" class="bot-input analog-input" placeholder="submit job…"></textarea>
    <button id="analog-send" class="bot-send analog-send">RUN</button>
  </div>
</div>`;

  toto.mount({
    skinId:  'analog',
    cardId:  'analog-card',
    msgsId:  'analog-msgs',
    inputId: 'analog-input',
    sendId:  'analog-send',
    stopId:  'analog-stop',
  });
})();
