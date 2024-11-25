import fs from "fs";
import { URL } from "url";
import { spawn } from "child_process";
import currDir from "./utils.js";

const dirname = currDir(import.meta.url);

const getContentType = (parsedUrl) => {
  if (parsedUrl.endsWith(".html")) return "text/html";
  if (parsedUrl.endsWith(".css")) return "text/css";
  if (parsedUrl.endsWith(".js")) return "text/javascript";
  if (parsedUrl.endsWith(".svg")) return "image/svg+xml";
  if (parsedUrl.endsWith(".png")) return "image/png";
  if (parsedUrl.endsWith(".jpg")) return "image/jpeg";

  return null;
};

const serveStaticFile = (parsedUrl, contentType, res) => {
  const pathName = parsedUrl.pathname;
  let file = `${dirname}/dist${pathName}`;

  if (
    pathName === "/" ||
    pathName === "/profile" ||
    pathName === "/online" ||
    pathName === "/links" ||
    pathName === "/info"
  ) {
    file = `${dirname}/dist/index.html`;
  }

  fs.readFile(
    file,
    contentType === "image/png" || contentType === "image/jpeg" ? null : "utf8",
    (error, data) => {
      if (error) {
        let statusCode = 500;
        let errorMessage = "Internal server error";

        if (error.code === "ENOENT") {
          statusCode = 404;
          errorMessage = "File not found";
        }
        console.error(error);

        res.writeHead(statusCode);
        res.end(errorMessage);
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      }
    },
  );
};

const serveDataFile = (res, queryString) => {
  try {
    // board-data
    let data = fs.readFileSync(`${dirname}/data.json`, "utf8");
    // profile-data
    if (queryString && queryString.charAt(0) === "?") {
      const playerName = decodeURIComponent(queryString.substring(1));
      try {
        const parsedData = JSON.parse(data);
        const playerData = parsedData.filter(
          (player) => player.name === playerName,
        )[0];
        data = JSON.stringify(playerData);
      } catch (error) {
        console.error("Error parsing JSON data for a profile:", error);

        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("Data file not found:", error);

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Data file not found" }));
    } else {
      console.error("Error reading data file:", error);

      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }
};

const serveOaquery = (res) => {
  const pythonProcess = spawn("python3", [
    "./oaquery.py",
    "96.126.107.177:27200",
    "--json",
    // "--json-pretty",
  ]);

  let responseData = "";

  pythonProcess.stdout.on("data", (data) => {
    responseData += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    if (code === 0 && responseData.trim() !== "") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(responseData);
    } else {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Oaquery execution failed or produced no output",
        }),
      );
    }
  });
};

const handleRequest = (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}/`);

  const pathName = parsedUrl.pathname;
  const queryString = parsedUrl.search;

  switch (pathName) {
    case "/board-data":
      serveDataFile(res);
      break;
    case "/profile-data":
      serveDataFile(res, queryString);
      break;
    case "/oaquery":
      serveOaquery(res);
      break;
    default:
      serveStaticFile(parsedUrl, getContentType(pathName), res);
      break;
  }
};

export default handleRequest;
