// Cala logika strony. Teksty siedza w lines.js.

// ============================================================
//  USTAWIENIA
// ============================================================

// Domyslny cel: 5 sierpnia 2026, 20:00 czasu polskiego (CEST = UTC+2).
// Strefa jest zapisana na sztywno, zeby kazdy widzial ten sam wynik
// niezaleznie od ustawien swojej przegladarki.
const DEFAULT_TARGET = "2026-08-05T20:00:00+02:00";

const CYCLE_MS = 10000;         // przerwa miedzy dialogami
const REPLY_DELAY_MS = 3500;    // odstep miedzy kwestiami w duecie
const SPLASH_MIN_MS = 5500;      // tyle splash wisi, nawet gdy wszystko gotowe
const SPLASH_TIMEOUT_MS = 12000; // bezpiecznik, gdyby obrazek nie doszedl

const SPLASH_HEARTS = ["❤️", "💕", "💖", "💗", "💘"];
const SPLASH_FLICKER_CHANCE = 0.25;   // tyle liter szyldu lapie zadyszke
const URGENT_FROM_MS = 3600000; // ostatnia godzina - licznik sie niecierpliwi
const FINAL_FROM_MS = 60000;    // ostatnia minuta - odliczanie na pelny ekran
const NERD_CLICKS = 5;          // tyle klikniec w Johnnyego wlacza tryb nerda
const NERD_DURATION_MS = 25000;
const SHAKE_THRESHOLD = 22;

const CONFETTI_COLORS = ["#ffd93b", "#ff5f6d", "#7dff8a", "#5bc0eb", "#ffffff", "#a24f24"];
const GORE_COLORS = ["#8f0f12", "#b81c1c", "#6a0a10", "#d63131", "#4a0709"];

const el = (id) => document.getElementById(id);

const countdownEl = el("countdown");
const stageEl = el("stage");
const fxEl = el("fx");
const finalCountEl = el("final-count");
const finalNumberEl = el("final-count-number");
const bubbles = {
    johny: el("bubble-johny"),
    deedee: el("bubble-deedee")
};

const randomInt = (max) => Math.floor(Math.random() * max);

// ============================================================
//  DATA DOCELOWA
// ============================================================

// Date mozna podmienic przez adres:
//   ?do=2026-09-12T19:00   - konkretna godzina
//   ?do=2026-09-12         - sama data, godzina domyslna 20:00
// Bez podanej strefy przyjmujemy czas polski, czyli to samo co domyslnie.
function readTarget() {
    const raw = (new URLSearchParams(location.search).get("do") || "").trim();
    if (!raw) return new Date(DEFAULT_TARGET);

    let value = raw;
    if (!value.includes("T")) value += "T20:00";
    if (/T\d{2}:\d{2}$/.test(value)) value += ":00";
    if (!/(Z|[+-]\d{2}:?\d{2})$/.test(value)) value += "+02:00";

    const parsed = new Date(value);
    return isNaN(parsed) ? new Date(DEFAULT_TARGET) : parsed;
}

const TARGET = readTarget();

// ============================================================
//  LICZNIK
// ============================================================

function splitTime(ms) {
    const total = Math.floor(ms / 1000);
    return {
        hours: Math.floor(total / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60
    };
}

let finaleStarted = false;
let sceneStarted = false;

function renderCountdown() {
    const msLeft = TARGET.getTime() - Date.now();

    if (msLeft <= 0) {
        // final odpalamy dopiero po zejsciu splasha, zeby konfetti nie poszlo
        // w powietrze za zaslona
        if (sceneStarted) startFinale();
        renderElapsed(-msLeft);
        return;
    }

    const { hours, minutes, seconds } = splitTime(msLeft);

    if (msLeft > URGENT_FROM_MS) {
        countdownEl.textContent = `Pozostało ${hours}h ${minutes}min ${seconds} sek`;
        countdownEl.classList.remove("is-urgent");
        hideFinalCount();
        return;
    }

    countdownEl.classList.add("is-urgent");

    if (msLeft > FINAL_FROM_MS) {
        countdownEl.textContent = `Ostatnia prosta! ${minutes}min ${seconds} sek`;
        hideFinalCount();
        return;
    }

    // ostatnia minuta - wielkie cyfry na pelny ekran
    countdownEl.textContent = "Ostatnie sekundy!";
    finalCountEl.hidden = false;
    finalNumberEl.textContent = Math.ceil(msLeft / 1000);
}

// po dojsciu do zera licznik zaczyna liczyc w gore
function renderElapsed(ms) {
    const { hours, minutes, seconds } = splitTime(ms);
    countdownEl.textContent = `Randka trwa ${hours}h ${minutes}min ${seconds} sek 🎉`;
}

function hideFinalCount() {
    if (!finalCountEl.hidden) finalCountEl.hidden = true;
}

setInterval(renderCountdown, 250);

// ============================================================
//  DYMKI I DIALOGI
// ============================================================

// Kwestie rozbite per postac - potrzebne, gdy ktos kliknie w postac
// i chce uslyszec cokolwiek akurat od niej.
const SOLO_LINES = { johny: [], deedee: [] };
DIALOGS.forEach((turns) => turns.forEach(([who, text]) => SOLO_LINES[who].push(text)));

let dialogTimers = [];
let lastDialogIndex = -1;
const lastSoloIndex = {};

function clearDialogTimers() {
    dialogTimers.forEach(clearTimeout);
    dialogTimers = [];
}

function hideBubbles() {
    bubbles.johny.hidden = true;
    bubbles.deedee.hidden = true;
}

// raw = pokaz tekst doslownie, bez zamiany na binarke w trybie nerda
function showBubble(who, text, raw = false) {
    hideBubbles();
    const bubble = bubbles[who];
    bubble.textContent = !raw && nerdMode && who === "johny" ? randomNerdLine() : text;
    bubble.hidden = false;
}

function playDialog(index) {
    clearDialogTimers();
    lastDialogIndex = index;

    const turns = DIALOGS[index];
    turns.forEach(([who, text], i) => {
        dialogTimers.push(setTimeout(() => showBubble(who, text), i * REPLY_DELAY_MS));
    });

    const total = (turns.length - 1) * REPLY_DELAY_MS + CYCLE_MS;
    dialogTimers.push(setTimeout(nextDialog, total));
}

function nextDialog() {
    if (finaleStarted) return;

    let index;
    do {
        index = randomInt(DIALOGS.length);
    } while (index === lastDialogIndex && DIALOGS.length > 1);

    playDialog(index);
}

// pojedyncza kwestia wybranej postaci, bez powtorki tej samej dwa razy z rzedu
function randomSoloLine(who) {
    const lines = SOLO_LINES[who];
    let index;
    do {
        index = randomInt(lines.length);
    } while (index === lastSoloIndex[who] && lines.length > 1);

    lastSoloIndex[who] = index;
    return lines[index];
}

function scheduleNextDialog(delay = CYCLE_MS) {
    clearDialogTimers();
    if (!finaleStarted) dialogTimers.push(setTimeout(nextDialog, delay));
}

// ============================================================
//  KLIKNIECIA W POSTACIE
// ============================================================

document.querySelectorAll(".char__btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (finaleStarted) return;

        const who = btn.dataset.char;
        const bubble = bubbles[who];
        const img = btn.querySelector(".char__img");

        if (bubble.hidden) {
            showBubble(who, randomSoloLine(who));
        } else {
            hideBubbles();
        }

        scheduleNextDialog();

        if (who === "deedee") {
            rainTreats(img.getBoundingClientRect());
        } else {
            dropGlasses(img.getBoundingClientRect());
            countNerdClick();
        }
    });
});

// klikniecie gdziekolwiek indziej / Escape chowa dymek
function dismissBubbles() {
    if (finaleStarted) return;
    hideBubbles();
    scheduleNextDialog();
}

document.addEventListener("click", dismissBubbles);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismissBubbles();
});

// ============================================================
//  WARSTWA EFEKTOW
// ============================================================

// Kazdy efekt to krotko zyjacy element w #fx, animowany przez WAAPI
// i sprzatany po sobie.
function spawnFx(content, className = "") {
    const item = document.createElement("span");
    item.className = "fx__item " + className;
    item.textContent = content;
    fxEl.appendChild(item);
    return item;
}

function animateFx(item, keyframes, options) {
    // fill: backwards jest tu obowiazkowe - bez tego element czekajacy na swoje
    // opoznienie wisi przez chwile w lewym gornym rogu, zanim animacja go przejmie
    const animation = item.animate(keyframes, { fill: "backwards", ...options });
    animation.onfinish = () => item.remove();
    animation.oncancel = () => item.remove();
    return animation;
}

// Dee Dee: z gory leca lody i serduszka
function rainTreats(rect) {
    const treats = ["🍦", "🍫", "❤️", "🍨"];

    for (let i = 0; i < 14; i++) {
        const item = spawnFx(treats[randomInt(treats.length)]);
        item.style.fontSize = 18 + randomInt(18) + "px";

        const x = rect.left + Math.random() * rect.width;
        const drift = (Math.random() - 0.5) * 80;
        const spin = (Math.random() - 0.5) * 540;

        animateFx(item, [
            { transform: `translate(${x}px, -40px) rotate(0deg)`, opacity: 1 },
            { transform: `translate(${x + drift}px, ${window.innerHeight + 40}px) rotate(${spin}deg)`, opacity: 0.85 }
        ], {
            duration: 1600 + randomInt(1200),
            delay: randomInt(600),
            easing: "cubic-bezier(.35,0,.75,1)"
        });
    }
}

// Johnny: okulary spadaja z nosa, leza chwile i wracaja na miejsce
function dropGlasses(rect) {
    const item = spawnFx("👓");
    item.style.fontSize = Math.max(22, rect.width * 0.16) + "px";

    const x = rect.left + rect.width * 0.42;
    const y = rect.top + rect.height * 0.08;
    const groundY = window.innerHeight - 46;

    const fall = item.animate([
        { transform: `translate(${x}px, ${y}px) rotate(0deg)` },
        { transform: `translate(${x - 14}px, ${groundY}px) rotate(150deg)` }
    ], { duration: 650, easing: "cubic-bezier(.5,0,.85,1)", fill: "forwards" });

    fall.onfinish = () => {
        setTimeout(() => {
            animateFx(item, [
                { transform: `translate(${x - 14}px, ${groundY}px) rotate(150deg)`, opacity: 1 },
                { transform: `translate(${x}px, ${y}px) rotate(0deg)`, opacity: 0 }
            ], { duration: 500, easing: "ease-in" });
        }, 2600);
    };
}

// Tarantula rusza w strone Dee Dee, ale w polowie drogi dostaje z bazooki.
// Sekwencja: marsz -> Johnny sie sklada -> rakieta -> pajak peka -> podziekowania.
const SPIDER_WALK_MS = 1500;
const ROCKET_MS = 320;

let spiderBusy = false;

function releaseSpider() {
    if (spiderBusy || finaleStarted) return;
    spiderBusy = true;

    const size = Math.min(170, Math.max(80, Math.round(window.innerWidth * 0.11)));
    const spider = spawnFx("🕷️");
    spider.style.fontSize = size + "px";

    const y = window.innerHeight * (0.42 + Math.random() * 0.16);
    const midX = window.innerWidth * 0.5;

    spider.animate([
        { transform: `translate(${-size - 20}px, ${y}px) rotate(-8deg)` },
        { transform: `translate(${window.innerWidth * 0.18}px, ${y - 22}px) rotate(9deg)`, offset: 0.35 },
        { transform: `translate(${window.innerWidth * 0.34}px, ${y + 16}px) rotate(-9deg)`, offset: 0.7 },
        { transform: `translate(${midX}px, ${y}px) rotate(0deg)` }
    ], { duration: SPIDER_WALK_MS, easing: "linear", fill: "forwards" });

    clearDialogTimers();
    showBubble("deedee", REACTIONS.spider);

    // Kolejne fazy chodza na setTimeout, a nie na onfinish animacji. Animacje
    // sa wstrzymywane w karcie w tle - sekwencja zatrzymalaby sie w polowie,
    // zostawiajac pajaka na ekranie i blokade na kolejne wywolania.
    setTimeout(() => {
        showBubble("johny", REACTIONS.heroAim);
        aimBazooka();
    }, SPIDER_WALK_MS);

    setTimeout(() => fireRocket(spider, midX + size * 0.35, y + size * 0.4), SPIDER_WALK_MS + 480);
}

// Johnny zamienia sie w wersje z bazooka i po chwili wraca do siebie.
// Oba sprite'y maja ten sam kadr i te sama wielkosc postaci, wiec podmiana
// nie przesuwa go ani o piksel - to jest zrobione w align.py przy konwersji.
const JOHNY_SPRITE = "pic/johny-bravo.webp";
const JOHNY_BAZOOKA_SPRITE = "pic/johny-bazooka.webp";

// wylot lufy w ulamkach kadru sprite'a z bazooka
const MUZZLE_X = 0.983;
const MUZZLE_Y = 0.114;

function johnyImg() {
    return document.querySelector(".char--johny .char__img");
}

function aimBazooka() {
    const img = johnyImg();
    img.src = JOHNY_BAZOOKA_SPRITE;
    img.classList.add("is-armed");

    setTimeout(() => {
        img.src = JOHNY_SPRITE;
        img.classList.remove("is-armed");
    }, 2200);
}

function fireRocket(spider, targetX, targetY) {
    const img = johnyImg();
    const rect = img.getBoundingClientRect();
    const fromX = rect.left + rect.width * MUZZLE_X;
    const fromY = rect.top + rect.height * MUZZLE_Y;

    img.classList.add("is-firing");
    setTimeout(() => img.classList.remove("is-firing"), 220);

    const rocket = spawnFx("", "fx__rocket");
    animateFx(rocket, [
        { transform: `translate(${fromX}px, ${fromY}px) scale(0.6)` },
        { transform: `translate(${targetX}px, ${targetY}px) scale(1)` }
    ], { duration: ROCKET_MS, easing: "cubic-bezier(.3,0,.9,1)" });

    setTimeout(() => splatterSpider(spider, targetX, targetY), ROCKET_MS);
}

// Quake-owy zgon: rozbryzg, ochlapy na ekranie i wstrzas
function splatterSpider(spider, x, y) {
    spider.getAnimations().forEach((a) => a.cancel());
    spider.remove();

    fireConfetti(70, x, y, GORE_COLORS, true);

    for (let i = 0; i < 9; i++) {
        const splat = spawnFx("", "fx__splat");
        const size = 30 + randomInt(70);
        const sx = x + (Math.random() - 0.5) * 340;
        const sy = y + (Math.random() - 0.5) * 260;

        splat.style.width = size + "px";
        splat.style.height = size * (0.6 + Math.random() * 0.5) + "px";

        animateFx(splat, [
            { transform: `translate(${sx}px, ${sy}px) scale(0.2)`, opacity: 0 },
            { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 0.9, offset: 0.12 },
            { transform: `translate(${sx}px, ${sy + 26}px) scale(1)`, opacity: 0 }
        ], { duration: 2400, delay: randomInt(120) });
    }

    document.querySelector(".scene").classList.add("is-shaking");
    setTimeout(() => document.querySelector(".scene").classList.remove("is-shaking"), 420);

    setTimeout(() => {
        showBubble("deedee", REACTIONS.hero);
        cheerDeeDee();
        spiderBusy = false;
        scheduleNextDialog();
    }, 500);
}

// Namiastka zadowolonej Dee Dee: podskok i serduszka.
// Docelowo do podmiany na osobny render postaci, jesli sie pojawi.
function cheerDeeDee() {
    const img = document.querySelector(".char--deedee .char__img");
    const rect = img.getBoundingClientRect();

    img.classList.add("is-cheering");
    setTimeout(() => img.classList.remove("is-cheering"), 1400);

    for (let i = 0; i < 8; i++) {
        const heart = spawnFx(["❤️", "💖", "😍"][randomInt(3)]);
        heart.style.fontSize = 20 + randomInt(20) + "px";

        const hx = rect.left + rect.width * (0.2 + Math.random() * 0.6);
        const hy = rect.top + rect.height * 0.2;

        animateFx(heart, [
            { transform: `translate(${hx}px, ${hy}px) scale(0.4)`, opacity: 0 },
            { transform: `translate(${hx + (Math.random() - 0.5) * 60}px, ${hy - 140}px) scale(1)`, opacity: 1 }
        ], { duration: 1400, delay: randomInt(400), easing: "ease-out" });
    }
}

// ============================================================
//  KONFETTI
// ============================================================

const confettiCanvas = el("confetti");
const confettiCtx = confettiCanvas.getContext("2d");
let confettiPieces = [];
let confettiRaf = null;

function sizeConfetti() {
    const ratio = window.devicePixelRatio || 1;
    confettiCanvas.width = window.innerWidth * ratio;
    confettiCanvas.height = window.innerHeight * ratio;
    confettiCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// gib = tryb miesny: ciezsze, grubsze kawalki lecace na wszystkie strony,
// zamiast lekkich papierkow wystrzelonych do gory
function fireConfetti(count = 90, originX = window.innerWidth / 2, originY = window.innerHeight * 0.62,
    colors = CONFETTI_COLORS, gib = false) {

    for (let i = 0; i < count; i++) {
        const angle = gib
            ? Math.random() * Math.PI * 2
            : -Math.PI / 2 + (Math.random() - 0.5) * 1.7;
        const speed = gib ? 3 + Math.random() * 13 : 7 + Math.random() * 9;

        confettiPieces.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            w: gib ? 5 + Math.random() * 14 : 6 + Math.random() * 6,
            h: gib ? 5 + Math.random() * 14 : 9 + Math.random() * 8,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * (gib ? 0.6 : 0.35),
            color: colors[randomInt(colors.length)],
            gib
        });
    }

    if (!confettiRaf) confettiRaf = requestAnimationFrame(stepConfetti);
}

function stepConfetti() {
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    confettiPieces = confettiPieces.filter((p) => {
        p.vy += p.gib ? 0.42 : 0.22;
        p.vx *= p.gib ? 0.985 : 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.rot);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confettiCtx.restore();

        return p.y < window.innerHeight + 30;
    });

    confettiRaf = confettiPieces.length ? requestAnimationFrame(stepConfetti) : null;
}

countdownEl.addEventListener("click", (event) => {
    event.stopPropagation();
    const rect = countdownEl.getBoundingClientRect();
    fireConfetti(70, rect.left + rect.width / 2, rect.bottom + 10);
});

// ============================================================
//  FINAL
// ============================================================

function startFinale() {
    if (finaleStarted) return;
    finaleStarted = true;

    clearDialogTimers();
    hideBubbles();
    hideFinalCount();

    countdownEl.classList.remove("is-urgent");
    countdownEl.classList.add("is-finished");

    moveCharactersTogether();

    const finaleBubble = el("bubble-finale");
    finaleBubble.textContent = FINALE_LINE;
    setTimeout(() => { finaleBubble.hidden = false; }, 900);

    // trzy salwy z roznych stron
    fireConfetti(120, window.innerWidth * 0.2, window.innerHeight);
    setTimeout(() => fireConfetti(120, window.innerWidth * 0.8, window.innerHeight), 350);
    setTimeout(() => fireConfetti(160, window.innerWidth * 0.5, window.innerHeight * 0.9), 800);
}

// FLIP: mierzymy pozycje przed i po zmianie layoutu, cofamy roznice
// transformem i puszczamy animacje do zera. Dziala przy kazdej szerokosci
// ekranu, w przeciwienstwie do sztywnego przesuniecia.
//
// Zdejmowanie transformu robimy synchronicznie, po wymuszonym przeliczeniu
// stylow, a nie w requestAnimationFrame. W karcie w tle rAF jest wstrzymany,
// a licznik dobija do zera wlasnie wtedy, gdy nikt na strone nie patrzy -
// postacie zostalyby wtedy w cofnietej pozycji.
function moveCharactersTogether() {
    const chars = [...document.querySelectorAll(".char")];
    const before = chars.map((char) => char.getBoundingClientRect().left);

    stageEl.classList.add("is-finale");

    chars.forEach((char, i) => {
        const shift = before[i] - char.getBoundingClientRect().left;
        char.style.transition = "none";
        char.style.transform = `translateX(${shift}px)`;
    });

    // wymuszamy przeliczenie stylow z cofnietym przesunieciem,
    // zeby bylo od czego animowac
    void stageEl.offsetWidth;

    chars.forEach((char) => {
        char.style.transition = "";
        char.style.transform = "";
    });
}

// ============================================================
//  PAJAK: przycisk i potrzasniecie telefonem
// ============================================================

let lastShake = 0;

function onDeviceMotion(event) {
    const a = event.accelerationIncludingGravity;
    if (!a) return;

    const force = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
    const now = Date.now();

    if (force > SHAKE_THRESHOLD && now - lastShake > 3000) {
        lastShake = now;
        releaseSpider();
    }
}

// iOS wymaga zgody i to koniecznie z poziomu gestu uzytkownika,
// dlatego pytamy dopiero po kliknieciu przycisku.
function enableShake() {
    if (typeof DeviceMotionEvent === "undefined") return;

    if (typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission()
            .then((state) => {
                if (state === "granted") window.addEventListener("devicemotion", onDeviceMotion);
            })
            .catch(() => { });
    } else {
        window.addEventListener("devicemotion", onDeviceMotion);
    }
}

el("spider-btn").addEventListener("click", (event) => {
    event.stopPropagation();
    enableShake();
    releaseSpider();
});

// ============================================================
//  TRYB NERDA
// ============================================================

const matrixCanvas = el("matrix");
const matrixCtx = matrixCanvas.getContext("2d");

let nerdMode = false;
let nerdClicks = 0;
let nerdClickTimer = null;
let nerdOffTimer = null;
let matrixRaf = null;
let matrixDrops = [];

const toBinary = (text) => text
    .split("")
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");

const randomNerdLine = () => toBinary(NERD_PHRASES[randomInt(NERD_PHRASES.length)]);

function countNerdClick() {
    nerdClicks++;
    clearTimeout(nerdClickTimer);
    nerdClickTimer = setTimeout(() => { nerdClicks = 0; }, 2500);

    if (nerdClicks >= NERD_CLICKS) {
        nerdClicks = 0;
        toggleNerdMode();
    }
}

function toggleNerdMode() {
    nerdMode = !nerdMode;
    document.body.classList.toggle("is-nerd", nerdMode);
    clearTimeout(nerdOffTimer);

    if (nerdMode) {
        sizeMatrix();
        matrixRaf = requestAnimationFrame(stepMatrix);
        showBubble("johny", REACTIONS.nerdModeOn, true);
        scheduleNextDialog(4000);
        nerdOffTimer = setTimeout(toggleNerdMode, NERD_DURATION_MS);
    } else {
        cancelAnimationFrame(matrixRaf);
        matrixRaf = null;
        matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
}

function sizeMatrix() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    matrixDrops = new Array(Math.ceil(window.innerWidth / 16))
        .fill(0)
        .map(() => randomInt(matrixCanvas.height / 16));
}

function stepMatrix() {
    matrixCtx.fillStyle = "rgba(2, 10, 4, 0.09)";
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    matrixCtx.fillStyle = "#3ddc5b";
    matrixCtx.font = "14px Consolas, monospace";

    matrixDrops.forEach((y, i) => {
        matrixCtx.fillText(randomInt(2), i * 16, y * 16);
        matrixDrops[i] = y * 16 > matrixCanvas.height && Math.random() > 0.975 ? 0 : y + 1;
    });

    matrixRaf = requestAnimationFrame(stepMatrix);
}

// ============================================================
//  PLAN WIECZORU
// ============================================================

const planEl = el("plan");
const planToggle = el("plan-toggle");

el("plan-list").innerHTML = PLAN
    .map(([time, what]) => `<li><b>${time}</b><span>${what}</span></li>`)
    .join("");

planToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    planEl.hidden = !planEl.hidden;
    planToggle.setAttribute("aria-expanded", String(!planEl.hidden));
});

planEl.addEventListener("click", (event) => event.stopPropagation());

// ============================================================
//  FILM
// ============================================================

// Dzwiek gra, bo odtwarzanie startuje z klikniecia uzytkownika. Przegladarki
// blokuja tylko automatyczny start z dzwiekiem, bez zadnego gestu.

const movieEl = el("movie");
const player = el("movie-player");

function openMovie() {
    movieEl.hidden = false;
    player.currentTime = 0;
    player.muted = false;
    player.play().catch(() => { });

    // scena zamiera na czas filmu, zeby dymki nie gadaly zza odtwarzacza
    clearDialogTimers();
    hideBubbles();
}

function closeMovie() {
    player.pause();
    movieEl.hidden = true;
    scheduleNextDialog(1000);
}

el("movie-toggle").addEventListener("click", (event) => {
    event.stopPropagation();
    openMovie();
});

el("movie-close").addEventListener("click", (event) => {
    event.stopPropagation();
    closeMovie();
});

movieEl.addEventListener("click", (event) => {
    event.stopPropagation();
    // klikniecie w tlo obok odtwarzacza zamyka
    if (event.target === movieEl) closeMovie();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !movieEl.hidden) closeMovie();
});

// ============================================================
//  ROZMIARY PLOTEN
// ============================================================

window.addEventListener("resize", () => {
    sizeConfetti();
    if (nerdMode) sizeMatrix();
});

sizeConfetti();

// ============================================================
//  SPLASH
// ============================================================

// Bez tego przy pierwszym wejsciu (pusty cache) scena skladala sie na oczach
// uzytkownika: najpierw postacie na bialym tle, potem dymek, na koncu tlo.
// Splash schodzi dopiero, gdy wszystkie obrazki sa gotowe, a dialogi ruszaja
// razem z nim - dzieki temu pierwsza odzywka zawsze dostaje pelny czas.

const splash = el("splash");

function preloadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = url;
    });
}

// Napis skladamy z pojedynczych liter, zeby kazda mogla mrugac wlasnym
// rytmem - rowno swiecacy neon wyglada jak druk, a nie jak szyld.
function buildSplashTitle() {
    el("splash-show").textContent = SPLASH_SHOW;

    const title = el("splash-title");
    title.setAttribute("aria-label", SPLASH_TITLE);

    // Litery grupujemy w wyrazy, bo same z siebie sa osobnymi elementami
    // i napis lamal sie w polowie slowa na waskim ekranie.
    SPLASH_TITLE.split(" ").forEach((word) => {
        const box = document.createElement("span");
        box.className = "splash__word";

        [...word].forEach((sign) => {
            const letter = document.createElement("span");
            letter.className = "splash__letter";
            if (Math.random() < SPLASH_FLICKER_CHANCE) letter.classList.add("splash__letter--flicker");

            letter.textContent = sign;
            letter.style.setProperty("--tilt", `${(Math.random() - 0.5) * 7}deg`);
            letter.style.animationDelay = `${(Math.random() * -5).toFixed(2)}s`;

            box.appendChild(letter);
        });

        title.appendChild(box);
    });
}

function buildSplashHearts() {
    const box = el("splash-hearts");

    for (let i = 0; i < 14; i++) {
        const heart = document.createElement("span");
        heart.className = "splash__heart";
        heart.textContent = SPLASH_HEARTS[randomInt(SPLASH_HEARTS.length)];
        heart.style.left = `${Math.random() * 96}%`;
        heart.style.fontSize = `${14 + randomInt(22)}px`;
        heart.style.animationDuration = `${5 + Math.random() * 5}s`;
        heart.style.animationDelay = `${Math.random() * 5}s`;
        heart.style.setProperty("--spin", `${(Math.random() - 0.5) * 120}deg`);
        box.appendChild(heart);
    }
}

function revealScene() {
    if (sceneStarted) return;
    sceneStarted = true;

    renderCountdown();
    if (!finaleStarted) playDialog(OPENING_DIALOG_INDEX);

    splash.classList.add("is-hidden");
    splash.addEventListener("transitionend", () => splash.remove(), { once: true });

    // transitionend nie przychodzi, gdy karta jest w tle albo przejscia sa
    // wylaczone w systemie - splash zostalby wtedy w drzewie na zawsze
    setTimeout(() => splash.remove(), 1200);
}

buildSplashTitle();
buildSplashHearts();

const assets = [preloadImage("pic/background.webp"), preloadImage("pic/splash.webp")];
document.querySelectorAll(".char__img").forEach((img) => {
    if (!img.complete) assets.push(preloadImage(img.src));
});

// Sprite z bazooka sciagamy w tle. Bez tego pierwsze siegniecie po nia
// pokazywaloby pusta sylwetke, bo obrazek zaczalby sie ladowac dopiero
// w chwili podmiany.
preloadImage(JOHNY_BAZOOKA_SPRITE);

// Splash wisi az do spelnienia obu warunkow: obrazki gotowe i minimalny czas
// minal. Samo czekanie na obrazki trwaloby ulamek sekundy, a ekran powitalny
// ma byc widoczny.
let assetsReady = false;
let minTimeReached = false;
const splashStart = Date.now();

function tryReveal() {
    if (assetsReady && minTimeReached) revealScene();
}

// Pasek chodzi na timerze, a nie na requestAnimationFrame. rAF jest
// wstrzymywany, gdy karta nie jest na wierzchu, i pasek zamarzalby w miejscu
// zamiast po cichu dobiec do konca. Dziesiec odswiezen na sekunde w zupelnosci
// wystarcza, bo szerokosc i tak jest animowana przez CSS.
let splashTimer = null;

function renderSplashProgress() {
    const byTime = (Date.now() - splashStart) / SPLASH_MIN_MS;

    // dopoki obrazki nie sa gotowe, pasek zatrzymuje sie tuz przed koncem,
    // zeby nie oglaszal gotowosci, ktorej nie ma
    const value = assetsReady ? Math.min(1, byTime) : Math.min(0.97, byTime);
    el("splash-fill").style.width = `${(value * 100).toFixed(1)}%`;

    if (sceneStarted) clearInterval(splashTimer);
}

Promise.all(assets).then(() => {
    assetsReady = true;
    tryReveal();
});

setTimeout(() => {
    minTimeReached = true;
    tryReveal();
}, SPLASH_MIN_MS);

renderSplashProgress();
splashTimer = setInterval(renderSplashProgress, 100);

// bezpiecznik: gdyby ktorys obrazek nie chcial dojsc, sceny i tak nie blokujemy
setTimeout(revealScene, SPLASH_TIMEOUT_MS);
