# Akcja w Karkonoszach: Johnny i Dee Dee na Śnieżkę

Gra planszowa dla 2 graczy. Johnny Bravo i Dee Dee startują w Karpaczu i ścigają
się przez Karkonosze na szczyt Śnieżki. Wygrywa ten, kto pierwszy stanie na polu 64.

> **Ten plik jest źródłem prawdy dla zasad.** Każda zmiana pola albo reguły ma
> tu trafić od razu, zanim wejdzie do kodu — inaczej ustalenia uciekną.

---

## 1. Stan na dziś

| Element | Stan |
|---|---|
| Plansza (tło) | gotowe — `pic/plansza/board.webp` |
| 64 pola: pozycje i typy | gotowe — `plansza-trasa.js` |
| Grafiki pól (8 typów) | gotowe — `pic/plansza/pole-*.webp` |
| Pionki | gotowe — `pic/plansza/pawn-johny.webp`, `pawn-deedee.webp` |
| Testy planszy | gotowe — `plansza-test.js` |
| Podgląd na stronie | gotowe — kafel „Górska przygoda” w menu gier |
| **Mechanika gry** | **do zrobienia** |

Numer pola to **indeks w tablicy + 1** i nigdzie nie jest zapisany ręcznie.
Dlatego duplikat numeru albo luka są strukturalnie niemożliwe. Tak wykłada się
poprzednia plansza, gdzie numery były wypalone w obrazku: numer 50 występował
trzy razy, 13 trzy razy, a brakowało m.in. 12, 33 i 46.

Kontrola: `node plansza-test.js` — 13 punktów listy kontrolnej (64 pola,
ciągłość trasy, brak nachodzenia pól, wyciąg nie wycina pól z numeracji).

---

## 2. Typy pól i ich działanie

Osiem typów, zgodnie z legendą (`pic/plansza/legend.webp`).

| Ikona | Typ | `type` | Działanie |
|---|---|---|---|
| kamień | Zwykłe | `normal` | nic się nie dzieje |
| domek | Schronisko | `shelter` | w **następnej** turze gracz rzuca 2 razy i **sumuje** wyniki |
| zielona strzałka | Bonus | `bonus` | **+2 pola** do przodu od razu |
| czerwony wiatr | Przeszkoda | `wind` | **−2 pola** do tyłu |
| niebieska lornetka | Punkt widokowy | `view` | **+1 pole** do przodu |
| pomarańczowy narciarz | Narciarz | `ski` | **+3 pola** do przodu (szybki zjazd) |
| różowe serce | Serduszko | `start` | pole startowe; animacja przy spotkaniu graczy |
| złoty puchar | Meta | `meta` | koniec gry, zwycięstwo |
| — | Wyciąg | `lift` | przenosi z pola **6** na pole **27** |

### Zasada, która ucina pętle

**Efekt pola uruchamia się tylko wtedy, gdy gracz stanął na nim rzutem kostki.**
Jeśli trafił tam przez cudzy efekt (bonus, wiatr, narciarz, wyciąg) — pole
milczy. Bez tego bonus obok bonusu potrafiłby zapętlić ruch w nieskończoność.

Wyciąg **nie zmienia numeracji planszy** — normalna trasa dalej biegnie
6 → 7 → 8 → … → 27. Wyciąg to tylko skrót.

---

## 3. Co jest na którym polu

43 pola są zwykłe, 21 ma efekt. Pełna lista:

| Pole | Typ | Miejsce / uwagi |
|---|---|---|
| **1** | 💗 START | **START: Karpacz** |
| 2–3 | zwykłe | dolna łąka |
| **4** | 🌬️ wiatr | |
| 5 | zwykłe | |
| **6** | 🚡 **WYCIĄG** | **Wyciąg na Kopę → przenosi na pole 27** |
| 7–8 | zwykłe | |
| **9** | 🔭 widok | |
| 10–11 | zwykłe | prawa krawędź w górę |
| **12** | ➡️ bonus | |
| 13–14 | zwykłe | |
| **15** | 🌬️ wiatr | |
| 16–22 | zwykłe | trawers w lewo |
| **23** | 🏠 schronisko | **Strzecha Akademicka** |
| 24–25 | zwykłe | |
| **26** | 🌬️ wiatr | |
| 27 | zwykłe | **górna stacja wyciągu** (tu ląduje skrót z pola 6) |
| **28** | 🏠 schronisko | **Schronisko Samotnia** (Mały Staw) |
| 29–31 | zwykłe | podejście w górę |
| **32** | 🏠 schronisko | **Schronisko na Hali Szrenickiej** |
| 33 | zwykłe | |
| **34** | ⛷️ narciarz | |
| 35 | zwykłe | |
| **36** | 🔭 widok | **Szrenica** |
| 37–39 | zwykłe | zejście w lewo |
| **40** | ➡️ bonus | **Wodospad Kamieńczyka** (tu trasa zawraca w górę) |
| 41–42 | zwykłe | lewa krawędź w górę |
| **43** | 🔭 widok | **Przełęcz Karkonoska** |
| 44–46 | zwykłe | |
| **47** | 🔭 widok | **Śnieżne Kotły** |
| 48–50 | zwykłe | trawers w prawo |
| **51** | 🏠 schronisko | **Schronisko Odrodzenie** |
| 52 | zwykłe | |
| **53** | ➡️ bonus | |
| 54 | zwykłe | |
| **55** | 🌬️ wiatr | |
| 56–57 | zwykłe | |
| **58** | 🏠 schronisko | **Dom Śląski pod Śnieżką** |
| 59 | zwykłe | początek podejścia z łańcuchami |
| **60** | 🌬️ wiatr | najbardziej wietrzne miejsce na grani |
| 61–63 | zwykłe | strome podejście granią |
| **64** | 🏆 META | **META: ŚNIEŻKA** — przy obserwatorium |

Podsumowanie: 1 start, 1 wyciąg, 5 schronisk, 3 bonusy, 5 wiatrów,
4 punkty widokowe, 1 narciarz, 1 meta, 43 zwykłe.

---

## 4. Przebieg tury

1. Gracz rzuca kostką **1–6**.
   - Jeśli w poprzedniej turze skończył na **schronisku**, rzuca **dwa razy i sumuje**.
2. Pionek przesuwa się o wylosowaną liczbę pól, **animowany po kolei przez pola** (nie skacze).
3. Uruchamia się efekt pola, na którym stanął (patrz zasada z rozdziału 2).
4. Jeśli obaj gracze stoją na tym samym polu → **animacja serduszka** (bez wpływu na zasady).
5. Tura przechodzi na drugiego gracza.

### Przypadki brzegowe

- **Meta:** wynik ≥ 64 kończy grę. Nie trzeba trafić dokładnie — nadmiar przepada.
- **Cofanie poniżej pola 1:** wiatr na polu 4 nie może zepchnąć poniżej 1 → minimum to pole 1.
- **Wiatr blisko mety:** cofa normalnie, gra się nie kończy.
- **Kto zaczyna:** losowo.

---

## 5. Co musi powstać w aplikacji

Kolejność od dołu do góry — każdy punkt da się obejrzeć zanim ruszy następny.

**1. Rysowanie planszy**
Tło + 64 pola z `plansza-trasa.js` na canvasie, skalowane do szerokości panelu.
Współrzędne są ułamkami, więc działa na każdym ekranie.

**2. Pionki**
Dwa pionki na polu 1, z odsunięciem, żeby się nie zasłaniały, gdy stoją na tym
samym polu.

**3. Kostka**
Przycisk rzutu + widoczny wynik. Blokada w trakcie animacji ruchu, żeby nie dało
się rzucić dwa razy.

**4. Ruch pionka**
Animacja pole po polu wzdłuż trasy. Wyciąg z 6 na 27 — osobna animacja wzdłuż
linii kolejki, nie przez pola pośrednie.

**5. Efekty pól**
Rozstrzyganie z rozdziału 2 + flaga `podwojnyRzut` dla schronisk.

**6. Stan tury i koniec gry**
Kto teraz gra, ekran zwycięstwa, „jeszcze raz”.

**7. Wpięcie w menu**
Kafel „Górska przygoda” zamienia okno z podglądem na prawdziwy tryb gry —
wtedy znika plakietka „w przygotowaniu”.

### Stan gry — szkic

```js
const gracz = {
    pole: 1,              // 1..64
    podwojnyRzut: false   // ustawia schronisko, zdejmuje sie po uzyciu
};
```

Animacja ruchu musi liczyć czas tak samo jak reszta gier w `game.js`: stały krok
1/60 s z akumulatorem, nie skalowanie jednym `dt`. Inaczej na słabszym PC pionek
będzie się wlókł przy zaciętych klatkach.

---

## 6. Wymagania na planszę (spełnione)

Pilnuje tego `plansza-test.js`:

- [x] dokładnie 64 pola
- [x] wszystkie numery 1–64, bez luk i bez duplikatów
- [x] każde pole specjalne ma numer
- [x] trasa ciągła — po każdym polu da się wskazać następne
- [x] pole 6 (wyciąg) nie psuje normalnej numeracji
- [x] schroniska mają zasadę rzutu 2×
- [x] końcówka 59–64 prowadzi granią na Śnieżkę
- [x] pole 64 na szczycie przy obserwatorium
- [x] żadne dwa pola się nie nakładają
- [x] pola nie zasłaniają tabliczek z nazwami miejsc

---

## 7. Instrukcja dla agenta kodującego

Wszystko dzieje się w `game.js`. Nowy tryb ma ten sam kształt co `badminton`
i `obrona`: obiekt z `{ texts, measure, reset, update, draw, score, pointer, key }`,
dopisany do `MODES`. Pętla, skalowanie płótna i menu są już wspólne.

### 7.1. Trzy pułapki — przeczytaj najpierw

**a) Płótno ma złe proporcje.** `FIELD_RATIO = 0.58` jest globalne (płótno
szerokie), a plansza jest wysoka — 1536×2048, czyli 1,3333. Trzeba zrobić
proporcję zależną od trybu:

```js
const FIELD_RATIO = 0.58;                 // zostaje jako domyslna

// w resize():
const ratioTrybu = (mode && mode.ratio) || FIELD_RATIO;
canvas.style.height = Math.round(canvas.clientWidth * ratioTrybu) + "px";
```

Do tego `.game__stack` ma `width: min(900px, 96vw)` — przy planszy dałoby to
1200 px wysokości i plansza wyszłaby poza ekran. Dla tego trybu dodaj klasę:

```css
/* plansza jest wysoka, wiec szerokosc ograniczamy wysokoscia okna */
.game__stack--plansza {
    width: min(900px, 94vw, 60vh);
}
```

Klasę zdejmuj i nakładaj w `startMode()` / `showMenu()`.

**b) `pointer()` odpala się też przy `mousemove`.** W `game.js` jest:

```js
canvas.addEventListener("mousemove", (e) => handlePointer(...));
```

Gdyby kostka była klikana przez `pointer()`, samo przesunięcie myszy nad
planszą rzucałoby kostką w kółko. Dlatego **przycisk rzutu to zwykły
`<button>` w DOM**, nie obszar na płótnie. Sama kostka jest rysowana na
płótnie (żeby ładnie się kręciła), ale klik idzie z przycisku.

**c) Czas liczy się w klatkach, nie w milisekundach.** Pętla woła
`mode.update(1)` stałym krokiem 1/60 s (patrz komentarz przy `FRAME_MS`).
Wszystkie animacje licz w klatkach — `t += dt` — i **nigdy** nie używaj
`Date.now()` ani `setTimeout` do animacji. Inaczej wróci błąd, przez który
pająki wlokły się na słabszym PC.

### 7.2. Co dodać poza `game.js`

**`index.html`** — pasek kostki wewnątrz `.game`, pod `.game__stack`:

```html
<div class="dice" id="dice" hidden>
    <button class="dice__roll" id="dice-roll" type="button">🎲 Rzuć kostką</button>
    <span class="dice__who" id="dice-who"></span>
</div>
```

Podbij `?v=` przy `style.css`, `lines.js`, `script.js` i `game.js` — repo tego
wymaga przy każdej zmianie (komentarz na górze `index.html`).

**`game.js` → `SPRITE_FILES`** — dorzuć grafiki:

```js
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
```

Pole `start` rysuje się spritem `poleHeart`, pole `lift` — `poleBonus`.

**`lines.js` → `GAME_TEXTS`** — zamień wpis `wkrotce` na normalny tryb
(`name`, `icon`, `blurb`, `hint`) i usuń `note: "w przygotowaniu"`; plakietkę
`NEW` możesz zostawić. W `game.js` kafel przestaje mieć `data-preview`,
a dostaje `data-mode="gorska"`. Okno podglądu (`#preview`) i jego CSS można
wtedy usunąć.

### 7.3. Stan trybu

```js
const state = {
    gracze: [
        { id: "johny",  nazwa: "Johnny",  pole: 1, podwojnyRzut: false, faza: 0 },
        { id: "deedee", nazwa: "Dee Dee", pole: 1, podwojnyRzut: false, faza: 0 }
    ],
    ktory: 0,              // indeks gracza, losowany w reset()
    faza: "rzut",          // rzut | kreci | rusza | efekt | koniec
    kostka: { t: 0, oczko: 1, wynik: 0, drugiRzut: 0 },
    ruch: null,            // { pola: [12,13,14], krok: 0, t: 0 }
    dymki: [],             // patrz 7.5
    blyski: []             // patrz 7.5
};
```

`faza` pilnuje, żeby nie dało się rzucić kostką w trakcie ruchu — przycisk ma
być wtedy `disabled`.

### 7.4. Przebieg tury w kodzie

1. **`rzut`** — przycisk aktywny. Klik → `faza = "kreci"`, `kostka.t = 0`.
2. **`kreci`** — animacja z 7.6. Po jej końcu losujemy wynik
   (`1 + rand(6)`; jeśli `podwojnyRzut`, drugi raz i sumujemy, a flagę zdejmujemy).
   Budujemy `ruch.pola` = kolejne pola do przejścia, `faza = "rusza"`.
3. **`rusza`** — pionek skacze pole po polu (7.6). Na końcu `faza = "efekt"`.
4. **`efekt`** — rozstrzygamy pole, na którym stanął:
   - pokaż dymek i błysk (7.5),
   - jeśli efekt przesuwa gracza, dopisz drugi `ruch` (bez ponownego efektu —
     patrz zasada z rozdziału 2),
   - schronisko: `podwojnyRzut = true`,
   - wyciąg (pole 6): przenieś na 27 osobną animacją wzdłuż linii kolejki,
     nie przez pola pośrednie.
5. Jeśli `pole >= 64` → `finish(...)` i `faza = "koniec"`.
6. Jeśli obaj gracze na tym samym polu → dymek z serduszkiem.
7. `ktory = 1 - ktory`, `faza = "rzut"`.

Ograniczenia: `pole` nigdy poniżej 1 i nigdy powyżej 64.

### 7.5. Szablon dymka — jeden na wszystkie pola specjalne

To jest ten „efekt wow”, o który chodzi. **Jedna funkcja, używana wszędzie** —
nie pisz osobnych animacji per typ pola.

```js
const DYMEK_KLATEK = 30;   // 0.5 s; jesli tekst nie zdazy sie przeczytac,
                           // podnies do 45-55 - to jedna stala
const BLYSK_KLATEK = 14;

// nastroj: "dobry" (zielono, wesolo) albo "zly" (czerwono, smutno)
function dymek(pole, tekst, nastroj) {
    const p = TRASA[pole - 1];
    state.dymki.push({
        x: p.x, y: p.y, tekst, nastroj, t: 0,
        bok: (Math.random() - 0.5) * 2   // kazdy dymek kolebie sie inaczej
    });
    state.blyski.push({ x: p.x, y: p.y, t: 0, nastroj });
}
```

Rysowanie (wywoływane po planszy i pionkach, żeby było na wierzchu):

```js
const easeOut = (p) => 1 - Math.pow(1 - p, 3);

state.dymki.forEach((d) => {
    const p = d.t / DYMEK_KLATEK;                  // 0..1
    const y = d.y * H - H * 0.075 * easeOut(p)     // unosi sie do gory
            - H * 0.03;                            // startuje nad polem
    const x = d.x * W + Math.sin(p * Math.PI * 1.6) * W * 0.022 * d.bok;
    const skala = p < 0.25 ? 0.4 + 2.4 * p : 1;    // "pop" na wejsciu
    const alpha = p < 0.15 ? p / 0.15               // wskakuje
                : 1 - Math.max(0, (p - 0.55) / 0.45);  // i gasnie
    // rysuj: tlo-pigulka + tekst, kolor wg nastroju
    // dobry: #7ed957 / obrys #1c5e15,  zly: #ff5f6d / obrys #6e1119
});
```

Błysk to rozszerzający się pierścień w miejscu pola:

```js
const p = b.t / BLYSK_KLATEK;
promien = W * (0.02 + 0.05 * easeOut(p));
grubosc = 6 * (1 - p);
alpha   = 1 - p;
```

Teksty dymków — trzymaj je w jednym miejscu, obok reguł:

| Pole | Tekst | Nastrój |
|---|---|---|
| bonus | `+2 BONUS 😃` | dobry |
| view | `+1 WIDOK 😃` | dobry |
| ski | `+3 ZJAZD 🎿` | dobry |
| wind | `−2 WIATR 😖` | zły |
| shelter | `RZUT 2× 😴` | dobry |
| lift | `WYCIĄG! 🚡` | dobry |
| spotkanie | `💗` | dobry |
| meta | `META! 🏆` | dobry |

### 7.6. Pozostałe animacje

**Oddychanie pionków (gdy stoją).** Każdy pionek ma własną fazę, żeby nie
oddychały równo:

```js
// reset(): g.faza = Math.random() * Math.PI * 2;
// update(): g.faza += 0.055 * dt;              // pelny cykl ~1,9 s
// draw():   const bob = Math.sin(g.faza) * H * 0.006;   // ~±5 px
```

Bob dodaj do `y` pionka **tylko gdy gracz nie jest w ruchu**.

**Skok pionka między polami.**

```js
const KROK_KLATEK = 11;                  // ~0,18 s na pole
const p = ruch.t / KROK_KLATEK;          // 0..1
const a = TRASA[ruch.pola[ruch.krok] - 1];
const b = TRASA[ruch.pola[ruch.krok + 1] - 1];
x = (a.x + (b.x - a.x) * p) * W;
y = (a.y + (b.y - a.y) * p) * H - Math.sin(p * Math.PI) * H * 0.03;  // parabola
```

Po `KROK_KLATEK` przejdź do następnego pola. Wyciąg 6 → 27: jeden długi krok
(~40 klatek) po prostej, z pionkiem lekko kołyszącym się jak gondola.

**Kostka.** Rysowana na płótnie w rogu planszy, kwadrat z zaokrąglonymi
rogami i oczkami:

```js
const KRECENIE_KLATEK = 54;   // 0,9 s - miesci sie w zadanych 1-2 s
// w fazie "kreci":
kostka.t += dt;
if (Math.floor(kostka.t) % 4 === 0) kostka.oczko = 1 + rand(6);  // migotanie scianek
const p = kostka.t / KRECENIE_KLATEK;
const kat = easeOut(p) * Math.PI * 6;      // trzy pelne obroty, zwalnia
const skala = 1 + Math.sin(p * Math.PI) * 0.25;
// po zakonczeniu: kostka.oczko = wynik i faza = "rusza"
```

Układ oczek — środek, przekątne, boki:

```
1: srodek
2: LG, PD
3: LG, srodek, PD
4: LG, PG, LD, PD
5: LG, PG, srodek, LD, PD
6: LG, PG, LS, PS, LD, PD
```

**Gdy obaj gracze stoją na tym samym polu** — rozsuń pionki o `±W * 0.012`
w poziomie, żeby się nie zasłaniały, i puść dymek z serduszkiem.

### 7.7. Pozostałe drobiazgi

- `score()` zwraca HTML na górny pasek: czyja tura i pozycje obu graczy,
  np. `<b>Johnny</b><span class="game__points">12</span>` itd.
- `measure()` — przelicz rozmiar pola i pionka względem `W`; wywoływane
  z `resize()`.
- `key()` może zostać puste (`() => {}`) albo pozwalać na rzut spacją.
- **`prefers-reduced-motion`** — w `style.css` jest już blok dla tego
  ustawienia. Uszanuj je: przy włączonym skróć kręcenie kostki do ~10 klatek,
  wyłącz oddychanie i skoki (pionek przeskakuje od razu), dymki zostaw, ale
  bez kołysania na boki.
- Nie ruszaj `plansza-trasa.js` — to dane, nie logika. Zmiana reguły idzie
  najpierw do tego dokumentu, potem do kodu.

### 7.8. Jak sprawdzić, że działa

`plansza-test.js` sprawdza samą planszę. Do mechaniki dopisz do
`window.__game` haki testowe (wzorem istniejących), żeby dało się przewinąć
grę bez czekania na animacje — np. `setPole(gracz, nr)`, `rzut(wartosc)`.

Ręcznie sprawdź:
- rzut kostką nie działa w trakcie ruchu pionka,
- bonus na polu 12 przesuwa na 14 i **nie** odpala efektu pola 14,
- wiatr na polu 4 nie cofa poniżej pola 1,
- wejście na pole 6 przenosi na 27 animacją wzdłuż kolejki,
- schronisko daje w następnej turze sumę dwóch rzutów i flaga się zdejmuje,
- rzut z pola 62 wynikiem 5 kończy grę (nadmiar przepada),
- obaj gracze na jednym polu → serduszko i rozsunięte pionki,
- plansza mieści się w oknie na telefonie i na laptopie 1280×720.

---

## 8. Styl grafiki

Kreskówkowo, grube czarne kontury, żywe kolory: zielone lasy, skaliste granie,
śnieg na szczycie, drewniane schroniska, wyciąg, wodospad, obserwatorium na
Śnieżce. Pola pochodzą z legendy, więc trzymają ten sam styl co reszta planszy.

Trasa jest inspirowana Karkonoszami, ale nie trzyma się geografii co do metra —
kolejność miejsc wynika z tego, gdzie faktycznie są namalowane na planszy.
Dlatego Świątynia Wang jest scenerią, a nie polem: leży w lewym dolnym rogu i
wciągnięcie jej do trasy zmusiłoby wężyk do zawracania przez pół planszy.
