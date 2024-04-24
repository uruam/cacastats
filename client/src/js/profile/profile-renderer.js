/* eslint-disable camelcase */
import { formatNumber, formatTime, formatPeriod } from "../utils/format.js";
import colorizeText from "../utils/colorize-text.js";
import calculateAcc from "../utils/calculate-acc.js";
import gaunt from "../../assets/weapons/1.svg";
import mg from "../../assets/weapons/2.svg";
import sg from "../../assets/weapons/3.svg";
import gl from "../../assets/weapons/4.svg";
import rl from "../../assets/weapons/5.svg";
import lg from "../../assets/weapons/6.svg";
import rg from "../../assets/weapons/7.svg";
import pg from "../../assets/weapons/8.svg";
import accuracy from "../../assets/medals/accuracy.png";
import airgrenade from "../../assets/medals/airnade.png";
import airrocket from "../../assets/medals/airrocket.png";
import ambush from "../../assets/medals/ambush.png";
import assist from "../../assets/medals/assist.png";
import berserker from "../../assets/medals/berserker.png";
import bullseye from "../../assets/medals/rocketsniper.png";
import butcher from "../../assets/medals/butcher.png";
import capture from "../../assets/medals/capture.png";
import combokill from "../../assets/medals/combokill.png";
import deadhand from "../../assets/medals/grave.png";
import defend from "../../assets/medals/defend.png";
import excellent from "../../assets/medals/excellent.png";
import frags from "../../assets/medals/frags.png";
import fullsg from "../../assets/medals/fullsg.png";
import humiliation from "../../assets/medals/gauntlet.png";
import immortality from "../../assets/medals/immortality.png";
import impressive from "../../assets/medals/impressive.png";
import kamikaze from "../../assets/medals/kamikaze.png";
import killingspree from "../../assets/medals/killspree10.png";
import lgrail from "../../assets/medals/lgrail.png";
import massacre from "../../assets/medals/killspree30.png";
import railtwo from "../../assets/medals/multirail.png";
import rat from "../../assets/medals/rat.png";
import rampage from "../../assets/medals/killspree20.png";
import revenge from "../../assets/medals/revenge.png";
import rocketrail from "../../assets/medals/rocketrail.png";
import star from "../../assets/medals/star.png";
import stopper from "../../assets/medals/stopper.png";
import strongman from "../../assets/medals/strongman.png";
import telefrag from "../../assets/medals/telefrag.png";
import telemissile_frag from "../../assets/medals/teleprojectile.png";
import thawbuddy from "../../assets/medals/thawbuddy.png";
import twitchrail from "../../assets/medals/aimbot.png";
import vaporized from "../../assets/medals/vaporized.png";

const weaponIconsArr = [gaunt, mg, sg, gl, rl, lg, rg, pg];
const medalIconsObj = {
  accuracy,
  airgrenade,
  airrocket,
  ambush,
  assist,
  berserker,
  bullseye,
  butcher,
  capture,
  combokill,
  deadhand,
  defend,
  excellent,
  frags,
  fullsg,
  humiliation,
  immortality,
  impressive,
  kamikaze,
  killingspree,
  lgrail,
  massacre,
  railtwo,
  rat,
  rampage,
  revenge,
  rocketrail,
  star,
  stopper,
  strongman,
  telefrag,
  telemissile_frag,
  thawbuddy,
  twitchrail,
  vaporized,
};

const generateTotalStats = (data) => {
  const table = document.createElement("table");
  table.id = "profileTotal";
  const header = table.createTHead();
  const headerRow = header.insertRow();

  Object.keys(data).forEach((key) => {
    if (
      key &&
      key !== "name" &&
      key !== "period" &&
      key !== "weapons" &&
      key !== "awards"
    ) {
      const th = document.createElement("th");
      th.textContent = key.toUpperCase();

      headerRow.appendChild(th);
    }
  });

  const body = table.createTBody();
  const row = body.insertRow();

  Object.keys(data).forEach((key) => {
    if (
      key &&
      key !== "name" &&
      key !== "period" &&
      key !== "weapons" &&
      key !== "awards"
    ) {
      const cell = row.insertCell();
      cell.textContent = data[key];

      if (key === "score") {
        cell.textContent = formatNumber(data[key]);
      }
      if (key === "time") {
        cell.textContent = formatTime(data[key]);
      }
      if (key === "wlr") {
        cell.textContent = formatNumber(data[key]);
      }
      if (["dg", "dt"].some((el) => el === key)) {
        cell.textContent = formatNumber(data[key]);
      }
      if (key === "acc") {
        cell.textContent = `${data[key]}%`;
      }
    }
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

  Object.keys(Object.values(weaponsData)[0]).forEach((key) => {
    const th = document.createElement("th");
    th.textContent = key.toUpperCase();
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
    weaponImage.src = weaponIconsArr[index];
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

    const medalImage = new Image();
    medalImage.src = medalIconsObj[key];
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

  const weaponsHeader = document.createElement("div");
  weaponsHeader.id = "profileWeaponsHeader";
  // weaponsHeader.innerText = "WEAPONS";

  const medalsHeader = document.createElement("div");
  medalsHeader.id = "profileMedalsHeader";
  // medalsHeader.innerText = "MEDALS";

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
  contentContainer.appendChild(generateTotalStats(data));

  contentContainer.appendChild(weaponsHeader);
  contentContainer.appendChild(generateWeaponsStats(data.weapons));

  contentContainer.appendChild(medalsHeader);
  contentContainer.appendChild(generateMedalsStats(data.awards));
};

export default renderProfile;
