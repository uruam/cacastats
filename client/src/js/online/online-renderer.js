import getMapUrl from "../utils/get-map-url.js";
import { colorizeText, getColorCodedName } from "../utils/colorize.js";

const renderOnline = (data) => {
  const someText = document.getElementById("someText");
  someText.innerText = "ONLINE";

  const contentContainer = document.getElementById("contentContainer");
  const onlineContainer = document.createElement("div");

  onlineContainer.id = "onlineContainer";
  contentContainer.appendChild(onlineContainer);

  if (!data || !data.servers || data.servers.length === 0) {
    onlineContainer.innerText = "...";

    return;
  }

  const server = data.servers[0];

  const serverInfoDiv = document.createElement("div");
  serverInfoDiv.id = "onlineServerInfo";
  serverInfoDiv.style.background = `url(${getMapUrl(server.map)})`;

  const gameTypeDiv = document.createElement("div");
  gameTypeDiv.textContent = server.gametype.str.toUpperCase();

  const mapDiv = document.createElement("div");
  mapDiv.id = "onlineMapName";
  // mapDiv.textContent = "am_galmevish-oa3";
  mapDiv.textContent = server.map;

  const numberOfPlayersDiv = document.createElement("div");
  numberOfPlayersDiv.id = "onlineNumberOfPlayers";
  numberOfPlayersDiv.textContent = `${server.players.length}/24`;

  const table = document.createElement("table");
  table.id = "onlinePlayers";
  const tableBody = document.createElement("tbody");

  const refreshDiv = document.createElement("div");
  refreshDiv.id = "refreshWrapper";

  const refreshLink = document.createElement("a");
  refreshLink.href = "/online";
  refreshLink.title = "REFRESH";

  const refreshSpan = document.createElement("span");
  refreshSpan.textContent = "🔄";
  refreshSpan.id = "refresh";

  refreshLink.appendChild(refreshSpan);
  refreshDiv.appendChild(refreshLink);

  serverInfoDiv.appendChild(gameTypeDiv);
  serverInfoDiv.appendChild(mapDiv);
  serverInfoDiv.appendChild(numberOfPlayersDiv);

  server.players.forEach((player) => {
    const row = document.createElement("tr");
    ["parsed_name", "ping", "score"].forEach((key) => {
      const cell = document.createElement("td");
      if (key === "parsed_name") {
        cell.innerHTML = colorizeText(getColorCodedName(player[key]));
        row.appendChild(cell);
      } else {
        cell.innerHTML = player[key];
      }
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);

  onlineContainer.appendChild(serverInfoDiv);
  onlineContainer.appendChild(table);
  onlineContainer.appendChild(refreshDiv);
};

export default renderOnline;
