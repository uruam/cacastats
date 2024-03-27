import "../css/style.css";
import ratmodHeadIcon from "../assets/ratmod-head-icon.svg";
import loadBoard from "./board/board-loader.js";
import loadProfile from "./profile/profile-loader.js";
import loadOnline from "./online/online-loader.js";
import loadLinks from "./links/links-loader.js";
import loadInfo from "./info/info-loader.js";

const favicon = document.querySelector("link[rel='icon']");
favicon.href = ratmodHeadIcon;

const ratmodHeadImage = document.getElementById("ratmodHeadImage");
ratmodHeadImage.src = ratmodHeadIcon;

const loadView = () => {
  const path = window.location.pathname;

  switch (path) {
    case "/":
    case "/index.html":
      loadBoard();
      break;
    case "/profile":
      loadProfile();
      break;
    case "/online":
      loadOnline();
      break;
    case "/links":
      loadLinks();
      break;
    case "/info":
      loadInfo();
      break;
    default:
      break;
  }
};

window.addEventListener("DOMContentLoaded", loadView);
// Listen for back/forward button clicks
window.addEventListener("popstate", loadView);
