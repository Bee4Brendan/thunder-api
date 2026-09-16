const filterButtons = document.querySelectorAll(".filter-btn");
const games = document.querySelectorAll(".schedule-item");

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
            } else if (filter === "away") {
                game.style.display = game.dataset.away === "true" ? "" : "none";
            } else if (filter === "next") {
                game.style.display = game.dataset.next === "true" ? "" : "none";
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
