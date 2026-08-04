// Badminton: pong z postaciami. Rakietka ma tylko dwa stany - gora albo dol -
// i o to chodzi: nie celujesz pikselami, tylko wybierasz polowe w pore.
// Sterowanie mysza, palcem albo strzalkami.

(() => {
    const FIELD_RATIO = 0.58;      // wysokosc pola wzgledem szerokosci
    const PADDLE_W = 0.018;        // ulamki szerokosci / wysokosci pola
    const PADDLE_H = 0.44;
    const PADDLE_UP = 0.27;        // srodek rakietki w gornym stanie
    const PADDLE_DOWN = 0.73;
    const PADDLE_X = 0.13;
    const BALL_R = 0.018;
    const START_SPEED = 0.011;
    const SPEED_STEP = 0.0006;
    const MAX_SPEED = 0.024;
    const CPU_MISTAKE = 0.14;      // szansa, ze Dee Dee wybierze zla polowe
    const CHAR_HEIGHT = 0.98;      // wysokosc postaci wzgledem pola

    const gameEl = document.getElementById("game");
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const scoreJohny = document.getElementById("game-score-johny");
    const scoreDeedee = document.getElementById("game-score-deedee");
    const overEl = document.getElementById("game-over");
    const overText = document.getElementById("game-over-text");

    document.getElementById("game-hint").textContent = GAME_TEXTS.hint;

    // Po dwa sprite'y na postac - to jest cala animacja. Oba kadry kazdej
    // postaci sa zgrane co do wielkosci i linii stop, wiec przy zmianie stanu
    // rusza sie tylko reka z rakietka, a nie cala sylwetka.
    const sprites = {
        johny: {
            up: Object.assign(new Image(), { src: "pic/johny-racket-up.webp" }),
            down: Object.assign(new Image(), { src: "pic/johny-racket-down.webp" })
        },
        deedee: {
            up: Object.assign(new Image(), { src: "pic/dee-dee-racket-up.webp" }),
            down: Object.assign(new Image(), { src: "pic/dee-dee-racket-down.webp" })
        }
    };

    let running = false;
    let raf = null;
    let W = 0;
    let H = 0;

    const state = {
        ball: { x: 0.5, y: 0.5, vx: START_SPEED, vy: 0.004 },
        johny: { up: true, hit: 0 },
        deedee: { up: true, hit: 0 },
        score: { johny: 0, deedee: 0 },
        speed: START_SPEED
    };

    // ---------- rozmiary ----------

    function resize() {
        const ratio = window.devicePixelRatio || 1;

        canvas.style.height = Math.round(canvas.clientWidth * FIELD_RATIO) + "px";

        // Bufor rysowania bierzemy z faktycznego pola tresci, a nie z liczby
        // wpisanej w style. Przy box-sizing: border-box obramowanie zjada
        // kilka pikseli i obraz bylby delikatnie rozciagniety w pionie.
        const cssWidth = canvas.clientWidth;
        const cssHeight = canvas.clientHeight;

        canvas.width = Math.round(cssWidth * ratio);
        canvas.height = Math.round(cssHeight * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

        W = cssWidth;
        H = cssHeight;
    }

    // ---------- rozgrywka ----------

    function serve(towardJohny) {
        state.speed = START_SPEED;
        state.ball.x = 0.5;
        state.ball.y = 0.35 + Math.random() * 0.3;
        state.ball.vx = towardJohny ? -state.speed : state.speed;
        state.ball.vy = (Math.random() - 0.5) * 0.012;
    }

    function reset() {
        state.score.johny = 0;
        state.score.deedee = 0;
        drawScore();
        overEl.hidden = true;
        serve(Math.random() < 0.5);
    }

    function drawScore() {
        scoreJohny.textContent = state.score.johny;
        scoreDeedee.textContent = state.score.deedee;
    }

    function point(who) {
        state.score[who]++;
        drawScore();

        if (state.score[who] >= GAME_TEXTS.toWin) {
            finish(who);
            return;
        }

        serve(who === "deedee");
    }

    function finish(who) {
        running = false;
        overText.textContent = who === "johny" ? GAME_TEXTS.winJohny : GAME_TEXTS.winDeedee;
        overEl.hidden = false;
    }

    // rakietka broni polowy, w ktorej akurat stoi
    function paddleCovers(player, ballY) {
        const center = player.up ? PADDLE_UP : PADDLE_DOWN;
        return Math.abs(ballY - center) <= PADDLE_H / 2;
    }

    function bounce(player, ballY) {
        const center = player.up ? PADDLE_UP : PADDLE_DOWN;
        const offset = (ballY - center) / (PADDLE_H / 2);   // -1..1

        state.speed = Math.min(MAX_SPEED, state.speed + SPEED_STEP);
        state.ball.vx = Math.sign(state.ball.vx) * -state.speed;
        state.ball.vy = offset * state.speed * 0.9;
        player.hit = 1;
    }

    function update() {
        const ball = state.ball;

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y < BALL_R) {
            ball.y = BALL_R;
            ball.vy = Math.abs(ball.vy);
        }
        if (ball.y > 1 - BALL_R) {
            ball.y = 1 - BALL_R;
            ball.vy = -Math.abs(ball.vy);
        }

        // Dee Dee decyduje, gdy pilka mija polowe boiska
        if (ball.vx > 0 && ball.x > 0.5 && ball.x - ball.vx <= 0.5) {
            const shouldBeUp = ball.y < 0.5;
            state.deedee.up = Math.random() < CPU_MISTAKE ? !shouldBeUp : shouldBeUp;
        }

        if (ball.vx < 0 && ball.x - BALL_R <= PADDLE_X) {
            if (paddleCovers(state.johny, ball.y)) {
                ball.x = PADDLE_X + BALL_R;
                bounce(state.johny, ball.y);
            } else if (ball.x < -0.05) {
                point("deedee");
            }
        }

        if (ball.vx > 0 && ball.x + BALL_R >= 1 - PADDLE_X) {
            if (paddleCovers(state.deedee, ball.y)) {
                ball.x = 1 - PADDLE_X - BALL_R;
                bounce(state.deedee, ball.y);
            } else if (ball.x > 1.05) {
                point("johny");
            }
        }

        state.johny.hit *= 0.88;
        state.deedee.hit *= 0.88;
    }

    // ---------- rysowanie ----------

    function drawCharacter(who, player, side) {
        const sprite = sprites[who][player.up ? "up" : "down"];
        if (!sprite.complete || !sprite.naturalWidth) return;

        const h = H * CHAR_HEIGHT;
        const w = h * (sprite.naturalWidth / sprite.naturalHeight);

        // dosuniete do krawedzi, ale w calosci w srodku - przy wysunieciu poza
        // plansze obcinala sie opuszczona rakietka, ktora siega daleko w bok
        const x = side === "left" ? 0 : W - w;

        // krotkie szarpniecie po odbiciu, w strone od ktorej przyszla pilka
        ctx.save();
        ctx.translate(player.hit * 10 * (side === "left" ? -1 : 1), 0);
        ctx.drawImage(sprite, x, H - h, w, h);
        ctx.restore();
    }

    // Zasieg rakietki. Sprite pokazuje, w ktora strone poszla reka, ale sam
    // z siebie nie mowi dokladnie, gdzie konczy sie odbicie - stad delikatny
    // pasek, ktory to domyka wzrokowo.
    function drawZone(player, side) {
        const pw = W * PADDLE_W;
        const ph = H * PADDLE_H;
        const x = side === "left" ? W * PADDLE_X - pw : W * (1 - PADDLE_X);
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
        ctx.clearRect(0, 0, W, H);

        // siatka na srodku
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 10]);
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.stroke();
        ctx.restore();

        drawCharacter("johny", state.johny, "left");
        drawCharacter("deedee", state.deedee, "right");

        drawZone(state.johny, "left");
        drawZone(state.deedee, "right");

        // lotka
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#ffd93b";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(state.ball.x * W, state.ball.y * H, BALL_R * W, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function loop() {
        if (running) update();
        draw();
        raf = requestAnimationFrame(loop);
    }

    // ---------- sterowanie ----------

    function aimFromPointer(clientY) {
        const rect = canvas.getBoundingClientRect();
        state.johny.up = (clientY - rect.top) < rect.height / 2;
    }

    canvas.addEventListener("mousemove", (e) => aimFromPointer(e.clientY));
    canvas.addEventListener("mousedown", (e) => aimFromPointer(e.clientY));
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        aimFromPointer(e.touches[0].clientY);
    }, { passive: false });
    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        aimFromPointer(e.touches[0].clientY);
    }, { passive: false });

    document.addEventListener("keydown", (e) => {
        if (gameEl.hidden) return;
        if (e.key === "ArrowUp") state.johny.up = true;
        if (e.key === "ArrowDown") state.johny.up = false;
        if (e.key === "Escape") close();
    });

    // ---------- otwieranie i zamykanie ----------

    function open() {
        gameEl.hidden = false;
        resize();
        reset();
        running = true;

        // scena zamiera na czas gry, zeby dymki nie gadaly zza planszy
        clearDialogTimers();
        hideBubbles();

        if (!raf) raf = requestAnimationFrame(loop);
    }

    function close() {
        gameEl.hidden = true;
        running = false;
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

    document.getElementById("game-again").addEventListener("click", (e) => {
        e.stopPropagation();
        reset();
        running = true;
    });

    gameEl.addEventListener("click", (e) => e.stopPropagation());

    window.addEventListener("resize", () => {
        if (!gameEl.hidden) resize();
    });

    // na potrzeby testow: pozwala przewinac mecz bez czekania na klatki
    window.__game = { open, close, state, serve, update, draw, isRunning: () => running };
})();
