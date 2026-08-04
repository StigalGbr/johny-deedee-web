// ---------- odliczanie ----------

// Cel: 5 sierpnia 2026, 20:00 czasu polskiego (CEST = UTC+2).
// Strefa jest zapisana na sztywno, zeby kazdy widzial ten sam wynik
// niezaleznie od ustawien swojej przegladarki.
const TARGET = new Date("2026-08-05T20:00:00+02:00");

const countdownEl = document.getElementById("countdown");

function renderCountdown() {
    const msLeft = TARGET.getTime() - Date.now();

    if (msLeft <= 0) {
        countdownEl.textContent = "Czas minął!";
        countdownEl.classList.add("is-finished");
        return false;
    }

    // godziny liczone lacznie (np. 26h), zgodnie z formatem "Pozostalo 26h 16min 39 sek"
    const totalSeconds = Math.floor(msLeft / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdownEl.textContent = `Pozostało ${hours}h ${minutes}min ${seconds} sek`;
    return true;
}

renderCountdown();
const timer = setInterval(() => {
    if (!renderCountdown()) clearInterval(timer);
}, 1000);

// ---------- dymki ----------

const AUTO_HIDE_MS = 6000;
const bubbles = document.querySelectorAll(".bubble");
let hideTimeout = null;

function hideAllBubbles() {
    clearTimeout(hideTimeout);
    bubbles.forEach((b) => { b.hidden = true; });
}

function showBubble(bubble) {
    const wasVisible = !bubble.hidden;
    hideAllBubbles();

    // ponowne klikniecie w te sama postac chowa dymek
    if (wasVisible) return;

    bubble.hidden = false;
    hideTimeout = setTimeout(hideAllBubbles, AUTO_HIDE_MS);
}

document.querySelectorAll(".char__btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
        event.stopPropagation();
        showBubble(document.getElementById(btn.dataset.bubble));
    });
});

// klikniecie gdziekolwiek indziej / Escape chowa dymki
document.addEventListener("click", hideAllBubbles);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideAllBubbles();
});
