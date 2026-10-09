const players = document.querySelectorAll(".player");

// Get player ID from URL, e.g. /players/123
const currentPlayerId = window.location.pathname.split("/").pop();

// Highlight the current player in the roster
players.forEach((player) => {
    if (player.dataset.playerId === currentPlayerId) {
        player.classList.add("active");

        player.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    player.addEventListener("click", (event) => {
        const playerId = event.currentTarget.dataset.playerId;

        window.location.href = `/players/${playerId}`;
    });
});
