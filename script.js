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

// Co ile dymek przeskakuje na druga postac (tryb automatyczny).
const CYCLE_MS = 10000;
const bubbles = document.querySelectorAll(".bubble");

// Teksty losowane przy kazdej zmianie dymka.
const LINES = {
    "bubble-johny": [
        "Widziałaś gdzie moje okulary? 🤓 Jestem stary, zapomniałem ich.",
        "Wiem, krótkie spodenki na randkę 🩳 W dokumentacji nie było napisane, że nie wolno.",
        "Baciata? 💃 To jakiś nowy framework czy da się to zainstalować?",
        "Za moich czasów telefon miał kabel ☎️ a randka miała długie spodnie.",
        "Zrobiłem Ci excela z trasami w góry 📊 Dwanaście zakładek, filtry i wykres przewyższeń.",
        "Emotki w wiadomościach? Kto to widział takie fanaberie 🙄"
    ],
    "bubble-deedee": [
        "Cześć, jestem małym głodomorkiem 🥺 Masz pampucha?",
        "Lody czekoladowe to nie deser, to grupa żywieniowa 🍫🍦",
        "Wchodzimy na szczyt, robimy zdjęcie i schodzimy na lody ⛰️📸 Taki mam plan na życie.",
        "Loki już wie, że idziemy w góry 🐕 Wziął smycz i czeka przy drzwiach.",
        "Zatańczysz ze mną baciatę? 💃 Spokojnie, w krótkich spodenkach też można 🩳"
    ]
};

// pamiec ostatniego tekstu, zeby ten sam nie wypadl dwa razy z rzedu
const lastIndex = {};

function randomLine(bubbleId) {
    const lines = LINES[bubbleId];
    if (lines.length === 1) return lines[0];

    let index;
    do {
        index = Math.floor(Math.random() * lines.length);
    } while (index === lastIndex[bubbleId]);

    lastIndex[bubbleId] = index;
    return lines[index];
}

// Po wejsciu na strone zawsze leci ta odzywka, dopiero potem losowanie.
const OPENING_BUBBLE_ID = "bubble-johny";
const OPENING_LINE_INDEX = 2;

let nextBubbleId = OPENING_BUBBLE_ID;
let cycleTimer = null;

function otherBubbleId(id) {
    return id === "bubble-deedee" ? "bubble-johny" : "bubble-deedee";
}

function hideAllBubbles() {
    bubbles.forEach((b) => { b.hidden = true; });
}

function displayBubble(bubble, text) {
    hideAllBubbles();
    bubble.textContent = text || randomLine(bubble.id);
    bubble.hidden = false;
    nextBubbleId = otherBubbleId(bubble.id);
}

// Odlicza od nowa do kolejnej zmiany dymka. Wywolywane rowniez po kliknieciu,
// zeby po interakcji uzytkownik dostal pelne 10 sekund na przeczytanie.
function restartCycle() {
    clearTimeout(cycleTimer);
    cycleTimer = setTimeout(() => {
        displayBubble(document.getElementById(nextBubbleId));
        restartCycle();
    }, CYCLE_MS);
}

document.querySelectorAll(".char__btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const bubble = document.getElementById(btn.dataset.bubble);

        if (bubble.hidden) {
            displayBubble(bubble);
        } else {
            // ponowne klikniecie w gadajaca postac chowa dymek
            hideAllBubbles();
            nextBubbleId = otherBubbleId(bubble.id);
        }

        restartCycle();
    });
});

// klikniecie gdziekolwiek indziej / Escape chowa dymek, karuzela wraca za 10 s
function dismissBubbles() {
    hideAllBubbles();
    restartCycle();
}

document.addEventListener("click", dismissBubbles);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismissBubbles();
});

// start: stala odzywka Johnny'ego, po 10 sekundach karuzela przejmuje losowanie
lastIndex[OPENING_BUBBLE_ID] = OPENING_LINE_INDEX;
displayBubble(
    document.getElementById(OPENING_BUBBLE_ID),
    LINES[OPENING_BUBBLE_ID][OPENING_LINE_INDEX]
);
restartCycle();
