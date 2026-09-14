document.querySelectorAll(".player").forEach((player) => {
    player.addEventListener("click", (event) => {
        const playerId = event.currentTarget.dataset.playerId;
        console.log(`User clicked on ${event.currentTarget.textContent} with id ${playerId}`);

        window.location.href = `/players/${playerId}`;
    });
});