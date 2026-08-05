# Akcja w Karkonoszach: Johnny i Dee Dee na Śnieżkę

## 1. Opis ogólny gry

**Akcja w Karkonoszach: Johnny i Dee Dee na Śnieżkę** to internetowa gra planszowa dla 2 graczy. Gracze wcielają się w Johnny’ego Bravo i Dee Dee, którzy startują w Karpaczu i ścigają się przez najważniejsze miejsca Karkonoszy aż na szczyt Śnieżki.

Plansza ma formę kreskówkowej mapy górskiej. Trasa prowadzi przez lasy, schroniska, wodospad, szczyty, przełęcze i finałowe strome podejście z łańcuchami na Śnieżkę. Gra ma być lekka, dynamiczna, zabawna i wizualnie podobna do kolorowej kreskówki z grubymi czarnymi konturami.

## 2. Cel gry

Celem gry jest dotarcie jako pierwszy na pole **64 — META: ŚNIEŻKA**.

Gracz, który jako pierwszy stanie na polu 64, wygrywa grę.

## 3. Liczba pól

Plansza ma dokładnie **64 pola**.

Najważniejsza zasada techniczna:

- każde pole musi mieć numer,
- pola funkcyjne również są liczone jako normalne pola,
- numeracja idzie kolejno od 1 do 64,
- nie może być brakujących numerów,
- nie może być powtórzonych numerów,
- następne pole na normalnej trasie ma numer większy o 1,
- poprzednie pole ma numer mniejszy o 1.

Efekty specjalne, takie jak wyciąg albo bonus, mogą powodować przeskok w grze, ale nie zmieniają normalnej numeracji planszy.

Przykład: jeśli pole 6 daje bonus wyciągu, gracz może przeskoczyć dalej, ale na planszy nadal istnieje normalna ścieżka:

**6 → 7 → 8 → 9 → 10**

## 4. Start i meta

### Start

Gra zaczyna się na polu **1 — START: KARPACZ**.

Pole 1 może być oznaczone serduszkiem albo specjalnym polem startowym. Jest normalnym polem gry i musi mieć numer 1.

### Meta

Gra kończy się na polu **64 — META: ŚNIEŻKA**.

Pole 64 powinno znajdować się na samym szczycie Śnieżki, obok charakterystycznego obserwatorium. Może być oznaczone złotym polem z pucharem.

## 5. Główna trasa planszy

Trasa jest inspirowana Karkonoszami, ale nie musi być w pełni realistyczna geograficznie. Może być lekko fantazyjna i planszówkowa, ważne jednak, żeby zawierała charakterystyczne miejsca regionu.

Proponowany przebieg:

1. **Karpacz — start**
2. **Dolna stacja / wyciąg narciarski**
3. **Świątynia Wang**
4. **Leśne podejście**
5. **Mały Staw**
6. **Schronisko Samotnia**
7. **Strzecha Akademicka**
8. **Hala Szrenicka**
9. **Szrenica**
10. **Wodospad Kamieńczyka**
11. **Przełęcz Karkonoska**
12. **Schronisko Odrodzenie**
13. **Śnieżne Kotły**
14. **Dom Śląski pod Śnieżką**
15. **Finałowe podejście z łańcuchami**
16. **Śnieżka — meta**

## 6. Podział pól według odcinków

### Pola 1–10: Karpacz, start i wyciąg

Ten fragment znajduje się na dole planszy.

- **1** — START: KARPACZ / serduszko startowe
- **2–5** — pierwsze pola szlaku
- **6** — zielona strzałka / wyciąg narciarski
- **7–9** — dojście do dalszego szlaku
- **10** — początek właściwego podejścia górskiego

Pole 6 ma specjalny efekt: jeśli gracz stanie na nim, może skorzystać z wyciągu i przeskoczyć na wyższe pole, np. w okolice pola 20–24. Dokładne pole docelowe powinien ustalić agent kodujący.

### Pola 11–24: Świątynia Wang i leśne podejście

Ten fragment powinien prowadzić przez dolny i środkowy las oraz okolice Świątyni Wang.

W tym odcinku można umieścić:

- zwykłe pola kamienne,
- jedno pole czerwone z wiatrem,
- jedno pole niebieskie z lornetką lub punktem widokowym,
- jedno pole schroniskowe/domkowe, jeśli pasuje do kompozycji.

Numeracja musi iść po kolei:

**11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19 → 20 → 21 → 22 → 23 → 24**

### Pola 25–34: Mały Staw, Samotnia i Strzecha Akademicka

Ten odcinek jest bardziej malowniczy i powinien przebiegać obok Małego Stawu oraz schronisk.

Ważne pola:

- okolice **Małego Stawu**,
- **Schronisko Samotnia**,
- **Strzecha Akademicka**.

Schroniska są polami specjalnymi. Jeśli gracz zatrzyma się na polu schroniska, w następnej turze rzuca dwa razy.

### Pola 35–44: Hala Szrenicka, Szrenica i Wodospad Kamieńczyka

Ten fragment może być bardziej dynamiczny i wietrzny.

Powinny pojawić się:

- **Hala Szrenicka**,
- **Szrenica**,
- **Wodospad Kamieńczyka**,
- pole z wiatrem,
- pole narciarza lub bonusu ruchu.

Na Hali Szrenickiej mocno wieje, więc można zastosować dodatkową zasadę: jeśli gracz stanie na polu wiatru przy Hali Szrenickiej, traci jedną turę albo cofa się o wskazaną liczbę pól.

### Pola 45–52: Odrodzenie, Śnieżne Kotły i grań

Ten fragment prowadzi wyżej w góry, przez bardziej skalisty teren.

Ważne lokacje:

- **Przełęcz Karkonoska**,
- **Schronisko Odrodzenie**,
- **Śnieżne Kotły**.

Tutaj można umieścić pola widokowe z lornetką oraz pola przeszkód związane z wiatrem albo trudnym szlakiem.

### Pola 53–64: Dom Śląski i finałowe podejście na Śnieżkę

To końcowy, najbardziej emocjonujący fragment planszy.

- **53–58** — okolice Domu Śląskiego i dojście pod Śnieżkę
- **59–63** — strome końcowe podejście kamienną ścieżką z łańcuchami
- **64** — META: ŚNIEŻKA, złote pole z pucharem przy obserwatorium

Ostatnie 3–5 pól powinno wyglądać jak finałowa wspinaczka: skały, śnieg, słupki, łańcuchy i wyraźne podejście pod górę.

## 7. Rodzaje pól

### Zwykłe pole

Beżowe lub kamienne pole z numerem.

Efekt: brak specjalnego działania. Gracz zatrzymuje się i czeka na następną turę.

### Schronisko

Pole z ikoną domku/schroniska.

Efekt: gracz, który zatrzyma się na tym polu, w następnej turze rzuca dwa razy. Wyniki mogą się sumować albo można pozwolić graczowi wybrać lepszy wynik — decyzja dla agenta kodującego.

### Zielona strzałka / bonus

Pole z zieloną strzałką.

Efekt: gracz przesuwa się dodatkowo do przodu albo korzysta ze skrótu.

Najważniejszy przykład: pole 6 przy wyciągu. Jeśli gracz stanie na polu 6, jedzie wyciągiem i przeskakuje na wyższe pole.

### Czerwony wiatr / przeszkoda

Pole czerwone z ikoną wiatru.

Efekt przykładowy:

- cofnięcie o 2 pola,
- strata kolejki,
- albo konieczność rzutu dodatkowego: niski wynik oznacza cofnięcie, wysoki wynik oznacza brak kary.

### Niebieska lornetka / punkt widokowy

Pole niebieskie z lornetką.

Efekt przykładowy:

- gracz podziwia widok i może podejrzeć kolejny efekt na trasie,
- albo otrzymuje mały bonus, np. +1 pole.

### Pomarańczowy narciarz

Pole pomarańczowe z narciarzem.

Efekt przykładowy:

- szybki zjazd: gracz przesuwa się o kilka pól do przodu,
- albo ryzykowny zjazd: dodatkowy rzut decyduje, czy gracz jedzie do przodu, czy cofa się.

### Serduszko

Pole serca może oznaczać start albo efekt spotkania graczy.

Główna zasada spotkania: jeśli Johnny i Dee Dee staną na tym samym polu, na ekranie pojawia się animacja serduszka.

### Meta / puchar

Pole 64 z pucharem.

Efekt: zakończenie gry i zwycięstwo gracza.

## 8. Zasady ruchu

1. Gracz rzuca wirtualną kostką od 1 do 6.
2. Pionek przesuwa się o wylosowaną liczbę pól.
3. Po zatrzymaniu się na polu wykonywany jest efekt tego pola.
4. Jeśli gracz stanie na schronisku, w następnej turze rzuca dwa razy.
5. Jeśli gracz stanie na zielonej strzałce, wykonuje bonusowy ruch zgodnie z opisem pola.
6. Jeśli gracz stanie na czerwonym wietrze, wykonuje karę zgodnie z opisem pola.
7. Jeśli obaj gracze znajdą się na tym samym polu, pojawia się animacja serduszka.
8. Wygrywa gracz, który pierwszy dotrze na pole 64.

## 9. Sugestia zasad specjalnych dla agenta kodującego

### Schroniska

Pole typu `shelter`:

- ustawia flagę `doubleRollNextTurn = true`,
- w następnej turze gracz rzuca dwa razy,
- po wykorzystaniu bonusu flaga wraca do `false`.

### Wyciąg

Pole typu `lift`:

- przykład: pole 6 przenosi gracza na wyższe pole, np. 22 albo 24,
- ruch wyciągiem powinien być animowany wzdłuż linii wyciągu.

### Spotkanie graczy

Jeśli `playerA.position === playerB.position`:

- uruchom animację serca,
- animacja nie musi zmieniać zasad ruchu,
- może być tylko efektem wizualnym.

### Meta

Jeśli `player.position >= 64`:

- ustaw pozycję na 64,
- zakończ grę,
- pokaż zwycięstwo.

## 10. Wymagania graficzne planszy

Plansza powinna być w stylu kreskówkowym:

- żywe kolory,
- grube czarne kontury,
- zielone lasy,
- skaliste góry,
- śnieg na szczytach,
- drewniane schroniska,
- wyciąg narciarski,
- wodospad,
- obserwatorium na Śnieżce,
- humorystyczny, dynamiczny klimat.

Jeśli plansza jest generowana bez pól, powinna zawierać samo tło z lokacjami i miejscem na ręczne wstawienie pól.

Jeśli plansza jest generowana z polami, musi spełniać rygor numeracji:

- dokładnie 64 pola,
- wszystkie pola ponumerowane,
- każde pole specjalne ma numer,
- brak duplikatów,
- brak luk,
- ciągła trasa od pola 1 do pola 64.

## 11. Lista kontrolna przed finalnym użyciem planszy

Przed przekazaniem grafiki do kodowania należy sprawdzić:

- [ ] Czy na planszy jest dokładnie 64 pól?
- [ ] Czy są wszystkie numery od 1 do 64?
- [ ] Czy żaden numer się nie powtarza?
- [ ] Czy każde pole specjalne ma numer?
- [ ] Czy trasa jest ciągła i intuicyjna?
- [ ] Czy po każdym polu można wskazać następne sąsiadujące pole?
- [ ] Czy pole 6 jako wyciąg nie psuje normalnej numeracji?
- [ ] Czy schroniska mają przypisaną zasadę rzutu 2x?
- [ ] Czy końcówka 59–64 prowadzi do Śnieżki?
- [ ] Czy pole 64 znajduje się na szczycie przy obserwatorium?

## 12. Skrócony opis dla kodera

Gra planszowa online dla 2 graczy. Gracze poruszają się po polach 1–64. Każda tura to losowanie liczby 1–6 i przesunięcie pionka. Pola specjalne uruchamiają efekty: schronisko daje następny rzut 2x, wyciąg/strzałka daje skrót lub bonusowy ruch, wiatr daje karę, lornetka daje bonus widokowy, narciarz daje szybki ruch, spotkanie graczy na tym samym polu pokazuje serduszko. Wygrywa pierwszy gracz na polu 64 — Śnieżka.
