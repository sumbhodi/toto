// beach.js — dolphin / aquarium skin
(function beachMount() {
  const mount = document.getElementById('skin-mount');
  if (!mount) return;

  mount.innerHTML = `
<div id="beach-card" class="panel p-beach">
  <div id="dolphin-header" class="ph ph-row1">
    <svg class="oz-model-icon" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M3 16 Q7 10 15 12 Q21 13 25 9 L25 13 Q21 16 15 16 Q8 17 3 16Z" fill="#3898CC"/>
      <path d="M4 16 Q9 18 16 16.5 Q21 15.5 24.5 12 L25 13 Q21 16 15 16 Q8 17 4 16Z" fill="#70C0E0"/>
      <path d="M14 12 Q16 6 20 8 Q18.5 10.5 15 12Z" fill="#2878A8"/>
      <path d="M25 9 Q28 5 26.5 3 Q25.5 6 25 9Z" fill="#2878A8"/>
      <path d="M25 9 Q29 12 27.5 15 Q26 12.5 25 9Z" fill="#2878A8"/>
      <path d="M9 15 Q10 20 14 18 Q12.5 16.5 9 15Z" fill="#2878A8"/>
      <circle cx="6.5" cy="13.5" r="2" fill="#1A3A4A"/>
      <circle cx="6" cy="13" r="0.7" fill="rgba(255,255,255,0.7)"/>
    </svg>
    <span class="ph-title" style="color:#0a3a5a">dolphin</span>
    <div class="coder-jewels">
      <div class="coder-jewel cj-r" id="beach-jsr"></div>
      <div class="coder-jewel cj-a" id="beach-jsa"></div>
      <div class="coder-jewel cj-g" id="beach-jsg"></div>
    </div>
    <button class="bot-stop" id="beach-stop" style="display:none">⏹</button>
  </div>
  <div class="pb">
    <div id="beach-msgs"></div>
    <div id="beach-wave">
      <svg width="100%" height="100%" viewBox="0 0 400 28" preserveAspectRatio="none">
        <rect x="0" y="14" width="400" height="14" fill="#0f2e48"/>
        <path d="M0 14 Q30 4 60 14 Q90 24 120 12 Q150 2 180 12 Q210 22 240 10 Q270 0 300 12 Q330 22 360 10 Q385 2 400 10 L400 28 L0 28 Z" fill="#1e6090"/>
        <path d="M0 14 Q30 4 60 14 Q90 24 120 12 Q150 2 180 12 Q210 22 240 10 Q270 0 300 12 Q330 22 360 10 Q385 2 400 10" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>
    <div id="beach-floor" onclick="event.stopPropagation()">
      <textarea id="beach-input" class="bot-input" placeholder="talk to dolphin…" spellcheck="false"></textarea>
      <button id="beach-send" class="bot-send">send</button>
    </div>
  </div>
</div>`;

  toto.mount({
    skinId:  'beach',
    cardId:  'beach-card',
    msgsId:  'beach-msgs',
    inputId: 'beach-input',
    sendId:  'beach-send',
    stopId:  'beach-stop',
  });

})();
