import { formatNumber, formatTime, formatPeriod } from "../utils/format.js";
import colorizeText from "../utils/colorize-text.js";

const getBoardHeaderName = (key) => {
  const headerNames = {
    wins: "WIN",
    losses: "LOSS",
    kills: "KILL",
    deaths: "DEATH",
  };

  return headerNames[key] || key.toUpperCase();
};

const formatBoardCellContent = (key, value) => {
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

  Object.keys(data[0]).forEach((key) => {
    if (key && key !== "period" && key !== "weapons" && key !== "awards") {
      const th = document.createElement("th");
      const sortButton = document.createElement("button");
      sortButton.setAttribute("id", "sortButton");
      sortButton.setAttribute("class", sortOrder);
      sortButton.setAttribute("data-sort-key", key.toLowerCase());
      sortButton.textContent = "⬍";
      th.textContent = getBoardHeaderName(key);

      if (key !== "name") {
        th.appendChild(sortButton);
      }

      headerRow.appendChild(th);
    }
  });

  const body = table.createTBody();

  data.forEach((obj) => {
    const row = body.insertRow();
    let isFirstCell = true;
    Object.keys(obj).forEach((key) => {
      if (key && key !== "period" && key !== "weapons" && key !== "awards") {
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
