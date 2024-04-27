import { formatNumber, formatTime, formatPeriod } from "../utils/format.js";
import { getMedalImg, getMedalDescription } from "../utils/get-medal-data.js";
import getWeaponImg from "../utils/get-weapon-img.js";
import colorizeText from "../utils/colorize-text.js";
import calculateAcc from "../utils/calculate-acc.js";

const getTotalStatsHeaderName = (key) => {
  const headerNames = {
    wins: "WIN",
    losses: "LOSS",
    kills: "KILL",
    deaths: "DEATH",
  };

  return headerNames[key] || key.toUpperCase();
};

const getWeaponsStatsHeaderName = (key) => {
  const headerNames = {
    kills: "KILL",
    shots: "SHOT",
    hits: "HIT",
  };

  return headerNames[key] || key.toUpperCase();
};

const formatTotalStatsCellContent = (key, value) => {
  if (["score", "wlr", "kdr", "dg", "dt"].includes(key)) {
    return formatNumber(value);
  }
  if (key === "time") {
    return formatTime(value);
  }
  if (key === "acc") {
    return `${value}%`;
  }

  return value;
};

const generateTotalStats = (data) => {
  const table = document.createElement("table");
  table.id = "profileTotal";

  const excludedKeys = ["name", "time", "period", "weapons", "awards"];
  const keys = Object.keys(data).filter((key) => !excludedKeys.includes(key));

  const header = table.createTHead();
  const headerRow = header.insertRow();
  keys.forEach((key) => {
    const th = document.createElement("th");
    th.textContent = getTotalStatsHeaderName(key);
    headerRow.appendChild(th);
  });

  const body = table.createTBody();
  const row = body.insertRow();
  keys.forEach((key) => {
    const cell = row.insertCell();
    cell.textContent = formatTotalStatsCellContent(key, data[key]);
  });

  return table;
};

const generateWeaponsStats = (weaponsData) => {
  const table = document.createElement("table");
  table.id = "profileWeapons";

  const header = table.createTHead();
  const headerRow = header.insertRow();

  const firstTh = document.createElement("th");
  firstTh.textContent = "💀";
  headerRow.appendChild(firstTh);

  const keys = Object.keys(Object.values(weaponsData)[0]);
  keys.forEach((key) => {
    const th = document.createElement("th");
    th.textContent = getWeaponsStatsHeaderName(key);
    headerRow.appendChild(th);
  });

  const accTh = document.createElement("th");
  accTh.textContent = "ACC";
  headerRow.appendChild(accTh);

  const body = table.createTBody();
  Object.keys(weaponsData).forEach((key, index) => {
    const row = body.insertRow();
    const weaponCell = row.insertCell();
    const weaponImage = new Image();
    weaponImage.src = getWeaponImg(index);
    weaponCell.appendChild(weaponImage);

    Object.values(weaponsData[key]).forEach((value) => {
      const dataCell = row.insertCell();
      dataCell.textContent = formatNumber(value);
    });

    const accCell = row.insertCell();
    accCell.textContent = `${calculateAcc(weaponsData[key])}%`;
  });

  return table;
};

const generateMedalsStats = (medalsData) => {
  const medalsContainer = document.createElement("div");
  medalsContainer.id = "profileMedalsContainer";

  Object.keys(medalsData).forEach((key) => {
    const medalContainer = document.createElement("div");
    medalContainer.id = "profileMedalContainer";
    medalContainer.setAttribute("tooltip", getMedalDescription(key));

    const medalImage = new Image();
    medalImage.src = getMedalImg(key);
    medalImage.id = "profileMedalImage";
    medalContainer.appendChild(medalImage);

    const medalData = document.createElement("div");
    medalData.id = "profileMedalDataWrapper";
    medalData.innerText = medalsData[key];
    medalContainer.appendChild(medalData);

    medalsContainer.appendChild(medalContainer);
  });

  return medalsContainer;
};

const renderProfile = (data) => {
  const someText = document.getElementById("someText");
  const contentContainer = document.getElementById("contentContainer");

  const playerName = document.createElement("div");
  playerName.id = "profilePlayerName";
  const playerNameWrapper = document.createElement("div");
  playerNameWrapper.id = "profilePlayerNameWrapper";
  playerName.appendChild(playerNameWrapper);

  const playerTime = document.createElement("div");
  playerTime.id = "profilePlayerTime";

  const weaponsHeader = document.createElement("div");
  weaponsHeader.id = "profileWeaponsHeader";

  const medalsHeader = document.createElement("div");
  medalsHeader.id = "profileMedalsHeader";

  // Clear container before rendering
  someText.innerText = "";
  contentContainer.innerHTML = "";

  if (data.error) {
    someText.innerText = "";

    if (data.error === "Data file not found") {
      contentContainer.innerText = "No data for the profile";

      return;
    }
    contentContainer.innerText = "There's some problem, we're on it";

    return;
  }
  someText.innerText = formatPeriod(data.period);

  playerNameWrapper.innerHTML = colorizeText(data.name);
  contentContainer.appendChild(playerName);

  playerTime.innerText = formatTime(data.time);
  contentContainer.appendChild(playerTime);

  contentContainer.appendChild(generateTotalStats(data));

  contentContainer.appendChild(weaponsHeader);
  contentContainer.appendChild(generateWeaponsStats(data.weapons));

  contentContainer.appendChild(medalsHeader);
  contentContainer.appendChild(generateMedalsStats(data.awards));
};

export default renderProfile;
