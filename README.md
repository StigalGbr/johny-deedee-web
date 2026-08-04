# Vertigo — Johnny Bravo & Dee Dee

Prosta statyczna strona: tło, dwie klikalne postacie i licznik odliczający do
**5 sierpnia 2026, 20:00 czasu polskiego**.

Kliknięcie w postać pokazuje dymek z tekstem (znika po ponownym kliknięciu,
po kliknięciu obok, klawiszem `Esc` albo automatycznie po 6 sekundach).

## Zawartość

```
index.html          struktura strony
style.css           layout, tło, dymki, wersja mobilna
script.js           licznik + obsługa kliknięć
pic/
  background.png    tło
  johny-bravo.png   postać po lewej
  dee-dee.png       postać po prawej
```

Zero zależności, zero builda — czysty HTML/CSS/JS.

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

Bezpośrednio w [`index.html`](index.html), w elementach
`#bubble-johny` i `#bubble-deedee`.
