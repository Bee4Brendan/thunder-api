import "dotenv/config";
import express from "express";
import axios from "axios";

// Thunder variables
let thunderRoster = [];
const thunderID = 21;

// Express Setup
const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = "https://api.balldontlie.io/v1";
const config = {
    headers: { Authorization: process.env.BALLDONTLIE_API_KEY },
};

const currentThunderPlayers = [
    "Shai Gilgeous-Alexander", // 175
    "Jalen Williams", // 38017703
    "Chet Holmgren", // 38017685
    "Isaiah Hartenstein", // 201
    "Alex Caruso", // 89
    "Cason Wallace", // 56677833
    "Ajay Mitchell", // 1028037477
    "Jaylin Williams", // 38017706
    "Kenrich Williams", // 480
    "Nikola Topic", // 1028028932
    "Aday Mara", // 1091351965
    "Thomas Sorber", // 1057274983
    "Bennett Stirtz", // 1091353486
    "Jared McCain", // 1028027372
    "Otega Oweh", // 1091466034
    "Josh Dix", // 1091904395
    "Brooks Barnhizer", // 1057392335
];

const starredTeams = ["Spurs", "76ers", "Hawks", "Pistons"];

app.use(express.static("public"));

/**
 * 2026-27 Thunder Team <---- BALLDONTLIE API
 * @returns List of current Thunder players filtered from ALL Historical Thunder players
 * dating back to the beginning of SuperSonics team
 */
async function getThunderRoster(req, res, next) {
    try {
        if (thunderRoster.length === 0) {
            console.log("thunderRoster is EMPTY");
            //local variables
            const thunderPlayers = [];
            let cursor = null;

            // Retrieve all Thunder players (BALLDONTLIE API) by looping through all response pages until cursor is null
            do {
                // if cursor is null, it's the first request (don't include in url as query parameter) else cursor points to next page so include that as query parameter
                const url = cursor ? `${API_URL}/players?team_ids[]=${thunderID}&cursor=${cursor}&per_page=100` : `${API_URL}/players?team_ids[]=${thunderID}&per_page=100`;
                const playersResponse = await axios.get(url, config);
                thunderPlayers.push(...playersResponse.data.data);
                cursor = playersResponse.data.meta.next_cursor;
            } while (cursor);

            // Filter players that match my array of current Thunder players
            thunderRoster = thunderPlayers.filter((player) => currentThunderPlayers.includes(`${player.first_name} ${player.last_name}`));
        } else {
            console.log("thunderRoster is already POPULATED");
        }

        res.locals.thunderRoster = thunderRoster;

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * 2026-27 Thunder Schedule <---- BALLDONTLIE API
 * @returns List of Thunder games starting from Opening Night (Oct 20, 2026)
 * dating back to the beginning of SuperSonics team
 */
async function getThunderSchedule(req, res, next) {
    try {
        // retrieve Thunder games after Opening Night
        const startDate = "2026-10-20";
        const todaysDate = new Date().toISOString().split("T")[0]; // "e.g. 2026-09-02"
        const gamesResponse = await axios.get(API_URL + `/games?start_date=${startDate}&team_ids[]=${thunderID}&per_page=100`, config);

        // log games data
        console.log(gamesResponse.data.data);
        console.log(gamesResponse.data.data.length);

        // set thunderSchedule variable to all games
        const thunderSchedule = gamesResponse.data.data;

        let nextGame = false;
        let starredGames = [];

        // mark games as hasBeenPlayed, isStarred, and isThunderHomeGame
        thunderSchedule.forEach((game, index) => {
            // the first game that's in the future is the next game
            if (!nextGame && game.date > todaysDate) {
                nextGame = true;
                thunderSchedule.nextGame = game;
            }

            // game 1, game 2, etc.
            game.gameNumber = index + 1;
            // if the game is in the future, it hasn't been played (games that have been played will get strikethrough)
            game.date > todaysDate ? (game.hasBeenPlayed = false) : (game.hasBeenPlayed = true);
            // if the teams that are starred are either home or away team, the game is starred (rivals or contenders)
            !game.hasBeenPlayed && (starredTeams.includes(game.home_team.name) || starredTeams.includes(game.visitor_team.name)) ? (game.isStarred = true) : (game.isStarred = false);
            // if the home team is the Thunder, it's a Thunder Home Game (obviously) these will end up being blue in GUI
            game.home_team.name === "Thunder" ? (game.isThunderHomeGame = true) : (game.isThunderHomeGame = false);

            // convert to pretty dates
            const [year, month, day] = game.date.split("-");
            const gameDate = new Date(year, month - 1, day);
            game.date = gameDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            game.longDate = gameDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

            // if the game is starred, add it to starred games array so we can list them in Games GUI
            if (game.isStarred) {
                starredGames.push(game);
            }
        });

        thunderSchedule.starredGames = starredGames;
        res.locals.thunderSchedule = thunderSchedule;

        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Retrieves Thunder team data from the BALLDONTLIE API,
 *
 * @route GET /
 * @returns {HTML} Rendered index.ejs page containing Thunder team data
 */
app.get("/", async (req, res) => {
    try {
        // Retrieve Thunder Team from the BALLDONTLIE API
        const teamResponse = await axios.get(API_URL + `/teams/${thunderID}`, config);
        const thunderTeamInfo = teamResponse.data.data;
        console.log(thunderTeamInfo);

        res.render("index.ejs", { thunderTeamInfo });
    } catch (error) {
        console.error(error);
    }
});

/**
 * Retrieves Thunder roster data (getThunderRoster) from the BALLDONTLIE API,
 *
 * @route GET /players
 * @returns {HTML} Rendered players.ejs page containing a list Thunder of current players
 */
app.get("/players", getThunderRoster, async (req, res) => {
    try {
        // log the Roster to check
        console.log(thunderRoster);
        console.log(`thunderRoster length = ${thunderRoster.length}`);

        // render players page
        res.render("players.ejs", { selectedPlayer: null });
    } catch (error) {
        console.error(error);
    }
});

/**
 * Retrieves Selected Thunder player information from the ThunderRoster,
 *
 * @route GET /players/:id
 * @returns {HTML} Rendered players.ejs page with selected player information
 */
app.get("/players/:id", getThunderRoster, async (req, res) => {
    try {
        // find selected player by id
        res.locals.selectedPlayer = thunderRoster.find((player) => player.id === Number(req.params.id));
        console.log("SELECTED PLAYER:", res.locals.selectedPlayer);

        // render players page
        res.render("players.ejs");
    } catch (error) {
        console.error(error);
    }
});

/**
 * Retrieves all Thunder games from opening night (2026-27 Season)
 * from the BALLDONTLIE API,
 *
 * @route GET /players/games
 * @returns {HTML} Rendered games.ejs page with selected player information
 */
app.get("/games", getThunderSchedule, async (req, res) => {
    try {
        console.log("NEXT GAME:", res.locals.thunderSchedule.nextGame);
        res.render("games.ejs");
    } catch (error) {
        console.error(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});