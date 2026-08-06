// Czy docs/akcja-w-karkonoszach.md nadal opisuje to, co jest w kodzie.
// Dokumentacja rozjezdza sie po cichu przy kazdej zmianie zasad, wiec lepiej,
// zeby pilnowal tego test niz czyjas pamiec.
//
// Uruchom: node agenda-test.js
const fs = require("fs");
const { TRASA, WYCIAG, KATASTROFY } = require("./plansza-trasa.js");

const md = fs.readFileSync("docs/akcja-w-karkonoszach.md", "utf8");
const gameJs = fs.readFileSync("game.js", "utf8");
const linesJs = fs.readFileSync("lines.js", "utf8");

const SLOWO = {
    normal: "zwykłe", start: "START", lift: "WYCIĄG", shelter: "schronisko",
    bonus: "bonus", wind: "wiatr", view: "widok", ski: "narciarz", meta: "META",
    lawina: "LAWINA", zamiec: "ZAMIEĆ"
};

let bledy = 0;
const zle = (s) => { console.log("BŁĄD  " + s); bledy++; };
const ok = (s) => console.log(" OK   " + s);

// --- tabela pol w agendzie zgadza sie z danymi ---
const wiersze = [...md.matchAll(/^\|\s*\*{0,2}(\d+)\*{0,2}\s*\|\s*([^|]+?)\s*\|/gm)]
    .map((m) => ({ nr: +m[1], opis: m[2] }));

let rozjazdy = 0;
wiersze.forEach((w) => {
    const f = TRASA[w.nr - 1];
    if (!f) return zle(`pole ${w.nr} jest w agendzie, ale nie ma go w trasie`);
    const oczek = SLOWO[f.type];
    if (!w.opis.toLowerCase().includes(oczek.toLowerCase())) {
        zle(`pole ${w.nr}: agenda mówi "${w.opis}", a w kodzie jest ${oczek}`);
        rozjazdy++;
    }
});
if (!rozjazdy) ok(`tabela pól w agendzie zgadza się z danymi (${wiersze.length} wierszy)`);

// --- kazde pole specjalne ma swoj wiersz ---
const wAgendzie = new Set(wiersze.map((w) => w.nr));
const brakujace = TRASA
    .map((f, i) => ({ f, nr: i + 1 }))
    .filter((x) => x.f.type !== "normal" && !wAgendzie.has(x.nr));
brakujace.forEach((x) => zle(`pole ${x.nr} (${SLOWO[x.f.type]}) nie ma wiersza w agendzie`));
if (!brakujace.length) ok("każde pole specjalne jest opisane w agendzie");

// --- liczby w podsumowaniu ---
const podsIdx = md.indexOf("Podsumowanie:");
if (podsIdx < 0) zle("brak wiersza 'Podsumowanie:'");
else {
    // wiersz bywa zawiniety na kilka linii, wiec bierzemy caly akapit
    const pods = md.slice(podsIdx).split("\n\n")[0].replace(/\n/g, " ");
    const licz = {};
    TRASA.forEach((f) => { licz[f.type] = (licz[f.type] || 0) + 1; });

    let zlaLiczba = 0;
    [["schronisk", licz.shelter], ["bonusy", licz.bonus], ["wiatry", licz.wind],
     ["punkty widokowe", licz.view], ["zwykłe", licz.normal],
     ["lawina", licz.lawina], ["zamieć", licz.zamiec]].forEach(([slowo, ile]) => {
        const m = pods.match(new RegExp("(\\d+)\\s+" + slowo));
        if (!m) { zle(`podsumowanie nie podaje liczby dla "${slowo}"`); zlaLiczba++; }
        else if (+m[1] !== ile) { zle(`podsumowanie: ${m[1]} ${slowo}, a w danych ${ile}`); zlaLiczba++; }
    });
    if (!zlaLiczba) ok("liczby w podsumowaniu zgadzają się z danymi");
}

// --- wyciag i katastrofy ---
if (!md.includes(`na pole **${WYCIAG.to}**`)) zle(`agenda nie opisuje wyciągu na pole ${WYCIAG.to}`);
else ok(`agenda opisuje wyciąg ${WYCIAG.from} → ${WYCIAG.to}`);

const lawinaNr = TRASA.findIndex((f) => f.type === "lawina") + 1;
const zamiecNr = TRASA.findIndex((f) => f.type === "zamiec") + 1;
if (!md.includes(`cofa o ${KATASTROFY.lawina.cofa} pól`)) zle("agenda nie podaje, o ile cofa lawina");
else ok(`agenda podaje siłę lawiny (pole ${lawinaNr}, −${KATASTROFY.lawina.cofa})`);
if (!md.includes(`na pole ${KATASTROFY.zamiec.doPola}`) && !md.includes(`na ${KATASTROFY.zamiec.doPola}`)) {
    zle("agenda nie podaje, dokąd zrzuca zamieć");
} else ok(`agenda podaje cel zamieci (pole ${zamiecNr} → ${KATASTROFY.zamiec.doPola})`);

// --- wartosci efektow: agenda vs kod ---
let zlyEfekt = 0;
[["bonus", /\*\*\+2 pola\*\*/, /pole \+ 2/],
 ["widok", /\*\*\+1 pole\*\*/, /pole \+ 1/],
 ["narciarz", /\*\*\+3 pola\*\*/, /pole \+ 3/],
 ["wiatr", /\*\*−2 pola\*\*/, /pole - 2/]].forEach(([nazwa, wMd, wKodzie]) => {
    if (!wMd.test(md)) { zle(`agenda nie podaje wartości dla "${nazwa}"`); zlyEfekt++; }
    if (!wKodzie.test(gameJs)) { zle(`game.js nie realizuje "${nazwa}" wg agendy`); zlyEfekt++; }
});
if (!zlyEfekt) ok("wartości efektów w agendzie zgadzają się z game.js");

// --- schronisko: agenda, okno zasad i kod musza mowic to samo ---
const kodPodwaja = /podwojone \? oczko \* 2 : oczko/.test(gameJs);
const mdPodwaja = /liczy się \*\*×2\*\*/.test(md);
const zasadyPodwaja = /liczy się podwójnie/.test(linesJs);
if (!kodPodwaja) zle("game.js nie podwaja rzutu po schronisku");
if (!mdPodwaja) zle("agenda nie opisuje schroniska jako ×2");
if (!zasadyPodwaja) zle("okno zasad nie opisuje schroniska jako ×2");
if (kodPodwaja && mdPodwaja && zasadyPodwaja) ok("schronisko: kod, agenda i okno zasad zgodne (×2)");

// --- kazdy typ pola ma teksty dymkow ---
const typy = [...new Set(TRASA.map((f) => f.type))].filter((t) => t !== "normal" && t !== "start");
const bezTekstow = typy.filter((t) => !new RegExp(`\\b${t}:\\s*\\{`).test(linesJs));
bezTekstow.forEach((t) => zle(`typ pola "${t}" nie ma tekstów w GAME_BUBBLES`));
if (!bezTekstow.length) ok(`każdy typ pola ma dymki postaci (${typy.length} typów)`);

// --- nieaktualne odsylacze ---
if (/plansza-dev\.html/.test(md)) zle("agenda odsyła do skasowanego plansza-dev.html");
else ok("agenda nie odsyła do nieistniejących plików");

console.log(bledy ? `\n${bledy} rozjazd(ów) agendy z kodem` : "\nAgenda zgadza się z kodem");
process.exit(bledy ? 1 : 0);
