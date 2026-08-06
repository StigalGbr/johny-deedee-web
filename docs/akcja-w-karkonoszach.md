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

## 7. Styl grafiki

Kreskówkowo, grube czarne kontury, żywe kolory: zielone lasy, skaliste granie,
śnieg na szczycie, drewniane schroniska, wyciąg, wodospad, obserwatorium na
Śnieżce. Pola pochodzą z legendy, więc trzymają ten sam styl co reszta planszy.

Trasa jest inspirowana Karkonoszami, ale nie trzyma się geografii co do metra —
kolejność miejsc wynika z tego, gdzie faktycznie są namalowane na planszy.
Dlatego Świątynia Wang jest scenerią, a nie polem: leży w lewym dolnym rogu i
wciągnięcie jej do trasy zmusiłoby wężyk do zawracania przez pół planszy.
