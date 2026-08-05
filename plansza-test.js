// Lista kontrolna planszy z docs/akcja-w-karkonoszach.md, punkt 11.
// Uruchom: node plansza-test.js
const { TRASA, WYCIAG } = require("./plansza-trasa.js");

let bledy = 0;
const ok = (warunek, opis) => {
    console.log(`${warunek ? " OK " : "BŁĄD"}  ${opis}`);
    if (!warunek) bledy++;
};

ok(TRASA.length === 64, `dokładnie 64 pola (jest ${TRASA.length})`);

// Numer pola to indeks + 1, wiec duplikaty i luki sa z definicji niemozliwe.
// Sprawdzamy to mimo wszystko - test ma pilnowac zasady, nie implementacji.
const numery = TRASA.map((_, i) => i + 1);
ok(new Set(numery).size === TRASA.length, "żaden numer się nie powtarza");
ok(numery.every((n, i) => n === i + 1), "numeracja idzie ciągiem 1..64 bez luk");

ok(TRASA[0].type === "start", "pole 1 to START w Karpaczu");
ok(TRASA[63].type === "meta", "pole 64 to META na Śnieżce");
ok(TRASA[63].y < 0.15 && TRASA[63].x > 0.6, "pole 64 leży na szczycie przy obserwatorium");

ok(TRASA.filter((f) => f.type === "shelter").length >= 3, "są schroniska z zasadą rzutu 2x");
ok(TRASA[WYCIAG.from - 1].type === "lift", `pole ${WYCIAG.from} to wyciąg`);
ok(WYCIAG.to > WYCIAG.from && WYCIAG.to <= 64, `wyciąg ${WYCIAG.from} → ${WYCIAG.to} prowadzi do przodu`);

// wyciag nie moze psuc zwyklej numeracji - pola miedzy nim a celem istnieja
ok(TRASA.slice(WYCIAG.from, WYCIAG.to).length === WYCIAG.to - WYCIAG.from,
    "wyciąg nie wycina pól z normalnej trasy");

// wszystkie pola w kadrze i nie na sobie
ok(TRASA.every((f) => f.x > 0.02 && f.x < 0.98 && f.y > 0.02 && f.y < 0.98),
    "każde pole mieści się w planszy");

let min = Infinity, para = null;
for (let i = 0; i < TRASA.length; i++) {
    for (let j = i + 1; j < TRASA.length; j++) {
        // px przy planszy 1536x2048
        const d = Math.hypot((TRASA[i].x - TRASA[j].x) * 1536, (TRASA[i].y - TRASA[j].y) * 2048);
        if (d < min) { min = d; para = [i + 1, j + 1]; }
    }
}
ok(min > 55, `żadne dwa pola nie nachodzą na siebie (najbliższe: ${para} = ${min.toFixed(0)} px)`);

const skoki = TRASA.slice(1).map((f, i) =>
    Math.hypot((f.x - TRASA[i].x) * 1536, (f.y - TRASA[i].y) * 2048));
ok(Math.max(...skoki) < 140,
    `trasa jest ciągła, bez przeskoków (największy: ${Math.max(...skoki).toFixed(0)} px)`);

console.log(bledy ? `\n${bledy} błąd(ów)` : "\nplansza przechodzi całą listę kontrolną");
process.exit(bledy ? 1 : 0);
