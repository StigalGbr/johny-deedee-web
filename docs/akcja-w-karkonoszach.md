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
| Kafel w menu gier | gotowe — „Górska przygoda” |
| Mechanika gry | gotowe — tryb `gorska` w `game.js` |
| Dymki postaci | gotowe — `GAME_BUBBLES` w `lines.js` |
| Zasady w grze | gotowe — przycisk „? Zasady”, treść w `ZASADY` w `lines.js` |

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
| domek | Schronisko | `shelter` | w **następnej** turze rzut gracza liczy się **×2** |
| zielona strzałka | Bonus | `bonus` | **+2 pola** do przodu od razu |
| czerwony wiatr | Przeszkoda | `wind` | **−2 pola** do tyłu |
| niebieska lornetka | Punkt widokowy | `view` | **+1 pole** do przodu |
| pomarańczowy narciarz | Narciarz | `ski` | **+3 pola** do przodu (szybki zjazd) |
| różowe serce | Serduszko | `start` | pole startowe; animacja przy spotkaniu graczy |
| złoty puchar | Meta | `meta` | koniec gry, zwycięstwo |
| — | Wyciąg | `lift` | przenosi z pola **6** na pole **27** |
| granatowy wiatr | **Lawina** | `lawina` | **cofa o 10 pól** |
| fioletowy wiatr | **Zamieć** | `zamiec` | **zrzuca aż na pole 28** (Samotnia) |

Dwa ostatnie to **pola-katastrofy** — mają boleć. Nie ma ich w legendzie
(`pic/plansza/legend.webp`), więc grafiki powstały z pola wiatru przez zmianę
odcienia na zimniejszy i ciemniejszy: ta sama forma, ale od razu widać, że
gorsza. Ich parametry siedzą w `KATASTROFY` w `plansza-trasa.js`.

Przy takich cofnięciach pionek jedzie przez wszystkie pola po drodze, ale
**szybszym krokiem** (`KROK_KLATEK_SZYBKI`) — w normalnym tempie zjazd z pola
60 na 28 trwałby 13 sekund.

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
| 44 | zwykłe | |
| **45** | ❄️ **LAWINA** | **Lawina w Śnieżnych Kotłach — cofa o 10 pól, na 35** |
| 46 | zwykłe | |
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
| **60** | 🥶 **ZAMIEĆ** | **Trzy kroki od szczytu — zrzuca aż do Samotni, na 28** |
| 61–63 | zwykłe | strome podejście granią |
| **64** | 🏆 META | **META: ŚNIEŻKA** — przy obserwatorium |

Podsumowanie: 1 start, 1 wyciąg, 5 schronisk, 3 bonusy, 4 wiatry,
4 punkty widokowe, 1 narciarz, **1 lawina, 1 zamieć**, 1 meta, 42 zwykłe.

---

## 4. Przebieg tury

1. Gracz rzuca kostką **1–6**.
   - Jeśli w poprzedniej turze skończył na **schronisku**, wynik liczy się **×2**
     (rzuca 4 → idzie 8 pól). Wcześniej były to dwa rzuty i suma, ale kostka
     pokazywała wtedy jedną ściankę, a pionek szedł o sumę dwóch — nie dało się
     tego powiązać wzrokiem.
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

## 5. Gdzie co siedzi

| Co | Gdzie |
|---|---|
| 64 pola: pozycje, typy, nazwy | `plansza-trasa.js` → `TRASA` |
| wyciąg i pola-katastrofy | `plansza-trasa.js` → `WYCIAG`, `KATASTROFY` |
| cała mechanika (tryb `gorska`) | `game.js` |
| teksty dymków postaci | `lines.js` → `GAME_BUBBLES` |
| treść okna „? Zasady” | `lines.js` → `ZASADY` |
| nazwa kafla, podpowiedź | `lines.js` → `GAME_TEXTS.gorska` |
| grafiki pól i pionków | `pic/plansza/` |
| testy planszy | `plansza-test.js` |

**Zmiana reguły idzie najpierw tutaj, potem do kodu.** Wartości efektów są w
jednym miejscu w `game.js` (`rozstrzygnijEfekt`), a parametry katastrof
w `KATASTROFY`.

### Stan gracza

```js
const gracz = {
    pole: 1,              // 1..64
    podwojnyRzut: false   // ustawia schronisko, zdejmuje sie po uzyciu
};
```

### Rytm tury

Po każdym dymku gra przystaje na sekundę (`PAUZA_KLATEK`), żeby dało się
przeczytać, co się stało. Kolejność jest zawsze taka sama:

> rzut → kręcenie kostki → ruch pionka → plakietka efektu → **1 s** →
> dymek postaci → **1 s** → tura drugiego gracza

Pauza wstrzymuje sam przebieg gry, ale **nie** animacje — dymek w tym czasie
normalnie się unosi i gaśnie.

---

## 6. Wymagania na planszę (spełnione)

Pilnuje tego `plansza-test.js`:

- [x] dokładnie 64 pola
- [x] wszystkie numery 1–64, bez luk i bez duplikatów
- [x] każde pole specjalne ma numer
- [x] trasa ciągła — po każdym polu da się wskazać następne
- [x] pole 6 (wyciąg) nie psuje normalnej numeracji
- [x] schroniska podwajają następny rzut
- [x] końcówka 59–64 prowadzi granią na Śnieżkę
- [x] pole 64 na szczycie przy obserwatorium
- [x] żadne dwa pola się nie nakładają
- [x] pola nie zasłaniają tabliczek z nazwami miejsc

---

## 7. Pułapki w kodzie

Rzeczy, na których łatwo się wyłożyć przy kolejnych zmianach. Wszystkie są już
rozwiązane — to notatka, żeby ktoś tego nie „uprościł” z powrotem.

**Płótno ma dwie różne proporcje.** `FIELD_RATIO = 0.58` jest globalne i szerokie,
a plansza jest wysoka (1536×2048 = 1,3333). Dlatego tryb podaje własne `ratio`,
a `.game__stack--plansza` ogranicza szerokość wysokością okna — bez tego plansza
wyjeżdża poza ekran.

**`pointer()` odpala się także przy `mousemove`.** Gdyby kostka była klikana przez
płótno, samo przesunięcie myszy rzucałoby nią bez końca. Dlatego przycisk rzutu
to `<button>` w DOM, a na płótnie jest tylko rysunek kostki.

**Czas liczymy w klatkach, nie w milisekundach.** Pętla woła `mode.update(1)`
stałym krokiem 1/60 s. Żadnych `setTimeout` ani `Date.now()` w animacjach —
inaczej wróci błąd, przez który pająki wlokły się na słabszym PC.

**Powód dymka trzeba zapamiętać.** Dymek postaci leci na końcu tury, ale bonus
z pola 12 kończy ruch na 14. Sam typ pola końcowego zgubiłby informację, że przed
chwilą był bonus — stąd `state.powodGadki`.

**Numery pól rysuje kod.** `drawPole()` dokłada numer do sprite'a. Bez tego
plansza nie spełnia wymogu „każde pole ma numer" i nie da się policzyć ruchu
wzrokiem.

**Dymki trzeba wpychać w kadr.** Pola specjalne stoją też przy krawędziach
(np. 12 na `x=0.921`), więc pigułka bez przycięcia ucieka poza planszę.

**Długie cofnięcia potrzebują szybszego kroku.** Zamieć cofa o 32 pola — w
normalnym tempie to 13 sekund patrzenia, jak pionek pełznie. Stąd
`KROK_KLATEK_SZYBKI` dla ruchów dłuższych niż `DLUGI_RUCH` pól.

---

## 8. Jak sprawdzić, że działa

`node plansza-test.js` — pełna lista kontrolna planszy.

Haki testowe w `window.__game.gorska`: `setPole(id, nr)`, `rzut(wartosc)`,
`state`. Do przewijania animacji bez czekania: `window.__game.update(1)` w pętli —
pewniejsze niż `setTimeout`, bo `requestAnimationFrame` bywa wygaszany, gdy karta
nie jest aktywnie renderowana.

Ręcznie warto sprawdzić:

- rzut kostką nie działa w trakcie ruchu pionka,
- bonus z pola 12 przesuwa na 14 i **nie** odpala efektu pola 14,
- wiatr na polu 4 nie cofa poniżej pola 1,
- lawina z pola 45 cofa na 35, zamieć z pola 60 zrzuca na 28,
- schronisko daje w następnej turze sumę dwóch rzutów, a flaga się zdejmuje,
- rzut z pola 62 wynikiem 5 kończy grę (nadmiar przepada),
- obaj gracze na jednym polu → serduszko i rozsunięte pionki,
- plansza mieści się w oknie na telefonie i na laptopie 1280×720.

---

## 9. Styl grafiki

Kreskówkowo, grube czarne kontury, żywe kolory: zielone lasy, skaliste granie,
śnieg na szczycie, drewniane schroniska, wyciąg, wodospad, obserwatorium na
Śnieżce. Pola pochodzą z legendy, więc trzymają ten sam styl co reszta planszy.

Trasa jest inspirowana Karkonoszami, ale nie trzyma się geografii co do metra —
kolejność miejsc wynika z tego, gdzie faktycznie są namalowane na planszy.
Dlatego Świątynia Wang jest scenerią, a nie polem: leży w lewym dolnym rogu i
wciągnięcie jej do trasy zmusiłoby wężyk do zawracania przez pół planszy.
