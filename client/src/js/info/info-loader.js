const infoLoader = () => {
  const someText = document.getElementById("someText");
  someText.innerText = "INFO";

  const text = [
    `Set <mark>\\cg_trackConsent 1</mark> if you want your nickname to be shown in the stats. Apart from your nickname, no unique identifiers are collected by the website. All data is deleted after 30 days.`,
    `If your nickname is in the stats and you want it to be removed, simply set <mark>\\cg_trackConsent 0</mark>, and thereafter the nickname will disappear within 30 days.`,
    `The default ranking is by skill. You can also sort by any other column to see the ranking based purely on that particular column, without considering any other values.`,
    `* HDG - Highest Damage Given in a Single Game.`,
    `* SKILL (experimental) - The calculation is based on a weighted formula that considers various performance metrics. Each metric is assigned a specific weight to reflect its importance. The metrics and their weights are as follows:`,
    `<ol>
      <li>SCORE (SCORE_WEIGHT = 1): The total points accumulated by the player. Scaled down using the logarithm function to handle high values effectively.</li>
      <li>TIME (TIME_WEIGHT = 1): The total time the player has spent playing. Scaled down using the logarithm function to handle high values effectively.</li>
      <li>HDG (HDG_WEIGHT = 1): The highest damage given by the player in a single game, indicating peak performance. Scaled down using the logarithm function to handle high values effectively.</li>
      <li>W/L (WLR_WEIGHT = 1.4): The ratio of wins to losses, indicating the player's team's success rate.</li>
      <li>K/D (KDR_WEIGHT = 1.7): The ratio of kills to deaths, reflecting the player's combat effectiveness.</li>
      <li>DG/DT (DGDTR_WEIGHT = 1.7): The ratio of damage given to damage taken, showing the player's efficiency in dealing damage while minimizing damage taken.</li>
      <li>ACC (ACC_WEIGHT = 1.5): The percentage of shots that hit the target, representing the player's overall shooting accuracy.</li>
    </ol>`,
    `The weighted contributions of the scaled score, time and HDG values are then added to the weighted W/L, K/D, DG/DT and ACC. The total skill score is adjusted by a time factor to ensure that players with very low playtime do not have disproportionately high skill scores.`,
    `The time factor is calculated as the square root of the ratio of the player's playtime to a minimum playtime threshold (10 hours), capped at 1. The final skill value is then multiplied by 100 for a clearer representation and rounded to the nearest integer.`,
  ];

  const contentContainer = document.getElementById("contentContainer");
  const infoWrapperDiv = document.createElement("div");
  infoWrapperDiv.id = "infoWrapper";
  infoWrapperDiv.innerHTML = `
  <p>${text[0]}</p>
  <p>${text[1]}</p>
  <p>${text[2]}</p>
  <p>${text[3]}</p>
  <p>${text[4]}</p>
  <p>${text[5]}</p>
  <p>${text[6]}</p>
  <p>${text[7]}</p>
  `;

  contentContainer.appendChild(infoWrapperDiv);
};

export default infoLoader;
