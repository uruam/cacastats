import fs from "fs";
import { CronJob } from "cron";
import currDir from "./utils.js";
import normalizeData from "./data-normalizer.js";

const dirname = currDir(import.meta.url);

export const updateDataFile = async (byCron) => {
  try {
    if (byCron) console.log("Cron");
    console.log("Started data file update");
    console.log(new Date());

    const data = await normalizeData();

    if (data === undefined) {
      return console.error("updateDataFile: data undefined");
    }

    fs.writeFileSync(`${dirname}/data.json`, JSON.stringify(data));

    console.log("Data file updated successfully");
    console.log(new Date());
    console.log("==============================");
  } catch (error) {
    console.error("Error updating data file:", error);
  }

  return null;
};

export const scheduleDataUpdate = () => {
  // Every minute
  // const cronSchedule = "* * * * *";
  // Every hour
  // const cronSchedule = "0 * * * *";
  // Every 6 hours starting from midnight
  const cronSchedule = "0 */6 * * *";

  const updateJob = new CronJob(cronSchedule, () => updateDataFile(true));
  updateJob.start();
};
