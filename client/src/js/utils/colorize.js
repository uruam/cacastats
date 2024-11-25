export const colorizeText = (text) => {
  const COLOR_MAP = {
    0: "text-black",
    1: "text-red",
    2: "text-lime",
    3: "text-yellow",
    4: "text-blue",
    5: "text-cyan",
    6: "text-pink",
    7: "text-white",
    8: "text-orange",
  };

  let result = "";
  let openSpan = false;
  // Default color code to white
  let lastColorCode = "7";

  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "^" && i + 1 < text.length) {
      if (!Number.isNaN(text[i + 1])) {
        const colorCode = text[i + 1];
        if (colorCode in COLOR_MAP) {
          if (openSpan) {
            result += "</span>";
          }
          result += `<span class="${COLOR_MAP[colorCode]}">`;
          openSpan = true;
          // Update last color code
          lastColorCode = colorCode;
          i += 1;
          continue;
        }
      }
    }
    if (!openSpan) {
      // Start with the last color
      result += `<span class="${COLOR_MAP[lastColorCode]}">`;
      openSpan = true;
    }
    result += text[i];
  }

  if (openSpan) {
    result += "</span>";
  }

  return result;
};

export const getColorCodedName = (parsedName) => {
  const COLOR_MAP = {
    0: "^0",
    1: "^1",
    2: "^2",
    3: "^3",
    4: "^4",
    5: "^5",
    6: "^6",
    7: "^7",
    8: "^8",
  };

  return parsedName
    .map((part) => COLOR_MAP[part.colortag] + part.text)
    .join("");
};
