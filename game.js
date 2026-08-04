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
        deedee: "pic/dee-dee.webp"
    };

    const sprites = {};
    Object.entries(SPRITE_FILES).forEach(([key, src]) => {
        sprites[key] = Object.assign(new Image(), { src });
    });

    const gameEl = document.getElementById("game");
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("game-score");
    const hintEl = document.getElementById("game-hint");
    const menuEl = document.getElementById("game-menu");
    const backEl = document.getElementById("game-back");
    const overEl = document.getElementById("game-over");
    const overText = document.getElementById("game-over-text");

    const FIELD_RATIO = 0.58;

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

        function score() {
            return `<b>Ty (Dee Dee)</b><span class="game__points">${state.score.player}</span>`
                + `:<span class="game__points">${state.score.cpu}</span><b>Johnny</b>`;
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

            // Johnny decyduje, gdy pilka mija polowe boiska w jego strone
            if (ball.vx < 0 && ball.x < 0.5 && ball.x - ball.vx >= 0.5) {
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

            state.johny.hit *= 0.88;
            state.deedee.hit *= 0.88;
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

        const state = { spiders: [], shots: [], bits: [], kills: 0, lives: T.lives, tick: 0, gap: START_GAP };

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
            state.tick = 0;
            state.gap = START_GAP;
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

        function update() {
            state.tick++;

            if (state.tick % Math.round(state.gap) === 0) spawn();

            state.spiders.forEach((s) => {
                s.x += s.speed;
                s.wobble += 0.18;
            });

            // pajak, ktory dotarl do Dee Dee, zabiera zycie
            const reached = state.spiders.filter((s) => s.x >= REACH);
            if (reached.length) {
                state.lives -= reached.length;
                state.spiders = state.spiders.filter((s) => s.x < REACH);
                if (state.lives <= 0) finish(`${T.over}<br>Ubitych pająków: ${state.kills}`);
            }

            state.shots = state.shots.filter((shot) => {
                shot.t++;
                if (shot.t < ROCKET_FRAMES) return true;
                burst(shot.tx, shot.ty);
                return false;
            });

            state.bits = state.bits.filter((b) => {
                b.vy += 0.35;
                b.x += b.vx;
                b.y += b.vy;
                b.life -= 0.02;
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

    const MODES = { badminton, obrona };

    // ============================================================
    //  WSPOLNA OBSLUGA
    // ============================================================

    function resize() {
        canvas.style.height = Math.round(canvas.clientWidth * FIELD_RATIO) + "px";

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

    function loop() {
        if (running) {
            mode.update();
            scoreEl.innerHTML = mode.score();
        }

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

        resize();
        mode.reset();
        scoreEl.innerHTML = mode.score();
        running = true;
    }

    function showMenu() {
        running = false;
        mode = null;
        menuEl.hidden = false;
        overEl.hidden = true;
        backEl.hidden = true;
        scoreEl.innerHTML = "";
        hintEl.textContent = "";
        ctx.clearRect(0, 0, W, H);
    }

    document.getElementById("game-menu-title").textContent = GAME_TEXTS.menuTitle;
    document.getElementById("game-menu-list").innerHTML = Object.entries(MODES)
        .map(([key, m]) => `<button class="game__pick" type="button" data-mode="${key}">
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
        if (e.key === "Escape") return close();
        if (mode && running) mode.key(e);
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
        update: () => mode && mode.update(),
        isRunning: () => running,
        current: () => mode,
        pointer: (x, y) => mode && mode.pointer(x, y)
    };
})();
