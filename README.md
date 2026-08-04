# Vertigo — Johnny Bravo & Dee Dee

Prosta statyczna strona: tło, dwie klikalne postacie i licznik odliczający do
**5 sierpnia 2026, 20:00 czasu polskiego**.

Postacie gadają same, bez klikania: po wejściu na stronę zawsze leci ten sam
dialog otwierający, potem losowane są kolejne. Ponowne kliknięcie w gadającą
postać, kliknięcie obok albo `Esc` chowa dymek — kolejka wraca po 10 sekundach.

## Zawartość

```
index.html           struktura strony
style.css            layout, tło, dymki, splash, efekty, wersja mobilna
lines.js             wszystkie teksty — dialogi, plan wieczoru, reakcje
script.js            cała logika
pic/
  *.webp             pliki używane przez stronę
  *.png              oryginały (nieużywane przez stronę, trzymane jako źródło)
```

Zero zależności, zero builda — czysty HTML/CSS/JS. Teksty są odcięte od
logiki: żeby zmienić co postacie mówią, wystarczy `lines.js`.

## Co się dzieje na stronie

**Dialogi.** Postacie prowadzą rozmowy — jedna zagaja, druga odpowiada po 3,5
sekundy, potem 10 sekund przerwy i losowany jest kolejny dialog. Część wpisów
to monologi. Kliknięcie w postać przerywa kolejkę i wywołuje od niej losową
kwestię.

**Efekty.** Kliknięcie w Dee Dee sypie lodami i serduszkami, kliknięcie w
Johnny'ego zrzuca mu okulary na ziemię (wracają po 3 sekundach). Kliknięcie w
licznik strzela konfetti.

**Pająk.** Potrząśnięcie telefonem przepuszcza pająka przez ekran, a Dee Dee
reaguje. iOS wymaga zgody na czujnik ruchu i to koniecznie z poziomu gestu,
dlatego pyta o nią przycisk `🕷️ Obudź pająka` w planie wieczoru — ten sam
przycisk wypuszcza pająka na komputerze.

**Tryb nerda.** Pięć kliknięć w Johnny'ego pod rząd zmienia tło w zielony
deszcz zer i jedynek, a jego kwestie w kod binarny. Wyłącza się sam po 25
sekundach albo po kolejnych pięciu kliknięciach. Binarne zdania da się
rozszyfrować — są krótkie i przyjazne.

**Finisz.** W ostatniej godzinie licznik zmienia ton na „Ostatnia prosta!"
i zaczyna pulsować. W ostatniej minucie wjeżdżają wielkie cyfry na pełny
ekran. Po dojściu do zera lecą trzy salwy konfetti, postacie zjeżdżają się na
środek pod wspólnym dymkiem, a licznik zaczyna liczyć w górę: „Randka trwa…".

## Inna data

Bez ruszania kodu, przez adres:

```
?do=2026-09-12T19:00     konkretna godzina
?do=2026-09-12           sama data, godzina domyślna 20:00
```

Bez podanej strefy przyjmowany jest czas polski. Przydaje się też do
sprawdzenia finału — wystarczy wpisać datę z przeszłości.

## Ładowanie i wydajność

Pierwsze wejście z pustym cache składało się na oczach użytkownika: najpierw
postacie na białym tle, po chwili dymek, a tło dopiero na końcu. Złożyły się na
to trzy rzeczy i każda ma swoje lekarstwo:

1. **Waga plików.** Trzy PNG-i ważyły łącznie 6,3 MB. Te same obrazki w WebP
   to 368 KB, czyli 5,7% poprzedniego rozmiaru — bez widocznej różnicy w
   jakości. Strona używa `.webp`, a PNG-i zostały w repo jako źródło.
2. **Tło jest w CSS.** Przeglądarka dowiaduje się o nim dopiero po pobraniu i
   sparsowaniu arkusza, więc startuje z nim jako ostatnim. Rozwiązuje to
   `<link rel="preload" as="image">` w `index.html`.
3. **Brak jednego momentu startu.** Splash (`#splash`) przykrywa scenę do
   czasu, aż wszystkie trzy obrazki będą gotowe, i dopiero wtedy odsłania
   całość. Karuzela dymków rusza razem z odsłonięciem, więc pierwsza odzywka
   zawsze dostaje pełne 10 sekund.

Splash ma bezpiecznik `SPLASH_TIMEOUT_MS` (8 s) — gdyby któryś obrazek nie
doszedł, scena i tak się pokaże.

Regenerowanie WebP (wymaga Pillow, `pip install pillow`):

```bash
python -c "from PIL import Image; im=Image.open('pic/background.png').convert('RGB'); im.save('pic/background.webp','WEBP',quality=70,method=6)"
```

Postacie zapisywane są tak samo, tyle że w trybie `RGBA` i z `quality=80`.

## Podgląd lokalny

Nie otwieraj `index.html` podwójnym kliknięciem — przez `file://` część
przeglądarek blokuje ładowanie zasobów. Uruchom lokalny serwer:

```bash
python -m http.server 5173
```

albo

```bash
npx serve .
```

Potem wejdź na `http://localhost:5173`.

## Hosting 1: GitHub Pages

Strona jest statyczna, więc Pages wystarczy w zupełności.

1. Wypchnij kod na `main`:

```bash
git push -u origin main
```

2. W repo na GitHubie: **Settings → Pages**
3. **Source**: `Deploy from a branch`
4. **Branch**: `main`, folder `/ (root)` → **Save**
5. Po ~1 minucie strona jest pod adresem:

```
https://stigalgbr.github.io/johny-deedee-web/
```

Każdy kolejny `git push` na `main` automatycznie odświeża stronę
(zakładka **Actions** pokazuje postęp deployu).

To samo z linii poleceń przez `gh`:

```bash
gh api -X POST repos/StigalGbr/johny-deedee-web/pages -f "source[branch]=main" -f "source[path]=/"
```

## Hosting 2: Vercel (opcjonalnie)

Vercel daje szybszy deploy i podgląd każdego brancha (preview deployments).

1. Wejdź na [vercel.com](https://vercel.com) i zaloguj się przez GitHub
2. **Add New… → Project**
3. Wybierz repo `johny-deedee-web` → **Import**
4. Ustawienia:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build Command**: puste (albo wyłącz override)
   - **Output Directory**: puste
5. **Deploy**

Adres: `https://johny-deedee-web.vercel.app` (dokładna nazwa zależy od
dostępności). Każdy push na `main` = nowy deploy produkcyjny, każdy push na
inny branch = deploy podglądowy pod osobnym URL-em.

Własna domena: **Project → Settings → Domains → Add**, potem ustawienie
rekordu CNAME u rejestratora domeny zgodnie z instrukcją, którą pokaże Vercel.

## Zmiana daty odliczania na stałe

W [`script.js`](script.js), na górze pliku:

```js
const DEFAULT_TARGET = "2026-08-05T20:00:00+02:00";
```

`+02:00` to czas polski letni (CEST). Zimą (CET) byłoby `+01:00`. Strefa jest
wpisana na sztywno celowo — dzięki temu każdy widzi to samo odliczanie
niezależnie od ustawień swojego komputera. Doraźnie łatwiej użyć parametru
`?do=` z adresu (patrz wyżej).

## Zmiana tekstów

Wszystko siedzi w [`lines.js`](lines.js). Dialog to lista kwestii
w kolejności wypowiadania:

```js
const DIALOGS = [
    [
        ["johny", "Zagajenie"],
        ["deedee", "Odpowiedź"]
    ],
    [
        ["deedee", "Monolog, gdy kwestia jest tylko jedna"]
    ]
];
```

Kolejność w tablicy nie ma znaczenia poza pozycją `OPENING_DIALOG_INDEX` —
to jest dialog otwierający, pokazywany zaraz po wejściu na stronę. W tym samym
pliku siedzą też `PLAN` (plan wieczoru), `FINALE_LINE` (wspólny dymek na
finiszu), `REACTIONS` i `NERD_PHRASES`.

## Pokrętła

Wszystkie na górze [`script.js`](script.js):

| stała | domyślnie | co robi |
|---|---:|---|
| `CYCLE_MS` | 10 000 | przerwa między dialogami |
| `REPLY_DELAY_MS` | 3 500 | odstęp między kwestiami w duecie |
| `URGENT_FROM_MS` | 3 600 000 | od kiedy licznik pulsuje |
| `FINAL_FROM_MS` | 60 000 | od kiedy wielkie cyfry na pełny ekran |
| `NERD_CLICKS` | 5 | kliknięć potrzebnych do trybu nerda |
| `NERD_DURATION_MS` | 25 000 | jak długo trwa tryb nerda |
| `SHAKE_THRESHOLD` | 22 | czułość na potrząśnięcie telefonem |
| `SPLASH_TIMEOUT_MS` | 8 000 | bezpiecznik splasha |
