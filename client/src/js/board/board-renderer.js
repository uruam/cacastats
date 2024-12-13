import {
  formatPeriod,
  formatBoardHeader,
  formatBoardCellContent,
} from "../utils/format.js";
import { colorizeText } from "../utils/colorize.js";

const generateBoard = (data, sortKey, sortOrder) => {
  if (sortKey && sortOrder) {
    data.sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortKey] - b[sortKey];
      }
      return b[sortKey] - a[sortKey];
    });
  }
  const table = document.createElement("table");
  table.id = "board";
  const header = table.createTHead();
  const headerRow = header.insertRow();

  // Create a new array of keys with "skill" as the second element
  const keys = Object.keys(data[0]).filter(
    (key) => key && key !== "period" && key !== "weapons" && key !== "awards",
  );

  const reorderedKeys = [
    "name",
    "skill",
    ...keys.filter((key) => key !== "name" && key !== "skill"),
  ];

  reorderedKeys.forEach((key) => {
    const th = document.createElement("th");
    const sortButton = document.createElement("button");
    sortButton.setAttribute("id", "sortButton");
    sortButton.setAttribute("class", sortOrder);
    sortButton.setAttribute("data-sort-key", key.toLowerCase());
    sortButton.textContent = "⬍";
    th.textContent = formatBoardHeader(key);

    if (key === "skill") {
      th.innerHTML = `<a href="/info">SKILL*</a>`;
    }

    if (key === "hdg") {
      th.innerHTML = `<a href="/info">HDG*</a>`;
    }

    if (key !== "name") {
      th.appendChild(sortButton);
    }

    headerRow.appendChild(th);
  });

  const body = table.createTBody();

  data.forEach((obj) => {
    const row = body.insertRow();
    let isFirstCell = true;
    reorderedKeys.forEach((key) => {
      const cell = row.insertCell();
      if (isFirstCell) {
        const link = document.createElement("a");
        link.href = `/profile?${encodeURIComponent(obj[key])}`;
        link.innerHTML = colorizeText(obj[key]);
        cell.appendChild(link);
        isFirstCell = false;
      } else {
        cell.textContent = formatBoardCellContent(key, obj[key]);
      }
    });
  });

  return table;
};

const renderBoard = (data, sortKey, sortOrder) => {
  const someText = document.getElementById("someText");
  const contentContainer = document.getElementById("contentContainer");

  // Clear container before rendering
  someText.innerText = "";
  contentContainer.innerHTML = "";

  if (data.error) {
    someText.innerText = "";

    if (data.error === "Data file not found") {
      contentContainer.innerText = "No data for the scoreboard";

      return;
    }

    contentContainer.innerText = "There's some problem, we're on it";

    return;
  }

  someText.innerText = formatPeriod(data[0].period);
  contentContainer.appendChild(generateBoard(data, sortKey, sortOrder));
};

export default renderBoard;
