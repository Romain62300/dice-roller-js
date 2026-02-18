
const facesSelect = document.getElementById("faces");
const rollBtn = document.getElementById("rollBtn");
const resetBtn = document.getElementById("resetBtn");
const diceEl = document.getElementById("dice");
const hintEl = document.getElementById("hint");
const historyList = document.getElementById("historyList");

let totalRolls = 0;
let totalSum = 0;

let isRolling = false;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addHistoryLine(text) {
  const li = document.createElement("li");
  li.textContent = text;
  historyList.prepend(li);

  // garde max 10 lignes
  while (historyList.children.length > 10) {
    historyList.removeChild(historyList.lastChild);
  }
}

function resetAll() {
  diceEl.textContent = "—";
  hintEl.textContent = "Prêt.";
  historyList.innerHTML = "";

  totalRolls = 0;
  totalSum = 0;
}

function rollDice() {
  if (isRolling) return;

  const faces = Number(facesSelect.value);
  if (!Number.isFinite(faces) || faces < 2) {
    hintEl.textContent = "Nombre de faces invalide.";
    return;
  }

  isRolling = true;
  rollBtn.disabled = true;
  hintEl.textContent = "Ça roule…";

  // mini “animation” simple : on change vite le chiffre
  let ticks = 0;
  const interval = setInterval(() => {
    diceEl.textContent = randomInt(1, faces);
    ticks += 1;

    if (ticks >= 12) {
      clearInterval(interval);

      const result = randomInt(1, faces);
      diceEl.textContent = result;

      totalRolls++;
      totalSum += result;
      const average = (totalSum / totalRolls).toFixed(2);

      const label = `d${faces} → ${result}`;
      addHistoryLine(label);

      hintEl.textContent = `Terminé. Moyenne : ${average}`;

      isRolling = false;
      rollBtn.disabled = false;
    }
  }, 60);
}

rollBtn.addEventListener("click", rollDice);
resetBtn.addEventListener("click", resetAll);
