const filterButtons = document.querySelectorAll(".filter-btn");
const games = document.querySelectorAll("li.schedule-item");
const searchContainer = document.querySelector(".search-container");
const searchToggle = document.querySelector("#search-toggle");
const searchInput = document.querySelector("#search-input");

searchToggle.addEventListener("click", () => {
    searchContainer.classList.toggle("active");

    if (searchContainer.classList.contains("active")) {
        searchInput.focus();
    } else {
        searchInput.value = "";
    }
});

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    games.forEach((game) => {
        const homeTeam = game.dataset.homeTeam.toLowerCase();
        const visitorTeam = game.dataset.visitorTeam.toLowerCase();
        const date = game.dataset.date.toLowerCase();

        const matches = homeTeam.includes(query) || visitorTeam.includes(query) || date.includes(query);

        game.style.display = matches ? "" : "none";
    });
});

scrollToNextGame();

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        // Update active button
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        const filter = button.dataset.filter;

        games.forEach((game) => {
            if (filter === "all") {
                game.style.display = "";
            } else if (filter === "home") {
                game.style.display = game.dataset.home === "true" ? "" : "none";
            } /**else if (filter === "away") {
                game.style.display = game.dataset.away === "true" ? "" : "none";
            }**/ else if (filter === "next") {
                game.style.display = game.dataset.next === "true" ? "" : "none";
            } else if (filter === "cup") {
                game.style.display = game.dataset.cup === "true" ? "" : "none";
            } else if (filter === "starred") {
                game.style.display = game.dataset.starred === "true" ? "" : "none";
            }
        });

        scrollToNextGame();
    });
});

function scrollToNextGame() {
    // Scroll to the next game
    const nextGame = document.querySelector(".next-game");

    if (nextGame) {
        nextGame.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }
}
