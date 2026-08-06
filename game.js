// Dwa tryby gry pod jednym przyciskiem: badminton i obrona Dee Dee.
// Wspolna jest tylko obsluga plotna, petli i menu - reszta siedzi w obiektach
// MODES, ktore dostaja gotowe W, H i ctx.

(() => {
    const SPRITE_FILES = {
        johnyUp: "pic/johny-racket-up.webp",
        johnyDown: "pic/johny-racket-down.webp",
        deedeeUp: "pic/dee-dee-racket-up.webp",
        deedeeDown: "pic/dee-dee-racket-down.webp",
        johnyBazooka: "pic/johny-bazooka.webp",
        deedee: "pic/dee-dee.webp",

        plansza: "pic/plansza/board.webp",
        pionekJohny: "pic/plansza/pawn-johny.webp",
        pionekDeedee: "pic/plansza/pawn-deedee.webp",
        poleNormal: "pic/plansza/pole-normal.webp",
        poleShelter: "pic/plansza/pole-shelter.webp",
        poleBonus: "pic/plansza/pole-bonus.webp",
        poleWind: "pic/plansza/pole-wind.webp",
        poleView: "pic/plansza/pole-view.webp",
        poleSki: "pic/plansza/pole-ski.webp",
        poleHeart: "pic/plansza/pole-heart.webp",
        poleMeta: "pic/plansza/pole-meta.webp",
        poleLawina: "pic/plansza/pole-lawina.webp",
        poleZamiec: "pic/plansza/pole-zamiec.webp"
    };

    const sprites = {};
    Object.entries(SPRITE_FILES).forEach(([key, src]) => {
        sprites[key] = Object.assign(new Image(), { src });
    });

    const gameEl = document.getElementById("game");
    const stackEl = document.getElementById("game-stack");
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("game-score");
    const hintEl = document.getElementById("game-hint");
    const menuEl = document.getElementById("game-menu");
    const backEl = document.getElementById("game-back");
    const overEl = document.getElementById("game-over");
    const overText = document.getElementById("game-over-text");
    const diceEl = document.getElementById("dice");
    const diceRollBtn = document.getElementById("dice-roll");
    const diceWhoEl = document.getElementById("dice-who");
    const rulesBtn = document.getElementById("game-rules");
    const rulesEl = document.getElementById("rules");

    const FIELD_RATIO = 0.58;

    // Predkosci sa podane na klatke przy 60 Hz, a ekrany maja rozna czestotliwosc
    // - telefon czesto 120 Hz, monitor 60. Kiedys skalowalismy ruch jednym
    // mnoznikiem dt (ile klatek 60 Hz minelo), ale przy dlugiej, zacietej klatce
    // na slabszym PC dt bylo obcinane do MAX_DT i gra gubila czas - pajaki i
    // pilka ledwo sie ruszaly. Teraz zbieramy realny czas i wykonujemy tyle
    // stalych krokow po 1/60 s, ile go uzbieralo (patrz loop()). Tempo jest
    // wtedy takie samo przy 30, 60 i 120 Hz, niezaleznie od zaciec, a kazdy krok
    // to nadal ~1 klatka, wiec badmintonowa pilka nie przeskakuje rakietki.
    const FRAME_MS = 1000 / 60;
    const MAX_CATCHUP_MS = 250;  // po powrocie z innej karty nie doganiamy sekund naraz
    const MAX_STEPS = 20;        // bezpiecznik: nigdy nie zapetlamy sie na updateach

    let W = 0;
    let H = 0;
    let raf = null;
    let running = false;
    let mode = null;

    const rand = (max) => Math.floor(Math.random() * max);

    function drawSprite(sprite, cx, bottomY, height, flip) {
        if (!sprite.complete || !sprite.naturalWidth) return null;

        const w = height * (sprite.naturalWidth / sprite.naturalHeight);
        const x = cx - w / 2;

        ctx.save();
        if (flip) {
            ctx.translate(cx * 2, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(sprite, x, bottomY - height, w, height);
        ctx.restore();

        return { x, w, top: bottomY - height };
    }

    // ============================================================
    //  TRYB: BADMINTON
    // ============================================================

    const badminton = (() => {
        const T = GAME_TEXTS.badminton;

        const PADDLE_W = 0.018;
        const PADDLE_H = 0.44;
        const PADDLE_UP = 0.27;
        const PADDLE_DOWN = 0.73;
        const PADDLE_X_MIN = 0.12;
        const PADDLE_X_MAX = 0.3;
        const BALL_R = 0.018;
        const START_SPEED = 0.011;
        const SPEED_STEP = 0.0006;
        const MAX_SPEED = 0.024;
        const CPU_MISTAKE = 0.14;
        const CHAR_HEIGHT = 0.8;

        // Gracz prowadzi Dee Dee po prawej, Johnny jest komputerem.
        const state = {
            ball: { x: 0.5, y: 0.5, vx: START_SPEED, vy: 0.004 },
            johny: { up: true, hit: 0 },
            deedee: { up: true, hit: 0 },
            score: { player: 0, cpu: 0 },
            speed: START_SPEED
        };

        // Linia odbicia liczona z szerokosci postaci, zeby pasek zasiegu
        // wypadal przy rakietce, a nie w poprzek tulowia.
        let paddleX = PADDLE_X_MIN;

        function measure() {
            const sprite = sprites.johnyDown;
            const aspect = sprite.naturalWidth ? sprite.naturalWidth / sprite.naturalHeight : 0.55;
            paddleX = Math.min(PADDLE_X_MAX, Math.max(PADDLE_X_MIN, H * CHAR_HEIGHT * aspect / W));
        }

        function serve(towardCpu) {
            state.speed = START_SPEED;
            state.ball.x = 0.5;
            state.ball.y = 0.35 + Math.random() * 0.3;
            state.ball.vx = towardCpu ? -state.speed : state.speed;
            state.ball.vy = (Math.random() - 0.5) * 0.012;
        }

        function reset() {
            state.score.player = 0;
            state.score.cpu = 0;
            serve(Math.random() < 0.5);
        }

        // kolejnosc na pasku musi zgadzac sie ze stronami planszy:
        // Johnny gra po lewej, Dee Dee po prawej
        function score() {
            return `<b>Johnny</b><span class="game__points">${state.score.cpu}</span>`
                + `:<span class="game__points">${state.score.player}</span><b>Ty (Dee Dee)</b>`;
        }

        function point(who) {
            state.score[who]++;

            if (state.score[who] >= T.toWin) {
                finish(who === "player" ? T.winPlayer : T.winCpu);
                return;
            }

            serve(who === "player");
        }

        function covers(player, ballY) {
            const center = player.up ? PADDLE_UP : PADDLE_DOWN;
            return Math.abs(ballY - center) <= PADDLE_H / 2;
        }

        function bounce(player, ballY) {
            const center = player.up ? PADDLE_UP : PADDLE_DOWN;
            const offset = (ballY - center) / (PADDLE_H / 2);

            state.speed = Math.min(MAX_SPEED, state.speed + SPEED_STEP);
            state.ball.vx = Math.sign(state.ball.vx) * -state.speed;
            state.ball.vy = offset * state.speed * 0.9;
            player.hit = 1;
        }

        function update(dt) {
            const ball = state.ball;
            const stepX = ball.vx * dt;

            ball.x += stepX;
            ball.y += ball.vy * dt;

            if (ball.y < BALL_R) {
                ball.y = BALL_R;
                ball.vy = Math.abs(ball.vy);
            }
            if (ball.y > 1 - BALL_R) {
                ball.y = 1 - BALL_R;
                ball.vy = -Math.abs(ball.vy);
            }

            // Johnny decyduje, gdy pilka mija polowe boiska w jego strone
            if (ball.vx < 0 && ball.x < 0.5 && ball.x - stepX >= 0.5) {
                const shouldBeUp = ball.y < 0.5;
                state.johny.up = Math.random() < CPU_MISTAKE ? !shouldBeUp : shouldBeUp;
            }

            if (ball.vx < 0 && ball.x - BALL_R <= paddleX) {
                if (covers(state.johny, ball.y)) {
                    ball.x = paddleX + BALL_R;
                    bounce(state.johny, ball.y);
                } else if (ball.x < -0.05) {
                    point("player");
                }
            }

            if (ball.vx > 0 && ball.x + BALL_R >= 1 - paddleX) {
                if (covers(state.deedee, ball.y)) {
                    ball.x = 1 - paddleX - BALL_R;
                    bounce(state.deedee, ball.y);
                } else if (ball.x > 1.05) {
                    point("cpu");
                }
            }

            const fade = Math.pow(0.88, dt);
            state.johny.hit *= fade;
            state.deedee.hit *= fade;
        }

        function drawZone(player, side) {
            const pw = W * PADDLE_W;
            const ph = H * PADDLE_H;
            const x = side === "left" ? W * paddleX - pw : W * (1 - paddleX);
            const cy = H * (player.up ? PADDLE_UP : PADDLE_DOWN);

            ctx.save();
            ctx.fillStyle = side === "left" ? "#5bc0eb" : "#ff5f6d";
            ctx.globalAlpha = 0.3 + player.hit * 0.7;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 10 + player.hit * 30;
            ctx.beginPath();
            ctx.roundRect(x, cy - ph / 2, pw, ph, pw / 2);
            ctx.fill();
            ctx.restore();
        }

        function draw() {
            ctx.save();
            ctx.strokeStyle = "rgba(255,255,255,0.22)";
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 10]);
            ctx.beginPath();
            ctx.moveTo(W / 2, 0);
            ctx.lineTo(W / 2, H);
            ctx.stroke();
            ctx.restore();

            const h = H * CHAR_HEIGHT;
            const aspect = sprites.johnyDown.naturalWidth
                ? sprites.johnyDown.naturalWidth / sprites.johnyDown.naturalHeight
                : 0.55;
            const half = h * aspect / 2;

            // Oba rendery przedstawiaja postac zwrocona w lewo. Dee Dee gra po
            // prawej, wiec patrzy na siatke, a Johnnyego trzeba odbic.
            ctx.save();
            ctx.translate(state.johny.hit * -10, 0);
            drawSprite(sprites[state.johny.up ? "johnyUp" : "johnyDown"], half, H, h, true);
            ctx.restore();

            ctx.save();
            ctx.translate(state.deedee.hit * 10, 0);
            drawSprite(sprites[state.deedee.up ? "deedeeUp" : "deedeeDown"], W - half, H, h, false);
            ctx.restore();

            drawZone(state.johny, "left");
            drawZone(state.deedee, "right");

            ctx.save();
            ctx.fillStyle = "#fff";
            ctx.shadowColor = "#ffd93b";
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(state.ball.x * W, state.ball.y * H, BALL_R * W, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // gracz steruje Dee Dee
        function pointer(x, y) {
            state.deedee.up = y < H / 2;
        }

        function key(e) {
            if (e.key === "ArrowUp") state.deedee.up = true;
            if (e.key === "ArrowDown") state.deedee.up = false;
        }

        return { texts: T, measure, reset, update, draw, score, pointer, key, state };
    })();

    // ============================================================
    //  TRYB: OBRONA DEE DEE
    // ============================================================

    const obrona = (() => {
        const T = GAME_TEXTS.obrona;

        const CHAR_HEIGHT = 0.62;
        const SPIDER_SIZE = 0.11;        // wzgledem wysokosci pola
        const START_SPEED = 0.0016;      // ulamek szerokosci na klatke
        const SPEED_PER_KILL = 0.00006;
        const START_GAP = 95;            // klatek miedzy pajakami
        const MIN_GAP = 28;
        const GAP_PER_KILL = 2;
        const REACH = 0.82;              // za ta linia pajak dopada Dee Dee
        const ROCKET_FRAMES = 7;

        const GORE = ["#8f0f12", "#b81c1c", "#6a0a10", "#d63131"];

        const state = { spiders: [], shots: [], bits: [], kills: 0, lives: T.lives, odliczanie: 0, gap: START_GAP };

        let muzzle = { x: 0, y: 0 };

        function measure() {
            const h = H * CHAR_HEIGHT;
            const sprite = sprites.johnyBazooka;
            const aspect = sprite.naturalWidth ? sprite.naturalWidth / sprite.naturalHeight : 0.67;
            const w = h * aspect;

            // wylot lufy w ulamkach kadru sprite'a
            muzzle = { x: w * 0.983, y: H - h + h * 0.114 };
        }

        function reset() {
            state.spiders = [];
            state.shots = [];
            state.bits = [];
            state.kills = 0;
            state.lives = T.lives;
            state.odliczanie = state.gap = START_GAP;
        }

        function score() {
            const hearts = "❤️".repeat(Math.max(0, state.lives)) + "🖤".repeat(T.lives - Math.max(0, state.lives));
            return `<b>Ubite</b><span class="game__points">${state.kills}</span><b>${hearts}</b>`;
        }

        function spawn() {
            state.spiders.push({
                x: -0.06,
                y: 0.18 + Math.random() * 0.6,
                speed: START_SPEED + state.kills * SPEED_PER_KILL + Math.random() * 0.0006,
                wobble: Math.random() * Math.PI * 2
            });
        }

        function burst(x, y) {
            for (let i = 0; i < 26; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 5;
                state.bits.push({
                    x: x * W,
                    y: y * H,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 3 + Math.random() * 7,
                    color: GORE[rand(GORE.length)],
                    life: 1
                });
            }
        }

        function update(dt) {
            // odliczanie do nastepnego pajaka - petla, bo przy zacieciu klatki
            // dt moze przekroczyc caly odstep
            state.odliczanie -= dt;
            while (state.odliczanie <= 0) {
                spawn();
                state.odliczanie += state.gap;
            }

            state.spiders.forEach((s) => {
                s.x += s.speed * dt;
                s.wobble += 0.18 * dt;
            });

            // pajak, ktory dotarl do Dee Dee, zabiera zycie
            const reached = state.spiders.filter((s) => s.x >= REACH);
            if (reached.length) {
                state.lives -= reached.length;
                state.spiders = state.spiders.filter((s) => s.x < REACH);
                if (state.lives <= 0) finish(`${T.over}<br>Ubitych pająków: ${state.kills}`);
            }

            state.shots = state.shots.filter((shot) => {
                shot.t += dt;
                if (shot.t < ROCKET_FRAMES) return true;
                burst(shot.tx, shot.ty);
                return false;
            });

            state.bits = state.bits.filter((b) => {
                b.vy += 0.35 * dt;
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                b.life -= 0.02 * dt;
                return b.life > 0 && b.y < H + 20;
            });
        }

        function draw() {
            const h = H * CHAR_HEIGHT;
            const size = H * SPIDER_SIZE;

            drawSprite(sprites.johnyBazooka, h * 0.34, H, h, false);
            drawSprite(sprites.deedee, W - h * 0.28, H, h, false);

            // linia, za ktora pajak dopada Dee Dee
            ctx.save();
            ctx.strokeStyle = "rgba(255,95,109,0.35)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 8]);
            ctx.beginPath();
            ctx.moveTo(W * REACH, 0);
            ctx.lineTo(W * REACH, H);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.font = `${size}px serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            state.spiders.forEach((s) => {
                ctx.save();
                ctx.translate(s.x * W, s.y * H + Math.sin(s.wobble) * size * 0.12);
                ctx.rotate(Math.sin(s.wobble) * 0.18);
                ctx.fillText("🕷️", 0, 0);
                ctx.restore();
            });
            ctx.restore();

            ctx.save();
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            state.shots.forEach((shot) => {
                const p = shot.t / ROCKET_FRAMES;
                const x = muzzle.x + (shot.tx * W - muzzle.x) * p;
                const y = muzzle.y + (shot.ty * H - muzzle.y) * p;
                const grad = ctx.createLinearGradient(muzzle.x, muzzle.y, x, y);
                grad.addColorStop(0, "rgba(255,217,59,0)");
                grad.addColorStop(1, "#ff7a1a");
                ctx.strokeStyle = grad;
                ctx.beginPath();
                ctx.moveTo(muzzle.x, muzzle.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            });
            ctx.restore();

            state.bits.forEach((b) => {
                ctx.save();
                ctx.globalAlpha = Math.max(0, b.life);
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x - b.size / 2, b.y - b.size / 2, b.size, b.size);
                ctx.restore();
            });
        }

        function pointer(px, py) {
            const size = H * SPIDER_SIZE;

            for (let i = state.spiders.length - 1; i >= 0; i--) {
                const s = state.spiders[i];
                const dx = px - s.x * W;
                const dy = py - s.y * H;

                if (Math.hypot(dx, dy) <= size * 0.7) {
                    state.shots.push({ t: 0, tx: s.x, ty: s.y });
                    state.spiders.splice(i, 1);
                    state.kills++;
                    state.gap = Math.max(MIN_GAP, START_GAP - state.kills * GAP_PER_KILL);
                    return;
                }
            }
        }

        return { texts: T, measure, reset, update, draw, score, pointer, key: () => { }, state };
    })();

    // ============================================================
    //  TRYB: GORSKA PRZYGODA (plansza "Akcja w Karkonoszach")
    // ============================================================
    // Zasady i wzory animacji sa opisane w docs/akcja-w-karkonoszach.md,
    // rozdzial 7. TRASA i WYCIAG pochodza z plansza-trasa.js (danych sie nie
    // rusza - to zrodlo prawdy o polach).

    const gorska = (() => {
        const T = GAME_TEXTS.gorska;

        // Plansza jest portretowa (1536x2048), inaczej niz FIELD_RATIO reszty
        // gier - wlasne "ratio" trybu przestawia wysokosc plotna w resize().
        const BOARD_RATIO = 2048 / 1536;

        const PAUZA_KLATEK = 60;   // 1 s - po kazdym dymku gra przystaje, zeby dalo
                                   // sie go przeczytac, zanim ruszy dalej
        const WYNIK_KLATEK = 48;   // 0,8 s - liczba wyskakujaca na kostce po rzucie
        const DYMEK_KLATEK = 90;   // 1,5 s - tyle wisi plakietka "+2 BONUS"
        const SERCE_KLATEK = 150;  // 2,5 s - serduszko przy spotkaniu trzyma dluzej
        const SERCE_SKALA = 3;     // i jest wyraznie wieksze od zwyklej plakietki
        const BLYSK_KLATEK = 14;
        const KROK_KLATEK = 18;    // ~0,3 s na jeden skok miedzy sasiednimi polami
        const KROK_KLATEK_SZYBKI = 5;   // dlugie cofniecia (lawina, zamiec)
        const DLUGI_RUCH = 8;      // od tylu pol ruch przechodzi na szybkie tempo

        // Zamiec cofa az o 32 pola - w normalnym tempie to 13 sekund patrzenia,
        // jak pionek pelznie w dol. Przy dlugich odcinkach skracamy krok, przez
        // co zjazd wyglada jak porwanie przez zywiol, a nie jak spacer.
        const tempoRuchu = (pola) => (pola.length > DLUGI_RUCH ? KROK_KLATEK_SZYBKI : KROK_KLATEK);
        const WYCIAG_KLATEK = 55;  // dlugi, plynny przejazd kolejka (nie przez pola posrednie)
        const GADKA_KLATEK = 120;  // 2 s - dymek postaci, pokazuje sie na koncu tury
        const GADKA_SZANSA_ZWYKLE = 0.34;  // na zwyklych polach tylko co jakis czas
        const KRECENIE_KLATEK = 54;        // 0,9 s - kostka kreci sie w fazie "kreci"
        const KRECENIE_KLATEK_KROTKO = 10; // prefers-reduced-motion: krotsze krecenie

        const NASTROJ_KOLOR = {
            dobry: { tlo: "#7ed957", obrys: "#1c5e15" },
            zly: { tlo: "#ff5f6d", obrys: "#6e1119" }
        };

        // Teksty dymkow dla pol specjalnych - jedna funkcja dymek() nizej obsluguje
        // je wszystkie, zeby nie pisac osobnej animacji na kazdy typ pola.
        const DYMKI_POL = {
            bonus: { tekst: "+2 BONUS 😃", nastroj: "dobry" },
            view: { tekst: "+1 WIDOK 😃", nastroj: "dobry" },
            ski: { tekst: "+3 ZJAZD 🎿", nastroj: "dobry" },
            wind: { tekst: "−2 WIATR 😖", nastroj: "zly" },
            shelter: { tekst: "NASTĘPNY RZUT ×2 😴", nastroj: "dobry" },
            lift: { tekst: "WYCIĄG! 🚡", nastroj: "dobry" },
            meta: { tekst: "META! 🏆", nastroj: "dobry" },
            lawina: { tekst: "LAWINA! −10 😱", nastroj: "zly" },
            zamiec: { tekst: "ZAMIEĆ! W DÓŁ 🥶", nastroj: "zly" }
        };

        const POLE_SPRITE = {
            normal: "poleNormal",
            shelter: "poleShelter",
            bonus: "poleBonus",
            wind: "poleWind",
            view: "poleView",
            ski: "poleSki",
            start: "poleHeart",
            meta: "poleMeta",
            lift: "poleBonus",
            lawina: "poleLawina",
            zamiec: "poleZamiec"
        };

        // 0.22 zamiast 0.28 - oczka siedza blizej srodka, wiec maja wiekszy
        // odstep od zaokraglonej krawedzi kostki
        const PIP_POS = {
            LG: [-0.22, -0.22], PG: [0.22, -0.22],
            LS: [-0.22, 0], PS: [0.22, 0],
            LD: [-0.22, 0.22], PD: [0.22, 0.22],
            srodek: [0, 0]
        };
        const PIP_MAP = {
            1: ["srodek"],
            2: ["LG", "PD"],
            3: ["LG", "srodek", "PD"],
            4: ["LG", "PG", "LD", "PD"],
            5: ["LG", "PG", "srodek", "LD", "PD"],
            6: ["LG", "PG", "LS", "PS", "LD", "PD"]
        };

        const easeOut = (p) => 1 - Math.pow(1 - p, 3);

        // 1 pole, 2-4 pola, 5+ pol - bez tego pasek pisal "idzie 4 pól"
        function odmianaPol(n) {
            if (n === 1) return "pole";
            const jed = n % 10;
            const dwie = n % 100;
            return jed >= 2 && jed <= 4 && !(dwie >= 12 && dwie <= 14) ? "pola" : "pól";
        }
        const reducedMotion = () => window.matchMedia
            && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const state = {
            gracze: [
                { id: "johny", nazwa: "Johnny", rzucil: "wyrzucił", pole: 1, podwojnyRzut: false, faza: 0 },
                { id: "deedee", nazwa: "Dee Dee", rzucil: "wyrzuciła", pole: 1, podwojnyRzut: false, faza: 0 }
            ],
            ktory: 0,              // indeks gracza, ktory teraz rzuca
            faza: "rzut",          // rzut | kreci | rusza | efekt | koniec
            kostka: { t: 0, oczko: 1, wynik: 0, podwojone: false },
            ruch: null,            // stepped: {pola,krok,t,zliczEfekt,gracz} albo wyciag: {special:"wyciag",od,do,t,zliczEfekt,gracz}
            dymki: [],
            blyski: [],
            gadka: null,           // dymek postaci: {gracz, tekst, t}
            powodGadki: null,      // typ pola, ktore odpalilo efekt w tej turze
            pauza: 0,              // klatki przerwy po dymku - patrz PAUZA_KLATEK
            czekaNaGadke: null,    // {gracz, klucz} - dymek do pokazania po pauzie
            wynikT: -1,            // animacja liczby na kostce, -1 = nie leci
            opisEfektu: ""         // "+2 za pole" itp. do paska pod plansza
        };

        // wymuszony wynik nastepnego rzutu - hak testowy, patrz __test.rzut nizej
        let wymuszonyWynik = null;

        let poleSize = 0;
        let pionekH = 0;

        function measure() {
            // 0.046 to rozmiar z zaakceptowanego podgladu planszy (74 px przy
            // szerokosci 1536). Przy 0.034 pola byly za male, zeby zmiescic
            // czytelny numer.
            poleSize = W * 0.046;
            pionekH = H * 0.055;
        }

        function reset() {
            state.gracze.forEach((g) => {
                g.pole = 1;
                g.podwojnyRzut = false;
                g.faza = Math.random() * Math.PI * 2;   // kazdy pionek oddycha inaczej
            });
            state.ktory = rand(2);
            state.faza = "rzut";
            state.kostka = { t: 0, oczko: 1, wynik: 0, drugiRzut: 0 };
            state.ruch = null;
            state.dymki = [];
            state.blyski = [];
            state.gadka = null;
            state.powodGadki = null;
            state.pauza = 0;
            state.czekaNaGadke = null;
            state.wynikT = -1;
            state.opisEfektu = "";
            wymuszonyWynik = null;
        }

        function score() {
            const [j, d] = state.gracze;
            return `<b>Johnny</b><span class="game__points">${j.pole}</span>`
                + `<b>Dee Dee</b><span class="game__points">${d.pole}</span>`;
        }

        // buduje liste kolejnych numerow pol od "od" do "docelowe" (wlacznie),
        // do przodu albo do tylu - jeden wzor obslugujacy ruch i cofanie wiatru
        function polaOd(od, docelowe) {
            const start = Math.max(1, Math.min(64, od));
            const end = Math.max(1, Math.min(64, docelowe));
            const lista = [start];
            if (end >= start) {
                for (let n = start + 1; n <= end; n++) lista.push(n);
            } else {
                for (let n = start - 1; n >= end; n--) lista.push(n);
            }
            return lista;
        }

        // Jedna funkcja na wszystkie pola specjalne - dymek + blysk w miejscu pola.
        // "duzy" robi z tego serduszko przy spotkaniu: trzy razy wieksze i wisi
        // dluzej, bo to najmilszy moment w grze, a nie zwykla informacja.
        function dymek(pole, tekst, nastroj, duzy) {
            const p = TRASA[pole - 1];
            state.dymki.push({
                x: p.x, y: p.y, tekst, nastroj, t: 0,
                bok: (Math.random() - 0.5) * 2,
                zycie: duzy ? SERCE_KLATEK : DYMEK_KLATEK,
                skala: duzy ? SERCE_SKALA : 1,
                samTekst: !!duzy   // serduszko bez pigulki pod spodem
            });
            state.blyski.push({ x: p.x, y: p.y, t: 0, nastroj });
        }

        // Dymek postaci - to, co gracz mowi na koniec swojej tury. Leci po
        // rzucie, po dojsciu pionka i po plakietce z efektem. Teksty siedza
        // w GAME_BUBBLES w lines.js, po trzy na typ pola dla kazdej postaci.
        function gadka(gracz, klucz) {
            const pula = GAME_BUBBLES[klucz] || GAME_BUBBLES.zwykle;
            const teksty = pula[gracz.id] || [];
            if (!teksty.length) return;
            state.gadka = {
                gracz,
                tekst: teksty[rand(teksty.length)],
                t: 0
            };
        }

        // druga (skutkowa) animacja ruchu - bonus/widok/zjazd/wiatr. Flaga
        // zliczEfekt=false pilnuje zasady z rozdzialu 2: pole, na ktore gracza
        // przesunelo cudze pole, samo juz nie odpala swojego efektu.
        function ruszDalej(gracz, docelowe) {
            const cel = Math.max(1, Math.min(64, docelowe));
            if (cel === gracz.pole) { zakonczRuch(gracz); return; }
            const pola = polaOd(gracz.pole, cel);
            state.ruch = { pola, krok: 0, t: 0, tempo: tempoRuchu(pola), zliczEfekt: false, gracz };
            state.faza = "rusza";
        }

        function rozstrzygnijEfekt(gracz) {
            const pole = gracz.pole;
            const typ = TRASA[pole - 1].type;

            // zapamietujemy, co gracza spotkalo - dymek postaci leci dopiero na
            // koniec tury, czyli juz po ewentualnym przesunieciu na inne pole
            if (typ !== "normal") state.powodGadki = typ;

            // Po plakietce robimy pauze, zanim pionek pojedzie dalej - inaczej
            // "+2 BONUS" i ruch dzialy sie naraz i nie dalo sie ich rozroznic.
            const zPauza = (opis, dalej) => {
                state.opisEfektu = opis;
                state.pauza = PAUZA_KLATEK;
                dalej();
            };

            if (typ === "lift") {
                dymek(pole, DYMKI_POL.lift.tekst, DYMKI_POL.lift.nastroj);
                zPauza(`wjazd wyciągiem na ${WYCIAG.to} 🚡`, () => {
                    state.ruch = { special: "wyciag", od: pole, do: WYCIAG.to, t: 0, zliczEfekt: false, gracz };
                    state.faza = "rusza";
                });
                return;
            }
            if (typ === "bonus") { dymek(pole, DYMKI_POL.bonus.tekst, DYMKI_POL.bonus.nastroj); zPauza("+2 za pole ➡️", () => ruszDalej(gracz, pole + 2)); return; }
            if (typ === "view") { dymek(pole, DYMKI_POL.view.tekst, DYMKI_POL.view.nastroj); zPauza("+1 za widok 🔭", () => ruszDalej(gracz, pole + 1)); return; }
            if (typ === "ski") { dymek(pole, DYMKI_POL.ski.tekst, DYMKI_POL.ski.nastroj); zPauza("+3 za zjazd 🎿", () => ruszDalej(gracz, pole + 3)); return; }
            if (typ === "wind") { dymek(pole, DYMKI_POL.wind.tekst, DYMKI_POL.wind.nastroj); zPauza("−2 za wiatr 🌬️", () => ruszDalej(gracz, pole - 2)); return; }

            // Pola-katastrofy: te dwa robia z gry dramat. Cofaja na tyle daleko,
            // ze warto pokazac to jako osobny, dlugi zjazd - dlatego lecą przez
            // wszystkie pola po drodze, tak jak zwykly ruch.
            if (typ === "lawina") {
                dymek(pole, DYMKI_POL.lawina.tekst, DYMKI_POL.lawina.nastroj);
                const cel = Math.max(1, pole - KATASTROFY.lawina.cofa);
                zPauza(`LAWINA! −${KATASTROFY.lawina.cofa} pól, z powrotem na ${cel} 😱`,
                    () => ruszDalej(gracz, cel));
                return;
            }
            if (typ === "zamiec") {
                dymek(pole, DYMKI_POL.zamiec.tekst, DYMKI_POL.zamiec.nastroj);
                const cel = KATASTROFY.zamiec.doPola;
                zPauza(`ZAMIEĆ! z powrotem do Samotni, pole ${cel} 🥶`,
                    () => ruszDalej(gracz, cel));
                return;
            }
            if (typ === "shelter") {
                dymek(pole, DYMKI_POL.shelter.tekst, DYMKI_POL.shelter.nastroj);
                gracz.podwojnyRzut = true;
                state.opisEfektu = "następny rzut ×2 🏠";
            }

            zakonczRuch(gracz);
        }

        function zakonczRuch(gracz) {
            if (gracz.pole >= 64) {
                gracz.pole = 64;
                dymek(64, DYMKI_POL.meta.tekst, DYMKI_POL.meta.nastroj);
                gadka(gracz, "meta");
                state.faza = "koniec";
                finish(`${gracz.nazwa} wygrywa! 🏆<br>Szczyt Śnieżki zdobyty.`);
                return;
            }

            const inny = gracz === state.gracze[0] ? state.gracze[1] : state.gracze[0];
            const spotkanie = inny.pole === gracz.pole;
            if (spotkanie) {
                dymek(gracz.pole, "💗", "dobry", true);
                state.opisEfektu = "spotkanie! 💗";
            }

            // Dymek postaci na sam koniec tury. Na polach specjalnych zawsze,
            // na zwyklych tylko czasem - inaczej przy 43 zwyklych polach gra
            // zamienilaby sie w sciane tekstu.
            //
            // Powod bierzemy z state.powodGadki, a nie z pola, na ktorym gracz
            // stoi na koncu: bonus z pola 12 konczy ruch na 14, wiec sam typ
            // pola koncowego zgubilby to, ze przed chwila byl bonus.
            const powod = state.powodGadki || TRASA[gracz.pole - 1].type;
            state.powodGadki = null;

            let klucz = null;
            if (spotkanie) klucz = "spotkanie";
            else if (powod !== "normal") klucz = powod;
            else if (Math.random() < GADKA_SZANSA_ZWYKLE) klucz = "zwykle";

            // dymek postaci leci dopiero po pauzie - patrz updateGadka()
            state.czekaNaGadke = klucz ? { gracz, klucz } : null;
            state.faza = "gadka";
            if (state.dymki.length) state.pauza = PAUZA_KLATEK;
        }

        function zakonczSkoki(ruch) {
            const gracz = ruch.gracz;
            gracz.pole = ruch.pola[ruch.pola.length - 1];
            state.ruch = null;
            if (ruch.zliczEfekt) {
                state.faza = "efekt";
                rozstrzygnijEfekt(gracz);
            } else {
                zakonczRuch(gracz);
            }
        }

        function zakonczSpecjalny(ruch) {
            const gracz = ruch.gracz;
            gracz.pole = ruch.do;
            state.ruch = null;
            // wyciag sam nie odpala efektu pola docelowego (regula z rozdzialu 2)
            zakonczRuch(gracz);
        }

        function roll() {
            if (state.faza !== "rzut") return;
            state.faza = "kreci";
            state.kostka.t = 0;
            // Zerujemy poprzedni wynik od razu przy starcie krecenia. Wczesniej
            // pasek pod plansza pokazywal jeszcze przez chwile liczbe z
            // poprzedniej tury, bo kostka.wynik byla nadpisywana dopiero po
            // zakonczeniu animacji.
            state.kostka.wynik = 0;
            state.kostka.podwojone = false;
            state.wynikT = -1;
            state.opisEfektu = "";
        }

        function updateKrecenie(dt) {
            const kostka = state.kostka;
            kostka.t += dt;

            // migotanie scianek podczas kreta, az do samego konca animacji
            if (Math.floor(kostka.t) % 4 === 0) kostka.oczko = 1 + rand(6);

            const limit = reducedMotion() ? KRECENIE_KLATEK_KROTKO : KRECENIE_KLATEK;
            if (kostka.t < limit) return;

            const gracz = state.gracze[state.ktory];

            // Schronisko PODWAJA to, co wlasnie wypadlo, zamiast dokladac drugi
            // rzut. Przy dwoch rzutach kostka pokazywala jedna scianke, a pionek
            // szedl o sume dwoch - nie dalo sie tego powiazac wzrokiem.
            const oczko = wymuszonyWynik !== null ? wymuszonyWynik : 1 + rand(6);
            wymuszonyWynik = null;

            const podwojone = gracz.podwojnyRzut;
            gracz.podwojnyRzut = false;

            const wynik = podwojone ? oczko * 2 : oczko;

            kostka.wynik = wynik;
            kostka.oczko = Math.max(1, Math.min(6, oczko));
            kostka.podwojone = podwojone;
            state.wynikT = 0;   // liczba wyskakuje na kostce

            const cel = Math.min(64, gracz.pole + wynik);
            const pola = polaOd(gracz.pole, cel);
            state.ruch = { pola, krok: 0, t: 0, tempo: tempoRuchu(pola), zliczEfekt: true, gracz };
            state.faza = "rusza";
        }

        function updateRuch(dt) {
            const ruch = state.ruch;
            if (!ruch) return;

            if (reducedMotion()) {
                // pionek przeskakuje od razu - bez posredniego, plynnego ruchu
                if (ruch.special === "wyciag") zakonczSpecjalny(ruch);
                else { ruch.krok = ruch.pola.length - 1; zakonczSkoki(ruch); }
                return;
            }

            if (ruch.special === "wyciag") {
                ruch.t += dt;
                if (ruch.t >= WYCIAG_KLATEK) zakonczSpecjalny(ruch);
                return;
            }

            const krok = ruch.tempo || KROK_KLATEK;
            ruch.t += dt;
            while (ruch.t >= krok && ruch.krok < ruch.pola.length - 1) {
                ruch.t -= krok;
                ruch.krok++;
            }
            if (ruch.krok >= ruch.pola.length - 1) zakonczSkoki(ruch);
        }

        function update(dt) {
            // Animacje chodza zawsze, takze w trakcie pauzy - to wlasnie w niej
            // dymek ma sie unosic i gasnac.
            state.gracze.forEach((g) => { g.faza += 0.055 * dt; });

            state.dymki.forEach((d) => { d.t += dt; });
            state.dymki = state.dymki.filter((d) => d.t < d.zycie);

            state.blyski.forEach((b) => { b.t += dt; });
            state.blyski = state.blyski.filter((b) => b.t < BLYSK_KLATEK);

            if (state.gadka) {
                state.gadka.t += dt;
                if (state.gadka.t >= GADKA_KLATEK) state.gadka = null;
            }

            if (state.wynikT >= 0) {
                state.wynikT += dt;
                if (state.wynikT >= WYNIK_KLATEK) state.wynikT = -1;
            }

            // Pauza wstrzymuje sam przebieg gry: pionek nie rusza, tura nie
            // przechodzi dalej. Dzieki temu po kazdym dymku jest sekunda na
            // przeczytanie, co sie wlasciwie stalo.
            if (state.pauza > 0) {
                state.pauza -= dt;
                return;
            }

            if (state.faza === "kreci") updateKrecenie(dt);
            else if (state.faza === "rusza") updateRuch(dt);
            else if (state.faza === "gadka") updateGadka();
        }

        // Po ruchu: chwila na plakietke efektu, potem dymek postaci, potem
        // znowu chwila - i dopiero wtedy tura przechodzi na drugiego gracza.
        function updateGadka() {
            if (state.czekaNaGadke) {
                gadka(state.czekaNaGadke.gracz, state.czekaNaGadke.klucz);
                state.czekaNaGadke = null;
                state.pauza = PAUZA_KLATEK;
                return;
            }

            state.ktory = 1 - state.ktory;
            state.opisEfektu = "";
            state.faza = "rzut";
        }

        // ---------- rysowanie ----------

        function drawTlo() {
            const img = sprites.plansza;
            if (img.complete && img.naturalWidth) ctx.drawImage(img, 0, 0, W, H);
        }

        function drawPole(p, i) {
            const sprite = sprites[POLE_SPRITE[p.type]];
            if (!sprite || !sprite.complete || !sprite.naturalWidth) return;
            const w = poleSize;
            const h = poleSize * (sprite.naturalHeight / sprite.naturalWidth);
            const x = p.x * W;
            const y = p.y * H;
            ctx.drawImage(sprite, x - w / 2, y - h / 2, w, h);

            // Numer pola. Bez niego plansza nie spelnia wymogu z agendy ("kazde
            // pole musi miec numer") i nie da sie policzyc ruchu wzrokiem.
            // Na polach zwyklych numer idzie na srodek, na specjalnych nizej,
            // zeby nie zaslanial ikony.
            const zwykle = p.type === "normal";
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = `bold ${Math.round(w * (zwykle ? 0.42 : 0.32))}px "Trebuchet MS", sans-serif`;
            const ny = zwykle ? y : y + h * 0.30;
            if (zwykle) {
                ctx.fillStyle = "#3b2f1c";
            } else {
                ctx.lineWidth = Math.max(2, w * 0.07);
                ctx.strokeStyle = "rgba(0,0,0,.85)";
                ctx.strokeText(i + 1, x, ny);
                ctx.fillStyle = "#fff";
            }
            ctx.fillText(i + 1, x, ny);
            ctx.restore();
        }

        function drawPionek(gracz, sprite, kierunek) {
            const h = pionekH;
            const aspect = sprite.naturalWidth ? sprite.naturalWidth / sprite.naturalHeight : 0.75;
            const w = h * aspect;
            const rm = reducedMotion();

            const wRuchu = state.ruch && state.ruch.gracz === gracz;
            let px, py;

            if (wRuchu && state.ruch.special === "wyciag") {
                const ruch = state.ruch;
                const p = Math.min(1, ruch.t / WYCIAG_KLATEK);
                const a = TRASA[ruch.od - 1];
                const b = TRASA[ruch.do - 1];
                px = (a.x + (b.x - a.x) * p) * W;
                py = (a.y + (b.y - a.y) * p) * H + (rm ? 0 : Math.sin(p * Math.PI * 6) * H * 0.01);
            } else if (wRuchu) {
                const ruch = state.ruch;
                const p = Math.min(1, ruch.t / (ruch.tempo || KROK_KLATEK));
                const idxB = Math.min(ruch.krok + 1, ruch.pola.length - 1);
                const a = TRASA[ruch.pola[ruch.krok] - 1];
                const b = TRASA[ruch.pola[idxB] - 1];
                px = (a.x + (b.x - a.x) * p) * W;
                py = (a.y + (b.y - a.y) * p) * H - Math.sin(p * Math.PI) * H * 0.03;
            } else {
                const pole = TRASA[gracz.pole - 1];
                px = pole.x * W;
                py = pole.y * H + (rm ? 0 : Math.sin(gracz.faza) * H * 0.006);

                // obaj gracze na tym samym polu - rozsuwamy w poziomie, zeby sie
                // nie zaslaniali
                const inny = gracz === state.gracze[0] ? state.gracze[1] : state.gracze[0];
                const innyWRuchu = state.ruch && state.ruch.gracz === inny;
                // Odsuniecie musi byc porownywalne z szerokoscia pionka (~W*0.073),
                // inaczej pionki i tak na siebie nachodza - przy W*0.012 zaslanialy
                // sie w ponad 80%.
                if (!innyWRuchu && inny.pole === gracz.pole) px += kierunek * W * 0.030;
            }

            ctx.drawImage(sprite, px - w / 2, py - h, w, h);
        }

        function drawBlyski() {
            state.blyski.forEach((b) => {
                const p = b.t / BLYSK_KLATEK;
                const kolor = NASTROJ_KOLOR[b.nastroj];
                const promien = W * (0.02 + 0.05 * easeOut(p));

                ctx.save();
                ctx.globalAlpha = Math.max(0, 1 - p);
                ctx.strokeStyle = kolor.tlo;
                ctx.lineWidth = Math.max(0.5, 6 * (1 - p));
                ctx.beginPath();
                ctx.arc(b.x * W, b.y * H, promien, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            });
        }

        function drawDymki() {
            const rm = reducedMotion();

            state.dymki.forEach((d) => {
                const p = d.t / d.zycie;
                const kolor = NASTROJ_KOLOR[d.nastroj];
                const bujanie = rm ? 0 : Math.sin(p * Math.PI * 1.6) * W * 0.022 * d.bok;
                const skala = (p < 0.25 ? 0.4 + 2.4 * p : 1) * (d.skala || 1);
                const alpha = p < 0.15 ? p / 0.15 : 1 - Math.max(0, (p - 0.55) / 0.45);

                ctx.font = `${Math.round(W * 0.032)}px system-ui, sans-serif`;
                const szer = ctx.measureText(d.tekst).width + W * 0.03;
                const wys = W * 0.05;

                // Pola specjalne stoja tez przy samych krawedziach planszy
                // (np. 12 na x=0.921), wiec sam dymek trzeba wepchnac w kadr -
                // inaczej pigulka ucieka poza plansze i tekst sie urywa.
                const margines = szer / 2 + W * 0.01;
                const x = Math.min(W - margines, Math.max(margines, d.x * W + bujanie));
                const y = Math.max(wys, d.y * H - H * 0.075 * easeOut(p) - H * 0.03);

                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
                ctx.translate(x, y);
                ctx.scale(skala, skala);

                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                // serduszko leci samo, bez pigulki - pigulka przy trzykrotnym
                // powiekszeniu zakrywalaby pol planszy
                if (!d.samTekst) {
                    ctx.fillStyle = kolor.tlo;
                    ctx.strokeStyle = kolor.obrys;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.roundRect(-szer / 2, -wys / 2, szer, wys, wys / 2);
                    ctx.fill();
                    ctx.stroke();
                }

                ctx.fillStyle = "#16161d";
                ctx.fillText(d.tekst, 0, 1);
                ctx.restore();
            });
        }

        function drawKostka() {
            const size = W * 0.075;
            // Lewy dol: las miedzy Swiatynia Wang a szyldem START jest wolny od
            // pol i tabliczek. Wczesniej kostka stala w prawym gornym rogu,
            // czyli dokladnie na szyldzie "META - SNIEZKA".
            const cx = W * 0.09;
            const cy = H * 0.845;

            ctx.save();
            ctx.translate(cx, cy);

            if (state.faza === "kreci") {
                const limit = reducedMotion() ? KRECENIE_KLATEK_KROTKO : KRECENIE_KLATEK;
                const p = Math.min(1, state.kostka.t / limit);
                const skala = 1 + Math.sin(p * Math.PI) * 0.25;
                ctx.rotate(easeOut(p) * Math.PI * 6);
                ctx.scale(skala, skala);
            }

            // rozowa, mocno zaokraglona, z bialymi oczkami
            ctx.fillStyle = "#ff5f9e";
            ctx.strokeStyle = "#16161d";
            ctx.lineWidth = Math.max(2, size * 0.07);
            ctx.shadowColor = "rgba(0,0,0,.5)";
            ctx.shadowBlur = size * 0.3;
            ctx.beginPath();
            ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.34);
            ctx.fill();
            ctx.stroke();
            ctx.shadowColor = "transparent";

            ctx.fillStyle = "#fff";
            const kropka = size * 0.085;
            (PIP_MAP[state.kostka.oczko] || PIP_MAP[1]).forEach((klucz) => {
                const [ox, oy] = PIP_POS[klucz];
                ctx.beginPath();
                ctx.arc(ox * size, oy * size, kropka, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();

            // Wynik wyskakuje nad kostka: od malej do duzej, z odbiciem i
            // zanikiem. To jest ten moment, w ktorym gracz widzi, ile wypadlo.
            if (state.wynikT >= 0 && state.kostka.wynik) {
                const p = state.wynikT / WYNIK_KLATEK;
                // rosnie z przestrzeleniem i wraca - stad sinus ponad 1
                const skala = p < 0.55
                    ? 0.25 + 1.35 * easeOut(p / 0.55)
                    : 1.6 - 0.25 * easeOut((p - 0.55) / 0.45);
                const alpha = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;

                ctx.save();
                ctx.globalAlpha = Math.max(0, alpha);
                ctx.translate(cx, cy - size * 0.95);
                ctx.scale(skala, skala);
                ctx.font = `bold ${Math.round(size * 0.5)}px "Trebuchet MS", sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.lineWidth = size * 0.11;
                ctx.strokeStyle = "#16161d";
                ctx.strokeText(state.kostka.wynik, 0, 0);
                ctx.fillStyle = "#ffd93b";
                ctx.fillText(state.kostka.wynik, 0, 0);

                // Przy podwojeniu kostka pokazuje inna scianke niz liczba pol,
                // wiec dopisujemy skad ta roznica.
                if (state.kostka.podwojone) {
                    ctx.font = `bold ${Math.round(size * 0.26)}px "Trebuchet MS", sans-serif`;
                    ctx.lineWidth = size * 0.07;
                    ctx.strokeText("×2", size * 0.52, -size * 0.2);
                    ctx.fillStyle = "#7ed957";
                    ctx.fillText("×2", size * 0.52, -size * 0.2);
                }
                ctx.restore();
            }
        }

        // Zolty trojkacik nad pionkiem gracza, ktory ma rzucac. Gasnie w chwili
        // wcisniecia przycisku (faza przestaje byc "rzut") i wraca dopiero, gdy
        // tura przejdzie na drugiego gracza - inaczej wisial nad pionkiem w
        // trakcie ruchu i mylil, kto wlasciwie gra.
        function drawWskaznik() {
            if (state.faza !== "rzut") return;
            const gracz = state.gracze[state.ktory];

            const pole = TRASA[gracz.pole - 1];
            const inny = gracz === state.gracze[0] ? state.gracze[1] : state.gracze[0];
            const kierunek = gracz === state.gracze[0] ? -1 : 1;
            const razem = !state.ruch && inny.pole === gracz.pole;

            const x = pole.x * W + (razem ? kierunek * W * 0.030 : 0);
            const podskok = reducedMotion() ? 0 : Math.sin(gracz.faza * 1.6) * H * 0.005;
            const y = pole.y * H - pionekH - H * 0.018 + podskok;
            const b = W * 0.018;   // polowa podstawy trojkata

            ctx.save();
            ctx.fillStyle = "#ffd93b";
            ctx.strokeStyle = "#16161d";
            ctx.lineWidth = Math.max(1.5, W * 0.004);
            ctx.beginPath();
            ctx.moveTo(x, y + b);          // wierzcholek wskazuje w dol, na pionek
            ctx.lineTo(x - b, y - b * 0.7);
            ctx.lineTo(x + b, y - b * 0.7);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // Dymek postaci - biala pigulka z ciemnym obrysem i ogonkiem, czyli ten
        // sam jezyk wizualny co dymki na stronie glownej (.bubble w style.css).
        function drawGadka() {
            const g = state.gadka;
            if (!g) return;

            const p = g.t / GADKA_KLATEK;
            const skala = p < 0.12 ? 0.5 + 4 * p : 1;        // krotkie "pop"
            const alpha = p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1;

            const pole = TRASA[g.gracz.pole - 1];
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

            ctx.font = `600 ${Math.round(W * 0.026)}px "Segoe UI", Tahoma, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const szer = ctx.measureText(g.tekst).width + W * 0.036;
            const wys = W * 0.052;
            const ogon = W * 0.014;

            // dymek trzyma sie w kadrze tak samo jak plakietki efektow
            const margines = szer / 2 + W * 0.012;
            const x = Math.min(W - margines, Math.max(margines, pole.x * W));
            const y = Math.max(wys / 2 + ogon, pole.y * H - pionekH - H * 0.055);

            ctx.translate(x, y);
            ctx.scale(skala, skala);

            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#16161d";
            ctx.lineWidth = Math.max(2, W * 0.005);
            ctx.beginPath();
            ctx.roundRect(-szer / 2, -wys / 2, szer, wys, wys * 0.42);
            ctx.fill();
            ctx.stroke();

            // ogonek w strone pionka - rysowany po pigulce, zeby obrys sie zszyl
            const przesun = Math.max(-szer / 2 + ogon * 2, Math.min(szer / 2 - ogon * 2, pole.x * W - x));
            ctx.beginPath();
            ctx.moveTo(przesun - ogon, wys / 2 - 1);
            ctx.lineTo(przesun + ogon, wys / 2 - 1);
            ctx.lineTo(przesun, wys / 2 + ogon);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#16161d";
            ctx.fillText(g.tekst, 0, 1);
            ctx.restore();
        }

        function draw() {
            drawTlo();
            TRASA.forEach((p, i) => drawPole(p, i));
            drawPionek(state.gracze[0], sprites.pionekJohny, -1);
            drawPionek(state.gracze[1], sprites.pionekDeedee, 1);
            drawWskaznik();
            drawBlyski();
            drawDymki();
            drawGadka();
            drawKostka();
        }

        // ---------- pasek kostki (DOM przycisk, patrz pulapka 7.1b) ----------

        let lastDiceDisabled = null;
        let lastDiceLabel = null;

        function updateDice() {
            const disabled = state.faza !== "rzut";
            if (disabled !== lastDiceDisabled) {
                diceRollBtn.disabled = disabled;
                lastDiceDisabled = disabled;
            }

            const gracz = state.gracze[state.ktory];
            const k = state.kostka;

            let label;
            if (state.faza === "koniec") {
                label = "Koniec gry 🏆";
            } else if (state.faza === "rzut") {
                label = `Rzuca ${gracz.nazwa}`;
                if (gracz.podwojnyRzut) label += " — rzut ×2 🏠";
            } else if (state.faza === "kreci" || !k.wynik) {
                // w trakcie krecenia nie ma jeszcze wyniku - nie pokazujemy nic,
                // co mogloby wygladac na liczbe z poprzedniej tury
                label = `${gracz.nazwa} rzuca kostką…`;
            } else {
                label = k.podwojone
                    ? `${gracz.nazwa} ${gracz.rzucil} ${k.oczko} ×2 = ${k.wynik} ${odmianaPol(k.wynik)} 🏠`
                    : `${gracz.nazwa} ${gracz.rzucil} ${k.wynik}`;
                if (state.opisEfektu) label += `, ${state.opisEfektu}`;
            }

            if (label !== lastDiceLabel) {
                diceWhoEl.textContent = label;
                lastDiceLabel = label;
            }
        }

        // gra idzie na przycisku i kostce, canvas nie reaguje na wskaznik -
        // patrz pulapka 7.1b (mousemove nie moze rzucac kostka)
        function pointer() { }

        function key(e) {
            if (e.key === " " || e.code === "Space") {
                e.preventDefault();
                roll();
            }
        }

        // ---------- haki testowe, patrz rozdzial 7.8 ----------

        function testSetPole(id, nr) {
            const gracz = state.gracze.find((g) => g.id === id);
            if (!gracz) return false;
            gracz.pole = Math.max(1, Math.min(64, nr));
            return true;
        }

        function testRzut(wartosc) {
            if (state.faza !== "rzut") return false;
            // bez argumentu ma pojsc normalny, losowy rzut - samo przypisanie
            // undefined przechodzilo test "!== null" i dawalo wynik undefined
            wymuszonyWynik = wartosc === undefined ? null : wartosc;
            roll();
            return true;
        }

        return {
            texts: T, ratio: BOARD_RATIO,
            measure, reset, update, draw, score, pointer, key,
            roll, updateDice, state,
            __test: { setPole: testSetPole, rzut: testRzut }
        };
    })();

    const MODES = { badminton, obrona, gorska };

    // ============================================================
    //  WSPOLNA OBSLUGA
    // ============================================================

    function resize() {
        // Plansza gorska jest wysoka (1536x2048), a reszta trybow jest szeroka -
        // FIELD_RATIO nie pasuje do obu, wiec kazdy tryb moze podac swoje "ratio".
        const ratioTrybu = (mode && mode.ratio) || FIELD_RATIO;
        canvas.style.height = Math.round(canvas.clientWidth * ratioTrybu) + "px";

        // Bufor rysowania bierzemy z faktycznego pola tresci, a nie z liczby
        // wpisanej w style. Przy box-sizing: border-box obramowanie zjada
        // kilka pikseli i obraz bylby delikatnie rozciagniety w pionie.
        const ratio = window.devicePixelRatio || 1;
        W = canvas.clientWidth;
        H = canvas.clientHeight;

        canvas.width = Math.round(W * ratio);
        canvas.height = Math.round(H * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

        if (mode) mode.measure();
    }

    function finish(text) {
        running = false;
        overText.innerHTML = text;
        overEl.hidden = false;
    }

    // ---------- zasady ----------

    // Tresc budujemy raz, przy pierwszym otwarciu - ikony pol sa te same pliki,
    // ktore rysuje plansza, wiec legenda nie moze sie z nia rozjechac.
    let zasadyGotowe = false;

    function zbudujZasady() {
        if (zasadyGotowe) return;
        document.getElementById("rules-title").textContent = ZASADY.tytul;
        document.getElementById("rules-body").innerHTML =
            `<p class="rules__cel">${ZASADY.cel}</p>`
            + `<ul class="rules__list">`
            + ZASADY.pola.map((p) => `<li class="rules__item${p.straszne ? " rules__item--strasz" : ""}">
                    <img class="rules__icon" src="pic/plansza/${p.ikona}.webp" alt="">
                    <span class="rules__name">${p.nazwa}</span>
                    <span class="rules__desc">${p.opis}</span>
                </li>`).join("")
            + `</ul><p class="rules__note">${ZASADY.uwaga}</p>`;
        zasadyGotowe = true;
    }

    function otworzZasady() {
        zbudujZasady();
        rulesEl.hidden = false;
        document.getElementById("rules-close").focus();
    }

    const zamknijZasady = () => { rulesEl.hidden = true; };

    rulesBtn.addEventListener("click", (e) => { e.stopPropagation(); otworzZasady(); });
    document.getElementById("rules-close").addEventListener("click", (e) => {
        e.stopPropagation();
        zamknijZasady();
    });
    rulesEl.addEventListener("click", (e) => {
        e.stopPropagation();
        if (e.target === rulesEl) zamknijZasady();   // klik w tlo zamyka
    });

    let lastFrame = 0;
    let acc = 0;            // nieprzetworzony czas symulacji w ms
    let lastScore = "";     // ostatnio wypisany wynik - nie ruszamy DOM co klatke

    function loop(now) {
        if (running) {
            // Zacieta klatka (nawet 200-400 ms na slabszym PC) ma zostac
            // dogoniona krokami. Przycinamy tylko wielkie dziury po powrocie z
            // innej karty, zeby nie odtwarzac naraz kilku sekund gry.
            const elapsed = lastFrame ? Math.min(now - lastFrame, MAX_CATCHUP_MS) : FRAME_MS;
            acc += elapsed;

            let steps = 0;
            while (acc >= FRAME_MS && steps < MAX_STEPS) {
                mode.update(1);
                acc -= FRAME_MS;
                steps++;
            }
            if (steps === MAX_STEPS) acc = 0;  // nie odkladaj zaleglosci bez konca

            const s = mode.score();
            if (s !== lastScore) {
                scoreEl.innerHTML = s;
                lastScore = s;
            }

            // tylko gorska ma pasek kostki - reszta trybow tej metody nie definiuje
            if (mode.updateDice) mode.updateDice();
        }

        lastFrame = now;

        ctx.clearRect(0, 0, W, H);
        if (mode) mode.draw();

        raf = requestAnimationFrame(loop);
    }

    function startMode(name) {
        mode = MODES[name];
        menuEl.hidden = true;
        overEl.hidden = true;
        backEl.hidden = false;
        hintEl.textContent = mode.texts.hint;

        // plansza gorska jest wysoka - bez tej klasy .game__stack (width: min(900px,
        // 96vw)) dawaloby jej ~1200px wysokosci i wyjezdzalaby poza ekran (pulapka 7.1a)
        stackEl.classList.toggle("game__stack--plansza", !!mode.ratio);
        // pasek kostki i zasady istnieja tylko dla trybu, ktory definiuje roll()
        diceEl.hidden = !mode.roll;
        rulesBtn.hidden = !mode.roll;
        rulesEl.hidden = true;

        resize();
        mode.reset();
        lastScore = mode.score();
        scoreEl.innerHTML = lastScore;
        lastFrame = 0;   // pierwsza klatka po starcie zaczyna liczenie czasu od zera
        acc = 0;
        running = true;
    }

    function showMenu() {
        running = false;
        mode = null;
        menuEl.hidden = false;
        overEl.hidden = true;
        backEl.hidden = true;
        stackEl.classList.remove("game__stack--plansza");
        diceEl.hidden = true;
        rulesBtn.hidden = true;
        rulesEl.hidden = true;
        scoreEl.innerHTML = "";
        lastScore = "";
        hintEl.textContent = "";
        ctx.clearRect(0, 0, W, H);
    }

    document.getElementById("game-menu-title").textContent = GAME_TEXTS.menuTitle;
    document.getElementById("game-menu-list").innerHTML = Object.entries(MODES)
        .map(([key, m]) => `<button class="game__pick" type="button" data-mode="${key}">
                ${m.texts.badge ? `<span class="game__pick-badge">${m.texts.badge}</span>` : ""}
                <span class="game__pick-icon">${m.texts.icon}</span>
                <span class="game__pick-name">${m.texts.name}</span>
                <span class="game__pick-blurb">${m.texts.blurb}</span>
            </button>`)
        .join("");

    document.querySelectorAll(".game__pick").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            startMode(btn.dataset.mode);
        });
    });

    diceRollBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (mode && mode.roll) mode.roll();
    });

    // ---------- sterowanie ----------

    function toCanvas(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        return [clientX - rect.left, clientY - rect.top];
    }

    function handlePointer(clientX, clientY) {
        if (mode && running) mode.pointer(...toCanvas(clientX, clientY));
    }

    canvas.addEventListener("mousemove", (e) => handlePointer(e.clientX, e.clientY));
    canvas.addEventListener("mousedown", (e) => handlePointer(e.clientX, e.clientY));
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        handlePointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        handlePointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    document.addEventListener("keydown", (e) => {
        if (gameEl.hidden) return;
        // Escape zamyka najpierw zasady, dopiero potem cala gre
        if (e.key === "Escape") return rulesEl.hidden ? close() : zamknijZasady();
        // przy otwartych zasadach spacja nie moze rzucac kostka w tle
        if (mode && running && rulesEl.hidden) mode.key(e);
    });

    // ---------- otwieranie i zamykanie ----------

    function open() {
        gameEl.hidden = false;
        resize();
        showMenu();

        // scena zamiera na czas gry, zeby dymki nie gadaly zza planszy
        clearDialogTimers();
        hideBubbles();

        if (!raf) raf = requestAnimationFrame(loop);
    }

    function close() {
        gameEl.hidden = true;
        running = false;
        mode = null;
        stackEl.classList.remove("game__stack--plansza");
        diceEl.hidden = true;
        cancelAnimationFrame(raf);
        raf = null;
        scheduleNextDialog(1000);
    }

    document.getElementById("game-toggle").addEventListener("click", (e) => {
        e.stopPropagation();
        open();
    });

    document.getElementById("game-close").addEventListener("click", (e) => {
        e.stopPropagation();
        close();
    });

    document.getElementById("game-back").addEventListener("click", (e) => {
        e.stopPropagation();
        showMenu();
    });

    document.getElementById("game-again").addEventListener("click", (e) => {
        e.stopPropagation();
        overEl.hidden = true;
        mode.reset();
        lastFrame = 0;
        acc = 0;
        running = true;
    });

    gameEl.addEventListener("click", (e) => e.stopPropagation());

    window.addEventListener("resize", () => {
        if (!gameEl.hidden) resize();
    });

    // na potrzeby testow: pozwala przewinac gre bez czekania na klatki
    window.__game = {
        open, close, startMode, showMenu, MODES,
        draw: () => mode && mode.draw(),
        update: (dt = 1) => mode && mode.update(dt),
        isRunning: () => running,
        current: () => mode,
        pointer: (x, y) => mode && mode.pointer(x, y),
        // dodatkowe haki do scenariuszy trybu "gorska" - patrz rozdzial 7.8
        gorska: {
            setPole: (id, nr) => gorska.__test.setPole(id, nr),
            rzut: (wartosc) => gorska.__test.rzut(wartosc),
            state: gorska.state
        }
    };
})();
