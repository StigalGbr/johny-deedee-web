# Vertigo — Johnny Bravo & Dee Dee

Prosta statyczna strona: tło, dwie klikalne postacie i licznik odliczający do
**5 sierpnia 2026, 20:00 czasu polskiego**.

Dymki chodzą same, bez klikania: po wejściu na stronę zawsze odzywa się Johnny
tekstem o baciacie, a potem co 10 sekund głos przejmuje na przemian druga
postać — już z losowaniem. Każda ma pulę dziesięciu odzywek i ta sama nie
wypada dwa razy pod rząd.

Kliknięcie w postać przerywa kolejkę i od razu pokazuje jej nowy tekst
(odliczanie 10 sekund startuje od nowa). Ponowne kliknięcie w gadającą postać,
kliknięcie obok albo `Esc` chowa dymek — karuzela wraca po 10 sekundach.

## Zawartość

```
index.html           struktura strony
style.css            layout, tło, dymki, splash, wersja mobilna
script.js            licznik, teksty dymków, karuzela i kliknięcia
pic/
  *.webp             pliki używane przez stronę
  *.png              oryginały (nieużywane przez stronę, trzymane jako źródło)
```

Zero zależności, zero builda — czysty HTML/CSS/JS.

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

## Zmiana daty odliczania

W [`script.js`](script.js), pierwsza linijka z kodem:

```js
const TARGET = new Date("2026-08-05T20:00:00+02:00");
```

`+02:00` to czas polski letni (CEST). Zimą (CET) byłoby `+01:00`. Strefa jest
wpisana na sztywno celowo — dzięki temu każdy widzi to samo odliczanie
niezależnie od ustawień swojego komputera.

## Zmiana tekstów w dymkach

W [`script.js`](script.js), w obiekcie `LINES`:

```js
const LINES = {
    "bubble-johny":  [ /* odzywki Johnny'ego */ ],
    "bubble-deedee": [ /* odzywki Dee Dee */ ]
};
```

Listy mogą mieć dowolną długość — wystarczy dopisać lub usunąć element tablicy,
losowanie samo się dostosuje.

Tekst otwierający (ten pokazywany zaraz po wejściu na stronę) ustawiają
`OPENING_BUBBLE_ID` i `OPENING_LINE_INDEX` kawałek niżej — domyślnie trzeci
tekst Johnny'ego. Częstotliwość zmiany dymków to `CYCLE_MS` (domyślnie
10 000 ms).
