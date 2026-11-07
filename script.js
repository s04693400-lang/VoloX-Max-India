
const characters = ["Alok", "Thala", "Hayato"];
let currentCharacter = 0;
let credits = 2450;
let claimed = false;

function openPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(name).classList.add("active");

  document.querySelectorAll(".sidebar button").forEach(b => b.classList.remove("active"));
  const buttons = [...document.querySelectorAll(".sidebar button")];
  buttons.forEach(b => {
    if (b.getAttribute("onclick")?.includes(name)) b.classList.add("active");
  });
  window.scrollTo({top:0,behavior:"smooth"});
}

function notify(message) {
  const t = document.getElementById("toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

function changeCharacter(direction) {
  currentCharacter = (currentCharacter + direction + characters.length) % characters.length;
  document.getElementById("characterName").textContent = characters[currentCharacter];
  document.getElementById("character").textContent = ["◈","✦","⬡"][currentCharacter];
  document.getElementById("characterNumber").textContent =
    `0${currentCharacter+1} / 03`;
  notify(characters[currentCharacter] + " selected");
}

function showModes() {
  document.getElementById("modal").classList.add("show");
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
}

function startMode(mode) {
  closeModal();
  notify(mode + " selected · Demo mode");
}

function selectWorld(world) {
  notify(world + " selected · Demo preview");
}

function claimDaily() {
  if (claimed) {
    notify("Daily reward already claimed");
    return;
  }
  claimed = true;
  credits += 100;
  document.querySelector(".wallet span").textContent = "◈ " + credits.toLocaleString("en-IN");
  document.getElementById("dailyButton").textContent = "CLAIMED";
  document.getElementById("dailyButton").disabled = true;
  notify("+100 VX Credits received!");
}

function changeName() {
  const name = prompt("Enter your player name:");
  if (!name || name.trim().length < 3) return;
  const clean = name.trim().slice(0,16);
  document.getElementById("playerName").textContent = clean;
  localStorage.setItem("voloxPlayerName", clean);
  notify("Player name updated");
}

const savedName = localStorage.getItem("voloxPlayerName");
if (savedName) document.getElementById("playerName").textContent = savedName;

const operativeData = [
  ["NOVA","PATHFINDER","◈"],
  ["AYA","AURORA","✦"],
  ["ARIN","PIONEER","⬡"]
];

document.getElementById("vaultGrid").innerHTML = operativeData.map((item,i) => `
  <article class="vault-card">
    <div class="figure">${item[2]}</div>
    <h2>${item[0]}</h2>
    <p>${item[1]} CLASS</p>
    <button onclick="equipCharacter(${i})">EQUIP</button>
  </article>
`).join("");

function equipCharacter(index) {
  currentCharacter = index;
  changeCharacter(0);
  notify(operativeData[index][0] + " equipped");
}

const missions = [
  ["Explore the Dustline","Visit 3 discovery points","400 XP"],
  ["Skyline Trials","Complete 2 checkpoints","300 XP"],
  ["Team Pathfinder","Complete 1 co-op objective","500 XP"]
];

document.getElementById("missionList").innerHTML = missions.map((m,i) => `
  <div class="mission">
    <div><b>${m[0]}</b><p>${m[1]} · ${m[2]}</p></div>
    <button onclick="beginMission(this,'${m[0]}')">START</button>
  </div>
`).join("");

function beginMission(button,name) {
  button.textContent = "ACTIVE";
  button.disabled = true;
  notify(name + " added to your objectives");
}
