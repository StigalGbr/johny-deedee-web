// Trasa planszy "Akcja w Karkonoszach" - dokladnie 64 pola.
//
// Numer pola to indeks + 1 i nigdzie nie jest zapisany recznie. Dzieki temu
// numeracja nie moze sie rozjechac: nie da sie zgubic numeru ani go powtorzyc,
// a nastepne pole zawsze jest o 1 dalej. To jest cala roznica wzgledem
// numerowania pol na obrazku, gdzie te bledy sie wysypaly.
//
// x, y to ulamki szerokosci i wysokosci tla (pic/plansza/board.webp),
// wiec plansza skaluje sie na kazdym ekranie bez przeliczania wspolrzednych.
//
// Trasa idzie wezykiem od Karpacza na dole do Sniezki w prawym gornym rogu:
//   1-10   dolna laka, w prawo, po drodze dolna stacja wyciagu
//   11-17  prawa krawedz w gore
//   18-28  w lewo przez Strzeche Akademicka do Samotni
//   29-32  w gore na Hale Szrenicka
//   33-40  luk przez Szrenice i zejscie do Wodospadu Kamienczyka
//   41-47  lewa krawedz w gore: Przelecz Karkonoska, Sniezne Kotly
//   48-58  trawers w prawo przez Odrodzenie pod Dom Slaski
//   59-64  strome podejscie granią z lancuchami na szczyt

const TRASA = [
    // --- 1-10: Karpacz, dolna laka ---
    { x: 0.240, y: 0.936, type: "start", name: "START: Karpacz" },
    { x: 0.309, y: 0.943, type: "normal" },
    { x: 0.378, y: 0.947, type: "normal" },
    { x: 0.447, y: 0.946, type: "wind" },
    { x: 0.516, y: 0.941, type: "normal" },
    { x: 0.585, y: 0.933, type: "lift", name: "Wyciąg na Kopę" },
    { x: 0.654, y: 0.926, type: "normal" },
    { x: 0.723, y: 0.923, type: "normal" },
    { x: 0.792, y: 0.924, type: "view" },
    { x: 0.858, y: 0.922, type: "normal" },

    // --- 11-17: prawa krawedz w gore ---
    { x: 0.903, y: 0.898, type: "normal" },
    { x: 0.921, y: 0.866, type: "bonus" },
    { x: 0.919, y: 0.833, type: "normal" },
    { x: 0.906, y: 0.801, type: "normal" },
    { x: 0.891, y: 0.769, type: "wind" },
    { x: 0.884, y: 0.737, type: "normal" },
    { x: 0.890, y: 0.705, type: "normal" },

    // --- 18-28: w lewo, Strzecha Akademicka i Samotnia ---
    { x: 0.898, y: 0.672, type: "normal" },
    { x: 0.871, y: 0.647, type: "normal" },
    { x: 0.833, y: 0.637, type: "normal" },
    { x: 0.789, y: 0.637, type: "normal" },
    { x: 0.745, y: 0.643, type: "normal" },
    { x: 0.700, y: 0.651, type: "shelter", name: "Strzecha Akademicka" },
    { x: 0.655, y: 0.657, type: "normal" },
    { x: 0.610, y: 0.658, type: "normal" },
    { x: 0.565, y: 0.653, type: "wind" },
    { x: 0.522, y: 0.640, type: "normal", name: "Górna stacja wyciągu" },
    // Samotnia idzie nad tabliczke "Maly Staw" - na wysokosci .626 pole
    // zaslanialo napis.
    { x: 0.478, y: 0.602, type: "shelter", name: "Schronisko Samotnia" },

    // --- 29-32: w gore na Hale Szrenicka ---
    { x: 0.466, y: 0.566, type: "normal" },
    { x: 0.470, y: 0.528, type: "normal" },
    { x: 0.482, y: 0.494, type: "normal" },
    // pole tuz pod budynkiem schroniska, zeby go nie przykrywac
    { x: 0.498, y: 0.466, type: "shelter", name: "Schronisko na Hali Szrenickiej" },

    // --- 33-40: luk pod Szrenica do Wodospadu Kamienczyka ---
    { x: 0.462, y: 0.440, type: "normal" },
    { x: 0.424, y: 0.424, type: "ski" },
    { x: 0.386, y: 0.410, type: "normal" },
    { x: 0.348, y: 0.400, type: "view", name: "Szrenica" },
    { x: 0.310, y: 0.404, type: "normal" },
    { x: 0.272, y: 0.414, type: "normal" },
    { x: 0.230, y: 0.428, type: "normal" },
    // trasa zawraca przy wodospadzie i stad pnie sie w gore lewa krawedzia;
    // pole stoi na prawo od tabliczki, ktora zajmuje lewy brzeg na y .40-.45
    { x: 0.185, y: 0.443, type: "bonus", name: "Wodospad Kamieńczyka" },

    // --- 41-47: lewa krawedz w gore ---
    { x: 0.152, y: 0.404, type: "normal" },
    { x: 0.128, y: 0.362, type: "normal" },
    { x: 0.132, y: 0.320, type: "view", name: "Przełęcz Karkonoska" },
    { x: 0.112, y: 0.278, type: "normal" },
    { x: 0.102, y: 0.236, type: "normal" },
    { x: 0.105, y: 0.194, type: "normal" },
    { x: 0.122, y: 0.158, type: "view", name: "Śnieżne Kotły" },

    // --- 48-58: trawers w prawo pod Dom Slaski ---
    { x: 0.182, y: 0.164, type: "normal" },
    { x: 0.242, y: 0.186, type: "normal" },
    { x: 0.302, y: 0.222, type: "normal" },
    // pod budynkiem Odrodzenia, inaczej pole ladowalo na dachu
    { x: 0.360, y: 0.268, type: "shelter", name: "Schronisko Odrodzenie" },
    { x: 0.424, y: 0.280, type: "normal" },
    { x: 0.488, y: 0.286, type: "bonus" },
    { x: 0.552, y: 0.290, type: "normal" },
    { x: 0.616, y: 0.293, type: "wind" },
    { x: 0.680, y: 0.295, type: "normal" },
    { x: 0.750, y: 0.297, type: "normal" },
    { x: 0.830, y: 0.298, type: "shelter", name: "Dom Śląski pod Śnieżką" },

    // --- 59-64: podejscie z lancuchami na szczyt ---
    { x: 0.812, y: 0.258, type: "normal" },
    { x: 0.775, y: 0.222, type: "wind" },
    { x: 0.745, y: 0.186, type: "normal" },
    { x: 0.715, y: 0.152, type: "normal" },
    { x: 0.690, y: 0.122, type: "normal" },
    { x: 0.668, y: 0.098, type: "meta", name: "META: ŚNIEŻKA" }
];

// Wyciag: pole 6 stoi przy dolnej stacji w Karpaczu, a kolejka na rysunku jedzie
// w gore i w LEWO - dlatego skrot konczy sie na polu 27, a nie gdzies w prawo.
// Przeskok o 21 pol, czyli mniej wiecej tyle, co proponowane "z 12 na 25".
const WYCIAG = { from: 6, to: 27 };

if (typeof module !== "undefined") module.exports = { TRASA, WYCIAG };
