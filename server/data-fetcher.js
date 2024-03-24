const fetchGameData = async (game) => {
  const gameResponse = await fetch(`https://stats.dotsstuff.com/${game}`);

  return gameResponse.json();
};

const fetchGamesData = async () => {
  console.log("Started fetching data");

  try {
    const response = await fetch("https://stats.dotsstuff.com/matches.json");

    if (!response.ok) {
      throw new Error("No stuff from dots");
    }
    const allGames = await response.json();

    const cacaGames = Object.keys(allGames)
      .filter((key) => {
        const maybeCacaGame = allGames[key];

        return (
          maybeCacaGame.servername === "^2/^3N^2/^3ALLMODES^7|^5CA" &&
          maybeCacaGame.gametype === 8
        );
      })
      .map((key) => ({ [key]: allGames[key] }));

    const gamesDataPromises = [];

    cacaGames.forEach((cacaGame) => {
      const [game] = Object.keys(cacaGame);

      if (game) {
        gamesDataPromises.push(fetchGameData(game));
      } else {
        console.error(`No caca game found for: ${game}`);
      }
    });

    // Fetch all games data concurrently
    const gamesDataResponses = await Promise.all(gamesDataPromises);

    return gamesDataResponses;
  } catch (error) {
    return console.error("Error fetching data:", error);
  }
};

export default fetchGamesData;
