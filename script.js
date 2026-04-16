const diceTypes = document.getElementById('diceTypes');
const diceStage = document.getElementById('diceStage');
const rollBtn = document.getElementById('rollBtn');
const resetBtn = document.getElementById('resetBtn');
const rollInfo = document.getElementById('rollInfo');
const historyList = document.getElementById('historyList');
const statsEl = document.getElementById('stats');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const qtyValue = document.getElementById('qtyValue');
 
let selectedFaces = 6;
let quantity = 1;
let isRolling = false;
let totalRolls = 0;
let totalSum = 0;
let rollCount = 0;
 
// Dice selection
diceTypes.addEventListener('click', e => {
  const btn = e.target.closest('.dice-btn');
  if (!btn) return;
  document.querySelectorAll('.dice-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedFaces = Number(btn.dataset.faces);
  resetStage();
});
 
// Quantity control
function updateQtyDisplay() {
  qtyValue.textContent = quantity;
  const label = document.querySelector('.qty-display');
  if (label) label.textContent = quantity + (quantity > 1 ? ' dés' : ' dé');
}
 
qtyMinus.addEventListener('click', () => {
  if (quantity > 1) {
    quantity--;
    updateQtyDisplay();
    resetStage();
    applyColors();
  }
});
 
qtyPlus.addEventListener('click', () => {
  if (quantity < 10) {
    quantity++;
    updateQtyDisplay();
    resetStage();
    applyColors();
  }
});
 
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
 
function resetStage() {
  if (quantity === 1) {
    diceStage.innerHTML = `
      <div class="dice-result" id="diceResult">
        <span class="result-value" id="resultValue">—</span>
      </div>`;
  } else {
    diceStage.innerHTML = '';
    for (let i = 0; i < quantity; i++) {
      const die = document.createElement('div');
      die.className = 'multi-die';
      die.style.opacity = '1';
      die.style.animation = 'none';
      die.textContent = '—';
      diceStage.appendChild(die);
    }
  }
  rollInfo.innerHTML = '';
}
 
function rollDice() {
  if (isRolling) return;
  isRolling = true;
  rollBtn.disabled = true;
 
  const results = [];
  const faces = selectedFaces;
 
  if (quantity === 1) {
    // Single die — animation rapide
    const diceResult = document.getElementById('diceResult') || diceStage.querySelector('.dice-result');
    const resultValue = diceResult?.querySelector('.result-value');
 
    diceResult.classList.remove('landed', 'crit', 'fail');
    diceResult.classList.add('rolling');
    rollInfo.innerHTML = '<span style="color:var(--gold-dim)">Lancer en cours…</span>';
 
    let ticks = 0;
    const interval = setInterval(() => {
      if (resultValue) resultValue.textContent = randomInt(1, faces);
      ticks++;
      if (ticks >= 14) {
        clearInterval(interval);
        const result = randomInt(1, faces);
        results.push(result);
        if (resultValue) resultValue.textContent = result;
        diceResult.classList.remove('rolling');
 
        const isCrit = result === faces;
        const isFail = result === 1;
        if (isCrit) diceResult.classList.add('landed', 'crit');
        else if (isFail) diceResult.classList.add('landed', 'fail');
        else diceResult.classList.add('landed');
 
        let infoHtml = '';
        if (isCrit) infoHtml = `<span class="crit-msg">⚡ Critique ! Maximum atteint !</span>`;
        else if (isFail) infoHtml = `<span class="fail-msg">💀 Échec critique !</span>`;
        else infoHtml = `Résultat : <span class="total">${result}</span> sur d${faces}`;
        rollInfo.innerHTML = infoHtml;
 
        finishRoll(results, faces);
      }
    }, 55);
 
  } else {
    // Multi dice
    const dice = diceStage.querySelectorAll('.multi-die');
    rollInfo.innerHTML = '<span style="color:var(--gold-dim)">Lancer en cours…</span>';
 
    let ticks = 0;
    const interval = setInterval(() => {
      dice.forEach(d => { d.textContent = randomInt(1, faces); });
      ticks++;
      if (ticks >= 14) {
        clearInterval(interval);
        let sum = 0;
        dice.forEach((d, idx) => {
          const r = randomInt(1, faces);
          results.push(r);
          sum += r;
          d.textContent = r;
          d.style.opacity = '1';
          d.style.animation = `popIn 0.3s ease ${idx * 0.07}s forwards`;
          if (r === faces) d.style.color = 'var(--green)';
          else if (r === 1) d.style.color = 'var(--red)';
          else d.style.color = textColor || 'var(--gold-light)';
        });
 
        rollInfo.innerHTML = `Total : <span class="total">${sum}</span> (${quantity}d${faces} — moy. ${(sum/quantity).toFixed(1)})`;
        finishRoll(results, faces);
      }
    }, 55);
  }
}
 
function finishRoll(results, faces) {
  const sum = results.reduce((a, b) => a + b, 0);
  totalRolls++;
  totalSum += sum;
  rollCount++;
 
  // Add to history
  const li = document.createElement('li');
  li.className = 'history-item';
 
  const isCrit = results.length === 1 && results[0] === faces;
  const isFail = results.length === 1 && results[0] === 1;
  if (isCrit) li.classList.add('crit');
  if (isFail) li.classList.add('fail');
 
  const label = results.length > 1
    ? `${results.length}d${faces} → [${results.join(', ')}]`
    : `d${faces}`;
 
  const badge = isCrit ? ' ⚡' : isFail ? ' 💀' : '';
 
  li.innerHTML = `
    <span class="history-item__label">Jet #${rollCount} — ${label}${badge}</span>
    <span class="history-item__result">${sum}</span>`;
 
  historyList.prepend(li);
  while (historyList.children.length > 12) {
    historyList.removeChild(historyList.lastChild);
  }
 
  updateStats(faces);
 
  isRolling = false;
  rollBtn.disabled = false;
}
 
function updateStats(faces) {
  const avg = totalRolls > 0 ? (totalSum / totalRolls).toFixed(1) : '—';
  statsEl.innerHTML = `
    <div class="stat-card">
      <div class="stat-card__label">JETS</div>
      <div class="stat-card__value">${rollCount}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__label">TOTAL</div>
      <div class="stat-card__value">${totalSum}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__label">MOYENNE</div>
      <div class="stat-card__value">${avg}</div>
    </div>`;
}
 
function resetAll() {
  totalRolls = 0;
  totalSum = 0;
  rollCount = 0;
  rollInfo.innerHTML = '';
  historyList.innerHTML = '';
  statsEl.innerHTML = '';
  resetStage();
}
 
rollBtn.addEventListener('click', rollDice);
resetBtn.addEventListener('click', resetAll);
 
// Keyboard shortcut
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !isRolling) { e.preventDefault(); rollDice(); }
  if (e.code === 'KeyR') resetAll();
});
 
// ── COLOR PICKER ──
let diceColor = '#c9a84c';
let textColor = '#0a0e1a';
 
function applyColors() {
  document.documentElement.style.setProperty('--dice-color', diceColor);
  document.documentElement.style.setProperty('--dice-text-color', textColor);
 
  // Dé simple
  document.querySelectorAll('.dice-result').forEach(el => {
    el.style.borderColor = diceColor;
    el.style.boxShadow = `0 0 20px ${diceColor}44`;
    el.style.background = diceColor + '15';
  });
  document.querySelectorAll('.result-value').forEach(el => {
    el.style.color = textColor;
  });
 
  // Multi dés
  document.querySelectorAll('.multi-die').forEach(el => {
    el.style.color = textColor;
    el.style.background = diceColor + '22';
    el.style.borderColor = diceColor + '88';
  });
 
  // Bouton lancer
  const rollBtnEl = document.getElementById('rollBtn');
  if (rollBtnEl) {
    rollBtnEl.style.background = `linear-gradient(135deg, ${diceColor} 0%, ${diceColor}bb 100%)`;
    rollBtnEl.style.color = isColorDark(diceColor) ? '#ffffff' : '#1a1200';
  }
}
 
function isColorDark(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
}
 
function setupColorPicker(containerId, inputId, colorSetter) {
  const container = document.getElementById(containerId);
  const input = document.getElementById(inputId);
 
  container.addEventListener('click', e => {
    const btn = e.target.closest('.color-preset');
    if (!btn) return;
    container.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    colorSetter(btn.dataset.color);
    input.value = btn.dataset.color;
    applyColors();
  });
 
  input.addEventListener('input', e => {
    container.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
    colorSetter(e.target.value);
    applyColors();
  });
}
 
setupColorPicker('diceColorPresets', 'diceColorCustom', c => { diceColor = c; });
setupColorPicker('textColorPresets', 'textColorCustom', c => { textColor = c; });
 
// Init
resetStage();
applyColors();