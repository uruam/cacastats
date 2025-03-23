import dotenv from "dotenv";

dotenv.config();

/* eslint-disable no-promise-executor-return */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const fetchGameData = async (game, retryCount = 0) => {
  try {
    const gameResponse = await fetch(`${process.env.API_URL}/${game}`);

    return gameResponse.json();
  } catch (error) {
    console.error(`Error fetching game data for ${game}:`, error);

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying fetch for ${game}...`);
      await sleep(RETRY_DELAY);

      return fetchGameData(game, retryCount + 1);
    }
    console.error(
      `Failed to fetch data for ${game} after ${MAX_RETRIES} attempts.`,
    );

    return null;
  }
};

const fetchGamesData = async () => {
  console.log("Started fetching data");

  try {
    const response = await fetch(`${process.env.API_URL}/matches.json`);

    if (!response.ok) {
      throw new Error("No data from api");
    }
    const allGames = await response.json();

    const cacaGames = Object.keys(allGames)
      .filter((key) => {
        const maybeCacaGame = allGames[key];

        return (
          maybeCacaGame.servername === process.env.SERVERNAME &&
          maybeCacaGame.gametype === Number(process.env.GAMETYPE)
        );
      })
      .map((key) => ({ [key]: allGames[key] }));

    // Fetch all games data concurrently
    const gamesDataResponses = await Promise.all(
      cacaGames.map((cacaGame) => {
        const [game] = Object.keys(cacaGame);

        return game ? fetchGameData(game) : null;
      }),
    );

    return gamesDataResponses.filter(Boolean);
  } catch (error) {
    console.error("Error fetching data:", error);

    return null;
  }
};

export default fetchGamesData;
