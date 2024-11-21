const infoLoader = () => {
  const someText = document.getElementById("someText");
  someText.innerText = "INFO";

  const text = [
    `Set <mark>\\cg_trackConsent 1</mark> if you want your nickname to be shown in the stats. Apart from your nickname, no unique identifiers are collected by the website. All data is deleted after 30 days.`,
    `If your nickname is in the stats and you want it to be removed, simply set <mark>\\cg_trackConsent 0</mark>, and thereafter the nickname will disappear within 30 days.`,
    `The default ranking is by score. You can also sort by any other column to see the ranking based purely on that particular column, without considering any other values.`,
    `* HDG - Highest Damage Given in a Single Game.`,
  ];

  const contentContainer = document.getElementById("contentContainer");
  const infoWrapperDiv = document.createElement("div");
  infoWrapperDiv.id = "infoWrapper";
  infoWrapperDiv.innerHTML = `
  <p>${text[0]}</p>
  <p>${text[1]}</p>
  <p>${text[2]}</p>
  <p>${text[3]}</p>
  `;

  contentContainer.appendChild(infoWrapperDiv);
};

export default infoLoader;
