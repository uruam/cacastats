// import colorizeText from "../utils/colorize-text.js";

const renderOnline = (data) => {
  const someText = document.getElementById("someText");
  someText.innerText = "ONLINE";
  const contentContainer = document.getElementById("contentContainer");
  const onlineContainer = document.createElement("div");
  onlineContainer.id = "onlineContainer";
  contentContainer.appendChild(onlineContainer);
  // colorizeText(player.name);

  if (!data) {
    onlineContainer.innerText = "...";

    return;
  }

  onlineContainer.innerHTML = `
        <div>${data.gametype.toUpperCase()}</div>
        <br>
        <div>${data.map}</div><br>
        <div>${data.numberOfPlayers} players</div>
        <br>
        <ul>
            ${data.players
              .map(
                (player) => `
                <li>
                    ${player.name} (${player.ping}, ${player.score})
                </li>
            `,
              )
              .join("")}
        </ul>
        <br>
        <div>
        <a href="/online" title="REFRESH">
        <span id="refresh">🔄</span>
        </a>
        </div>
    `;
};

export default renderOnline;
