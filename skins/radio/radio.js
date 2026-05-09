// radio.js — radio skin
(function radioMount() {
  const mount = document.getElementById('skin-mount');
  if (!mount) return;

  mount.innerHTML = `
<div id="radio-card" class="p-radio">
  <div class="ph ph-row1">
    <img class="oz-model-icon" src="skins/radio/radio-icon.png" alt="radio" style="height:28px;width:auto">
    <span class="ph-title" style="color:#c8a060;font-family:ui-monospace,monospace;letter-spacing:2px">radio</span>
    <div class="coder-jewels">
      <div class="coder-jewel cj-r" id="radio-jsr"></div>
      <div class="coder-jewel cj-a" id="radio-jsa"></div>
      <div class="coder-jewel cj-g" id="radio-jsg"></div>
    </div>
    <button class="bot-stop" id="radio-stop" style="display:none">⏹</button>
  </div>
  <img class="radio-top-img" src="skins/radio/radio-top.png" alt="">
  <div class="radio-rails-wrap">
    <div class="radio-display-bar"></div>
    <div id="radio-msgs" class="radio-msgs"></div>
    <div class="radio-btn-bar">
      <span class="rbb-left">[talk]</span>
      <span class="rbb-right">[send]</span>
    </div>
  </div>
  <div class="radio-buttons-wrap">
    <img class="radio-buttons-img" src="skins/radio/radio-buttons.png" alt="">
    <div class="rbw-dish" id="rbw-dish" title="keyboard">
      <span class="rbw-bg">📡</span>
    </div>
    <div class="rbw-dial" id="rbw-dial"></div>
    <div class="rbw-sq" id="radio-send" title="send">
      <span class="rbw-bg">▲</span>
    </div>
  </div>
  <div class="radio-input-tray" id="radio-input-tray" style="display:none">
    <textarea id="radio-input" class="bot-input" placeholder="transmit..." rows="1"></textarea>
  </div>
  <img class="radio-speaker-img" src="skins/radio/radio-speaker.png" alt="">
</div>`;

  // dish toggles input tray
  document.getElementById('rbw-dish').addEventListener('click', () => {
    const tray = document.getElementById('radio-input-tray');
    const open = tray.style.display !== 'none' && tray.style.display !== '';
    tray.style.display = open ? 'none' : 'flex';
    if (!open) document.getElementById('radio-input').focus();
  });

  toto.mount({
    skinId:  'radio',
    cardId:  'radio-card',
    msgsId:  'radio-msgs',
    inputId: 'radio-input',
    sendId:  'radio-send',
    stopId:  'radio-stop',
  });
})();
