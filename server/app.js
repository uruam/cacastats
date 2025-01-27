import http from "http";
import handleRequest from "./request-handler.js";
import { updateDataFile, scheduleDataUpdate } from "./data-updater.js";

const port = process.env.PORT;
const server = http.createServer(handleRequest);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

updateDataFile();
scheduleDataUpdate();
