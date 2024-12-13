import fetchGamesData from "./data-fetcher.js";

const hasBotPlayers = (players) =>
  players.some((player) => player.isbot === true);

const initWeaponEntries = (weapons) => {
  const updatedWeapons = { ...(weapons || {}) };
  Array.from({ length: 8 }, (_, i) => i + 1).forEach((weaponId) => {
    updatedWeapons[weaponId] = updatedWeapons[weaponId] || {
      kills: 0,
      shots: 0,
      hits: 0,
      damage: 0,
    };
  });

  return updatedWeapons;
};

const calculateTotalAcc = (weapons) => {
  const { totalShots, totalHits } = Object.values(weapons).reduce(
    (acc, weapon) => {
      acc.totalShots += weapon.shots;
      acc.totalHits += weapon.hits;

      return acc;
    },
    { totalShots: 0, totalHits: 0 },
  );

  const totalAcc =
    Math.round((totalHits * 100) / (totalShots || totalHits)) || 0;

  return totalAcc;
};

const calculateSkill = ({ score, time, wlr, kdr, dgdtr, hdg, acc }) => {
  const SCORE_WEIGHT = 1;
  const TIME_WEIGHT = 1;
  const HDG_WEIGHT = 1;
  const WLR_WEIGHT = 1.4;
  const KDR_WEIGHT = 1.7;
  const DGDTR_WEIGHT = 1.7;
  const ACC_WEIGHT = 1.5;

  // Minimum playtime threshold (10 hours)
  const MIN_TIME = 36000;

  // Apply a power to the timeFactor to decrease its effect (using square root)
  const timeFactor = Math.min(1, time / MIN_TIME) ** 0.5;

  const skill =
    // Log10 to scale down high scores, playtimes and HDG
    // Adding 1 to the value ensures that the logarithm function does not
    // receive a zero value, the logarithm of zero is undefined
    SCORE_WEIGHT * Math.log10(score + 1) +
    TIME_WEIGHT * Math.log10(time + 1) +
    HDG_WEIGHT * Math.log10(hdg + 1) +
    WLR_WEIGHT * wlr +
    KDR_WEIGHT * kdr +
    DGDTR_WEIGHT * dgdtr +
    (ACC_WEIGHT * acc) / 100;

  const adjustedSkill = skill * timeFactor * 100;
  const calculatedSkill = adjustedSkill.toFixed(0);

  return calculatedSkill;
};

const normalizeData = async () => {
  try {
    const gamesDataResponses = await fetchGamesData();

    if (gamesDataResponses === undefined) {
      return console.error("normalizeData: gamesDataResponses undefined");
    }

    const [firstGame] = gamesDataResponses;
    const [lastGame] = gamesDataResponses.slice(-1);
    const from = firstGame.time;
    const till = lastGame.time;
    const period = { from, till };
    let amountOfGamesNoBots = 0;

    const playersStats = {};

    gamesDataResponses.forEach((game) => {
      // Skip games with bots
      if (hasBotPlayers(game.players)) return;
      amountOfGamesNoBots += 1;

      // Determine the winning team, team 1 is red, team 2 is blue
      const winningTeam = game.score_red > game.score_blue ? 1 : 2;

      // Parse player stats for the current game
      game.players.forEach((player) => {
        const playerName = player.name;
        const isBot = player.isbot;
        const isAnon = player.isanon;

        if (isBot || isAnon) return;

        if (playersStats[playerName]) {
          // If the player already exists in the stats object, update the stats
          const stats = playersStats[playerName];
          stats.score += player.score;
          stats.time += player.playtime;
          stats.wins += player.team === winningTeam ? 1 : 0;
          stats.losses += player.team !== winningTeam ? 1 : 0;
          stats.wlr = stats.losses > 0 ? stats.wins / stats.losses : stats.wins;
          stats.kills += player.kills;
          stats.deaths += player.deaths;
          stats.kdr =
            stats.deaths > 0 ? stats.kills / stats.deaths : stats.kills;
          stats.dg += player.damage_given;
          stats.dt += player.damage_taken;
          stats.dgdtr = stats.dt > 0 ? stats.dg / stats.dt : stats.dg;
          stats.hdg = Math.max(stats.hdg, player.damage_given);

          Object.keys(player.weapons).forEach((weaponId) => {
            if (!stats.weapons) {
              stats.weapons = {};
            }
            if (!stats.weapons[weaponId]) {
              stats.weapons[weaponId] = {
                kills: 0,
                shots: 0,
                hits: 0,
                damage: 0,
              };
            }
            const weaponStats = stats.weapons[weaponId];
            weaponStats.kills += player.weapons[weaponId].kills;
            weaponStats.shots += player.weapons[weaponId].shots;
            weaponStats.hits += player.weapons[weaponId].hits;
            weaponStats.damage += player.weapons[weaponId].damage;
          });

          Object.keys(player.awards).forEach((award) => {
            if (!stats.awards) {
              stats.awards = {};
            }
            if (!stats.awards[award]) {
              stats.awards[award] = 0;
            }
            stats.awards[award] += player.awards[award];
          });

          stats.acc = calculateTotalAcc(stats.weapons);
          stats.skill = calculateSkill(stats);
        } else {
          // If the player doesn't exist in the stats object, add a new entry
          const initialStats = {
            name: playerName,
            score: player.score,
            time: player.playtime,
            wins: player.team === winningTeam ? 1 : 0,
            losses: player.team !== winningTeam ? 1 : 0,
            wlr: player.team === winningTeam ? 1 : 0,
            kills: player.kills,
            deaths: player.deaths,
            kdr:
              player.deaths > 0 ? player.kills / player.deaths : player.kills,
            dg: player.damage_given,
            dt: player.damage_taken,
            dgdtr:
              player.damage_taken > 0
                ? player.damage_given / player.damage_taken
                : player.damage_given,
            hdg: player.damage_given,
            weapons: initWeaponEntries(player.weapons),
            awards: player.awards,
            acc: calculateTotalAcc(initWeaponEntries(player.weapons)),
            period,
          };
          initialStats.skill = calculateSkill(initialStats);
          playersStats[playerName] = initialStats;
        }
      });
    });

    const playersStatsArray = Object.values(playersStats).sort(
      (a, b) => b.skill - a.skill,
    );

    console.log("Games altogether:", gamesDataResponses.length);
    console.log("Games without bots:", amountOfGamesNoBots);
    console.log("Nicknames:", playersStatsArray.length);

    return playersStatsArray;
  } catch (error) {
    console.error("Error normalizing data ", error);
  }

  return null;
};

export default normalizeData;
