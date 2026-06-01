const names = ["Pip", "Juniper", "Thimble", "Hazel", "Bramble", "Nettle", "Fig", "Clover"];
const backgrounds = [
  "Kitchen forager", "Street tough", "Beetleherd", "Fishermouse",
  "Tin miner", "Trash collector", "Cartographer", "Message runner"
];
const coats = ["chocolate solid", "black brindle", "white patchy", "tan banded", "grey marbled", "blue flecked"];
const weapons = [
  { name: "needle", die: 6 },
  { name: "sling", die: 6 },
  { name: "spear", die: 10 },
  { name: "trashhook", die: 10 }
];

const encounters = {
  pantry: {
    chapter: "Chapter 1",
    danger: "Human pantry",
    title: "The pantry gap",
    text: "Warm bread-smell drifts through a crack beneath the pantry door. A silver spoon bridges the gap, but it rings loudly when touched.",
    choices: [
      { label: "Dash across the spoon", action: () => saveScene("dex", 0, "You cross silent as dust.", "The spoon clatters. Lose 1 HP as a broom clips your tail.", "crumbs") },
      { label: "Stuff cloth around the spoon first", action: () => saveScene("wil", -1, "Your careful plan muffles the ring.", "You hesitate too long. The house cat wakes nearby.", "cat") },
      { label: "Search the skirting board", action: () => saveScene("wil", 1, "You find an old mouse-run behind the wall.", "You find only splinters and stale dust. Lose 1 HP.", "crumbs") }
    ]
  },
  crumbs: {
    chapter: "Chapter 2",
    danger: "Open floor",
    title: "The mountain of crumbs",
    text: "A feast lies scattered under the table. Between you and glory stretches open floor, moonlit and exposed.",
    choices: [
      { label: "Fill your pack quickly", action: () => gainTreasure(8, "You gather a heroic bundle of crumbs.", "cat") },
      { label: "Take only the richest morsels", action: () => gainTreasure(4, "You travel light with buttery treasure.", "trap") },
      { label: "Pause for a short rest", action: shortRest }
    ]
  },
  trap: {
    chapter: "Chapter 3",
    danger: "Mouse trap",
    title: "Cheese on a terrible altar",
    text: "A brass trap offers a cube of cheese. Its spring smells of iron, danger, and destiny.",
    choices: [
      { label: "Disarm it with your weapon", action: () => saveScene("dex", 0, "The spring snaps harmlessly. Gain 6 pips of cheese.", "The trap bites. Take d6 damage.", "escape", () => gainPips(6), () => sufferDamage(roll(6))) },
      { label: "Leave it alone", action: () => changeScene("escape", "Wisdom wins over cheese today.") },
      { label: "Jam it with your body and grab the cheese", action: () => saveScene("str", -2, "Bold and baffling. It works. Gain 10 pips of cheese.", "Bold and baffling. It hurts. Take d6 damage.", "escape", () => gainPips(10), () => sufferDamage(roll(6))) }
    ]
  },
  cat: {
    chapter: "Chapter 3",
    danger: "Cat!",
    title: "Whiskers in the dark",
    text: "Two green moons open beneath the chair. The house cat uncoils, all velvet and murder.",
    choices: [
      { label: "Fight dirty", action: fightCat },
      { label: "Flee under the cupboard", action: () => saveScene("dex", 0, "You vanish beneath the cupboard before claws land.", "A claw catches you. Take d6 damage before you escape.", "escape", null, () => sufferDamage(roll(6))) },
      { label: "Squeak a desperate bargain", action: () => saveScene("wil", -2, "The cat laughs and lets you go, amused.", "The cat is not amused. Take d6 damage.", "escape", null, () => sufferDamage(roll(6))) }
    ]
  },
  escape: {
    chapter: "Final Chapter",
    danger: "Dash home",
    title: "The burrow is close",
    text: "The tunnel home is a dark crescent behind the flour sack. One last sprint will decide whether you return as a legend or a cautionary squeak.",
    choices: [
      { label: "Sprint for home", action: ending },
      { label: "Drop treasure to move faster", action: () => { state.mouse.pips = Math.max(0, state.mouse.pips - 4); log("You drop 4 pips of treasure to lighten your pack."); ending(); } }
    ]
  },
  dead: {
    chapter: "Epilogue",
    danger: "Defeat",
    title: "A tiny tragedy",
    text: "Your mouse falls in the vast and dangerous world. Roll a new mouse and try again.",
    choices: []
  },
  win: {
    chapter: "Epilogue",
    danger: "Safe burrow",
    title: "Crumb hero",
    text: "You tumble into the burrow with treasure, scars, and a story no one will believe until breakfast.",
    choices: []
  }
};

const state = {
  mouse: null,
  scene: "pantry"
};

const elements = {
  summary: document.querySelector("#mouse-summary"),
  newGame: document.querySelector("#new-game"),
  chapter: document.querySelector("#chapter"),
  danger: document.querySelector("#danger"),
  title: document.querySelector("#scene-title"),
  text: document.querySelector("#scene-text"),
  choices: document.querySelector("#choices"),
  log: document.querySelector("#log"),
  stats: {
    name: document.querySelector("#stat-name"),
    background: document.querySelector("#stat-background"),
    str: document.querySelector("#stat-str"),
    dex: document.querySelector("#stat-dex"),
    wil: document.querySelector("#stat-wil"),
    hp: document.querySelector("#stat-hp"),
    pips: document.querySelector("#stat-pips"),
    gear: document.querySelector("#stat-gear")
  }
};

elements.newGame.addEventListener("click", newGame);

function newGame() {
  const hp = roll(6);
  const weapon = pick(weapons);
  state.mouse = {
    name: pick(names),
    background: pick(backgrounds),
    coat: pick(coats),
    str: rollAttribute(),
    dex: rollAttribute(),
    wil: rollAttribute(),
    hp,
    maxHp: hp,
    pips: roll(6),
    weapon,
    armour: 0
  };
  state.scene = "pantry";
  elements.log.innerHTML = "";
  log(`${state.mouse.name} the ${state.mouse.background} enters the pantry with a ${weapon.name}.`);
  render();
}

function rollAttribute() {
  return [roll(6), roll(6), roll(6)].sort((a, b) => b - a).slice(0, 2).reduce((sum, value) => sum + value, 0);
}

function roll(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function render(message) {
  if (!state.mouse) {
    return;
  }

  const mouse = state.mouse;
  const scene = encounters[state.scene];
  elements.summary.textContent = `${mouse.name} is a ${mouse.coat} ${mouse.background.toLowerCase()} with ${mouse.hp}/${mouse.maxHp} HP.`;
  elements.stats.name.textContent = mouse.name;
  elements.stats.background.textContent = mouse.background;
  elements.stats.str.textContent = mouse.str;
  elements.stats.dex.textContent = mouse.dex;
  elements.stats.wil.textContent = mouse.wil;
  elements.stats.hp.textContent = `${mouse.hp}/${mouse.maxHp}`;
  elements.stats.pips.textContent = mouse.pips;
  elements.stats.gear.textContent = mouse.weapon.name;
  elements.chapter.textContent = scene.chapter;
  elements.danger.textContent = scene.danger;
  elements.title.textContent = scene.title;
  elements.text.textContent = message || scene.text;
  elements.choices.innerHTML = "";

  scene.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = choice.label;
    button.addEventListener("click", choice.action);
    elements.choices.append(button);
  });

  if (state.scene === "dead" || state.scene === "win") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.textContent = "Roll another mouse";
    button.addEventListener("click", newGame);
    elements.choices.append(button);
  }
}

function saveScene(attribute, modifier, success, failure, nextScene, onSuccess, onFailure) {
  const target = Math.max(1, state.mouse[attribute] + modifier);
  const result = roll(20);
  const passed = result <= target;
  log(`${attribute.toUpperCase()} save: rolled ${result} vs ${target} — ${passed ? "success" : "failure"}.`, passed ? "good" : "bad");

  if (passed) {
    if (onSuccess) onSuccess();
    changeScene(nextScene, success);
  } else {
    if (onFailure) {
      onFailure();
    } else {
      sufferDamage(1);
    }
    if (state.scene !== "dead") changeScene(nextScene, failure);
  }
}

function gainTreasure(amount, message, nextScene) {
  gainPips(amount);
  changeScene(nextScene, message);
}

function gainPips(amount) {
  state.mouse.pips += amount;
  log(`Gained ${amount} pips of treasure.`, "good");
}

function shortRest() {
  const healed = roll(6) + 1;
  state.mouse.hp = Math.min(state.mouse.maxHp, state.mouse.hp + healed);
  log(`Short rest restores ${healed} HP.`);
  changeScene("trap", "You breathe, drink a drop of water, and press onward.");
}

function fightCat() {
  const mouseDamage = roll(state.mouse.weapon.die);
  const catHp = 5;
  log(`Your ${state.mouse.weapon.name} deals ${mouseDamage} damage. Attacks always hit.`);

  if (mouseDamage >= catHp) {
    gainPips(3);
    changeScene("escape", "You strike the cat's nose. It flees in wounded dignity.");
    return;
  }

  const catDamage = roll(8);
  log(`The cat swats back for ${catDamage} damage.`, "bad");
  sufferDamage(catDamage);
  if (state.scene !== "dead") changeScene("escape", "You survive by whisker-width and dive away.");
}

function sufferDamage(amount) {
  const hpDamage = Math.min(state.mouse.hp, amount);
  state.mouse.hp -= hpDamage;
  const strDamage = amount - hpDamage;
  log(`Took ${amount} damage: ${hpDamage} to HP${strDamage ? `, ${strDamage} to STR` : ""}.`, "bad");

  if (strDamage > 0) {
    state.mouse.str = Math.max(0, state.mouse.str - strDamage);
    const save = roll(20);
    const stable = save <= state.mouse.str;
    log(`Critical STR save: rolled ${save} vs ${state.mouse.str} — ${stable ? "still standing" : "critical damage"}.`, stable ? "good" : "bad");
    if (!stable || state.mouse.str === 0) {
      state.scene = "dead";
      render("Critical damage ends the adventure.");
    }
  }
}

function ending() {
  saveScene("dex", 0, "You burst into the burrow victorious.", "You make it home, but bruised and breathless after one final scrape.", "win", null, () => sufferDamage(roll(4)));
}

function changeScene(scene, message) {
  if (state.scene !== "dead") state.scene = scene;
  render(message);
}

function log(message, className = "") {
  const item = document.createElement("li");
  item.textContent = message;
  if (className) item.classList.add(className);
  elements.log.prepend(item);
}
