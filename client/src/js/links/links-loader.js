const loadNews = () => {
  const someText = document.getElementById("someText");
  someText.innerText = "LINKS";

  const contentContainer = document.getElementById("contentContainer");

  const linksData = [
    { url: "https://github.com/OpenArena", text: "openarena github" },
    { url: "https://github.com/rdntcntrl", text: "ratmod github" },
    { url: "https://ratmod.github.io", text: "ratmod docs" },
    { url: "https://stats.dotsstuff.com", text: "ratstats" },
    { url: "https://matrix.to/#/#ratarena:matrix.org", text: "matrix" },
    { url: "https://discord.gg/WGep6mSCD4", text: "/N/" },
    { url: "https://www.youtube.com/@cacadotgg", text: "YT" },
  ];

  linksData.forEach((linkData) => {
    const link = document.createElement("a");
    link.href = linkData.url;
    link.target = "_blank";
    link.innerHTML = `<div>${linkData.text}</div>`;
    contentContainer.appendChild(link);
    contentContainer.appendChild(document.createElement("br"));
  });
};

export default loadNews;
