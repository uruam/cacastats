import gaunt from "../../assets/weapons/1.svg";
import mg from "../../assets/weapons/2.svg";
import sg from "../../assets/weapons/3.svg";
import gl from "../../assets/weapons/4.svg";
import rl from "../../assets/weapons/5.svg";
import lg from "../../assets/weapons/6.svg";
import rg from "../../assets/weapons/7.svg";
import pg from "../../assets/weapons/8.svg";

const weaponIconsArr = [gaunt, mg, sg, gl, rl, lg, rg, pg];

const getWeaponImg = (index) => {
  const weaponIcon = weaponIconsArr[index];

  return weaponIcon || null;
};

export default getWeaponImg;
