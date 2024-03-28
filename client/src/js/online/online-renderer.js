const renderOnline = (data) => {
  const someText = document.getElementById("someText");
  someText.innerText = "ONLINE";
  const contentContainer = document.getElementById("contentContainer");
  const onlineContainer = document.createElement("div");
  onlineContainer.id = "onlineContainer";
  contentContainer.appendChild(onlineContainer);

  if (!data) {
    onlineContainer.innerText = "...";

    return;
  }

  const serverInfoDiv = document.createElement("div");
  serverInfoDiv.id = "onlineServerInfo";
  const gameTypeDiv = document.createElement("div");
  const mapDiv = document.createElement("div");
  const numberOfPlayersDiv = document.createElement("div");

  const table = document.createElement("table");
  table.id = "onlinePlayers";
  const tableBody = document.createElement("tbody");

  const refreshDiv = document.createElement("div");
  refreshDiv.id = "refreshWrapper";
  const refreshLink = document.createElement("a");
  const refreshSpan = document.createElement("span");
  refreshSpan.id = "refresh";

  gameTypeDiv.textContent = data.gametype.toUpperCase();
  mapDiv.textContent = data.map;
  numberOfPlayersDiv.textContent = data.numberOfPlayers;

  refreshSpan.textContent = "🔄";
  refreshLink.href = "/online";
  refreshLink.title = "REFRESH";
  refreshLink.appendChild(refreshSpan);
  refreshDiv.appendChild(refreshLink);

  serverInfoDiv.appendChild(gameTypeDiv);
  serverInfoDiv.appendChild(mapDiv);
  serverInfoDiv.appendChild(numberOfPlayersDiv);

  onlineContainer.appendChild(serverInfoDiv);
  onlineContainer.appendChild(table);

  data.players.forEach((player) => {
    const row = document.createElement("tr");
    ["name", "ping", "score"].forEach((key) => {
      const cell = document.createElement("td");
      cell.innerHTML = player[key];
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });
  table.appendChild(tableBody);

  onlineContainer.appendChild(refreshDiv);
};

export default renderOnline;
