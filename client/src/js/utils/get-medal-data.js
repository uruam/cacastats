/* eslint-disable camelcase */
import accuracy from "../../assets/medals/accuracy.png";
import airgrenade from "../../assets/medals/airnade.png";
import airrocket from "../../assets/medals/airrocket.png";
import ambush from "../../assets/medals/ambush.png";
import berserker from "../../assets/medals/berserker.png";
import bullseye from "../../assets/medals/rocketsniper.png";
import butcher from "../../assets/medals/butcher.png";
import deadhand from "../../assets/medals/grave.png";
import excellent from "../../assets/medals/excellent.png";
import frags from "../../assets/medals/frags.png";
import fullsg from "../../assets/medals/fullsg.png";
import grimreaper from "../../assets/medals/killspree50.png";
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
import stopper from "../../assets/medals/stopper.png";
import strongman from "../../assets/medals/strongman.png";
import telefrag from "../../assets/medals/telefrag.png";
import telemissile_frag from "../../assets/medals/teleprojectile.png";
import twitchrail from "../../assets/medals/aimbot.png";
import unstoppable from "../../assets/medals/killspree40.png";
import vaporized from "../../assets/medals/vaporized.png";

const medalIconsObj = {
  accuracy: {
    img: accuracy,
    title: `Accuracy - Hit an opponent multiple times 
with the same weapon and perfect accuracy`,
  },
  airgrenade: {
    img: airgrenade,
    title:
      "Air-Nade - Hit an opponent with a grenade while they were in the air",
  },
  airrocket: {
    img: airrocket,
    title:
      "Interdimensional - Fragged an opponent by firing through a teleporter",
  },
  ambush: {
    img: ambush,
    title:
      "Ambush - Fragged an opponent who just spawned or came through a portal",
  },
  berserker: {
    img: berserker,
    title: "Berserker - Got 3 gaunt frags in a row without dying",
  },
  bullseye: {
    img: bullseye,
    title: "Rocket Sniper - Directly hit an opponent far away with a rocket",
  },
  butcher: { img: butcher, title: "Butcher - Gibbed a corpse using gauntlet" },
  deadhand: {
    img: deadhand,
    title:
      "Dead Hand - Fragged an opponent with a projectile fired prior to dying",
  },
  excellent: {
    img: excellent,
    title: "Excellent - Fragged two opponents within a short period of time",
  },
  frags: {
    img: frags,
    title: "Frags - Fragged three opponents with a short period of time",
  },
  fullsg: { img: fullsg, title: "Point Blank - Hit with all shotgun pellets" },
  grimreaper: {
    img: grimreaper,
    title: "Grim Reaper - Maintained a 25-kill streak",
  },
  humiliation: {
    img: humiliation,
    title: "Humiliation - Fragged an opponent with gauntlet",
  },
  immortality: {
    img: immortality,
    title: "Immortality - Received 800 damage while staying alive",
  },
  impressive: { img: impressive, title: "Impressive - Hit two rails in a row" },
  kamikaze: {
    img: kamikaze,
    title: "Kamikaze - Fragged an opponent while taking his own life",
  },
  killingspree: {
    img: killingspree,
    title: "Killing Spree - Maintained a 5-kill streak",
  },
  lgrail: {
    img: lgrail,
    title: `Combo Kill (Lightning -> Rail) - Fragged an opponent by dealing 
lightning damage first and then finishing them off with a rail slug`,
  },
  massacre: { img: massacre, title: "Massacre - Maintained a 15-kill streak" },
  railtwo: {
    img: railtwo,
    title: "Rail Master - Shot through two opponents with a single rail slug",
  },
  rat: { img: rat, title: "Rat - Displayed rat-like behavior" },
  rampage: { img: rampage, title: "Rampage - Maintained a 10-kill streak" },
  revenge: {
    img: revenge,
    title:
      "Revenge - Fragged the opponent who fragged them quickly after respawn",
  },
  rocketrail: {
    img: rocketrail,
    title: `Combo Kill (Rocket -> Rail) - Made an opponent fly into 
the air with a rocket, then fragged them with a rail slug`,
  },
  stopper: {
    img: stopper,
    title: "Show Stopper - Fragged someone who had a powerup",
  },
  strongman: {
    img: strongman,
    title: "Strongman - Fragged all of the enemy team on your own",
  },
  telefrag: {
    img: telefrag,
    title: "Telefrag - Teleported into another player's personal space",
  },
  telemissile_frag: {
    img: telemissile_frag,
    title:
      "Interdimensional - Fragged an opponent by firing through a teleporter",
  },
  twitchrail: {
    img: twitchrail,
    title: "Aimbot - Turned very quickly and hit an opponent with railgun",
  },
  unstoppable: {
    img: unstoppable,
    title: "Unstoppable - Maintained a 20-kill streak",
  },
  vaporized: {
    img: vaporized,
    title: `Vaporized - Fragged an opponent by doing 
more than 100 plasma damage within 800ms`,
  },
};

export const getMedalImg = (key) => medalIconsObj[key]?.img || "";
export const getMedalTitle = (key) => medalIconsObj[key]?.title || "";
