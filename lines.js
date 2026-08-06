// Wszystkie teksty strony w jednym miejscu.
// Logika siedzi w script.js - tutaj tylko tresc, mozna edytowac bez obaw.

// Dialogi. Kazdy wpis to lista kwestii w kolejnosci wypowiadania:
//   [ ["johny", "tekst"], ["deedee", "odpowiedz"] ]
// Wpis z jedna kwestia to zwykly monolog. Odpowiedz pojawia sie
// REPLY_DELAY_MS po pierwszej kwestii (ustawienie w script.js).
const DIALOGS = [

    // --- otwarcie, zawsze leci jako pierwsze po wejsciu na strone ---
    [
        ["johny", "Baciata? 💃 To jakiś nowy framework czy da się to zainstalować?"],
        ["deedee", "Nie da się zainstalować. Trzeba przyjść i tańczyć 💃"]
    ],

    // --- duety ---
    [
        ["deedee", "Kawa bez mleka to nie kawa, to kara ☕🥛"],
        ["johny", "Zamówiłem Ci kawę z mlekiem. Czyli mleko z kawą. Czyli krowę z ekspresu ☕🐄"]
    ],
    [
        ["johny", "Zrobiłem Ci excela z trasami w góry 📊 Dwanaście zakładek, filtry i wykres przewyższeń."],
        ["deedee", "Zrobisz mi excela, ile lodów mogę zjeść w tygodniu? 📊🍦 Ale tak, żeby wyszło dużo."]
    ],
    [
        ["deedee", "Zatańczysz ze mną baciatę? 💃 Spokojnie, w krótkich spodenkach też można 🩳"],
        ["johny", "Wiem, krótkie spodenki na randkę 🩳 W dokumentacji nie było napisane, że nie wolno."]
    ],
    [
        ["deedee", "Pająk w łazience?! 🕷️ Loki, do ataku! ...Loki, wracaj natychmiast!"],
        ["johny", "Idę! Tylko znajdę okulary, żeby go w ogóle zobaczyć 🤓"]
    ],
    [
        ["deedee", "Pająk siedzi na moim laptopie 🕷️💻 Ty jesteś od komputerów, więc technicznie to Twoja działka."],
        ["johny", "Zostaw go. To nie pająk, to dodatkowa warstwa zabezpieczeń 🔒"]
    ],
    [
        ["johny", "Widziałaś gdzie moje okulary? 🤓 Jestem stary, zapomniałem ich."],
        ["deedee", "Na głowie 🤓"]
    ],
    [
        ["johny", "Emotki w wiadomościach? Kto to widział takie fanaberie 🙄"],
        ["deedee", "Napisałeś to z emotką 🙄"]
    ],
    [
        ["johny", "Poznaj siostrę mojej córki! Znaczy... córkę mojej siostry 🤯"],
        ["deedee", "Johnny. Oddychaj 🤯"]
    ],
    [
        ["johny", "To jest chłopak mojej dziewczyny. CÓRKI! Chłopak mojej córki 😰"],
        ["deedee", "Wiem co miałeś na myśli. Chyba 😰"]
    ],
    [
        ["deedee", "Cześć, jestem małym głodomorkiem 🥺 Masz pampucha?"],
        ["johny", "Miałem. Loki był szybszy 🐕"]
    ],
    [
        ["deedee", "Loki zjadł mojego pampucha 🐕 Wybaczyłam mu, bo miał taką minę."],
        ["johny", "Psu wybaczyłaś od razu, a mnie za te spodenki do dziś nie 🩳"]
    ],
    [
        ["deedee", "Owoce morza? Fuj! 🦑 Owoc to jest jabłko, a morze niech zostanie w morzu."],
        ["johny", "Popieram. Nie ufam jedzeniu, które ma więcej nóg niż ja 🦐"]
    ],
    [
        ["johny", "Zbackupowałem nasze zdjęcia z randki. Trzy kopie, jedna w chmurze 💾 Jestem romantyczny."],
        ["deedee", "To najdziwniejsze wyznanie miłości w historii. I działa 💾"]
    ],

    // --- monologi ---
    [
        ["johny", "Za moich czasów telefon miał kabel ☎️ a randka miała długie spodnie."]
    ],
    [
        ["deedee", "Lody czekoladowe to nie deser, to grupa żywieniowa 🍫🍦"]
    ],
    [
        ["deedee", "Wchodzimy na szczyt, robimy zdjęcie i schodzimy na lody ⛰️📸 Taki mam plan na życie."]
    ]
];

// Dialog pokazywany zaraz po wejsciu na strone.
const OPENING_DIALOG_INDEX = 0;

// Ekran powitalny: na gorze swiecacy neon, pod nim podpis jak tytul kreskowki.
const SPLASH_TITLE = "Przygody";
const SPLASH_SHOW = "Johnny'ego & Dee Dee";

// Napis na przycisku w naglowku sceny (klikniecie sypie konfetti).
const HEADER_LINE = "Przygody Johnny'ego & Dee Dee 🎉";

// Reakcje na akcje uzytkownika.
const REACTIONS = {
    spider: "NIE. NIE. NIE. Zabierz to 🕷️",
    heroAim: "Nie ruszaj się. Mam to pod kontrolą 🚀",
    hero: "Mój bohater 😍",
    nerdModeOn: "Wchodzę w tryb nerda 🟩 Od teraz mówię binarnie."
};

// Teksty w trybach gry.
const GAME_TEXTS = {
    menuTitle: "W co gramy?",

    badminton: {
        name: "Badminton",
        icon: "🏸",
        blurb: "Grasz Dee Dee. Johnny po drugiej stronie siatki.",
        hint: "Myszką albo palcem: góra ekranu — rakietka w górę, dół — w dół",
        winPlayer: "Wygrywasz! Johnny zaraz wyjaśni, że to była kwestia optymalizacji 🏸",
        winCpu: "Johnny wygrywa. Poszedł świętować i zgubił okulary 🤓",
        toWin: 5
    },

    obrona: {
        name: "Obrona Dee Dee",
        icon: "🕷️",
        blurb: "Pająki idą po Dee Dee. Johnny ma bazookę, Ty masz celownik.",
        hint: "Klikaj w pająki, zanim dojdą do Dee Dee. Trzy życia.",
        over: "Koniec. Dee Dee poszła na lody, a pająki zostały 🕷️🍦",
        lives: 3
    },

    // Plansza "Akcja w Karkonoszach" - zasady w docs/akcja-w-karkonoszach.md.
    gorska: {
        name: "Górska przygoda",
        icon: "🏔️",
        blurb: "Planszówka: Johnny i Dee Dee ścigają się na Śnieżkę.",
        hint: "Rzuć kostką (albo naciśnij spację) i idź polami na szczyt Śnieżki.",
        badge: "NEW"
    }
};

// Zasady pokazywane pod przyciskiem "? Zasady" w trybie planszowym.
// Pelny opis siedzi w docs/akcja-w-karkonoszach.md - tutaj jest skrot dla gracza.
const ZASADY = {
    tytul: "Górska przygoda — zasady",
    cel: "Rzucacie na zmianę kostką i idziecie polami z Karpacza na Śnieżkę. Wygrywa ten, kto pierwszy stanie na polu 64. Nie trzeba trafić dokładnie — nadmiar przepada.",
    pola: [
        { ikona: "pole-normal", nazwa: "Zwykłe pole", opis: "Nic się nie dzieje." },
        { ikona: "pole-shelter", nazwa: "Schronisko", opis: "W następnej turze Twój rzut liczy się podwójnie (×2)." },
        { ikona: "pole-bonus", nazwa: "Bonus", opis: "Idziesz 2 pola do przodu." },
        { ikona: "pole-view", nazwa: "Punkt widokowy", opis: "Idziesz 1 pole do przodu." },
        { ikona: "pole-ski", nazwa: "Narciarz", opis: "Zjazd: 3 pola do przodu." },
        { ikona: "pole-wind", nazwa: "Wiatr", opis: "Cofasz się o 2 pola." },
        { ikona: "pole-bonus", nazwa: "Wyciąg — pole 6", opis: "Wjeżdżasz kolejką aż na pole 27." },
        { ikona: "pole-lawina", nazwa: "Lawina — pole 45", opis: "Cofasz się aż o 10 pól!", straszne: true },
        { ikona: "pole-zamiec", nazwa: "Zamieć — pole 60", opis: "Trzy kroki od szczytu wracasz do Samotni, na pole 28!", straszne: true },
        { ikona: "pole-heart", nazwa: "Serduszko", opis: "Gdy oboje staniecie na tym samym polu." },
        { ikona: "pole-meta", nazwa: "Meta — pole 64", opis: "Szczyt Śnieżki. Koniec gry." }
    ],
    uwaga: "Efekt pola działa tylko wtedy, gdy staniesz na nim rzutem kostki. Jeśli trafisz tam przez inny efekt — pole milczy."
};

// Dymki postaci w gre planszowej. Pokazuja sie na koncu tury: po rzucie, po
// dojsciu pionka na pole i po plakietce z efektem.
//
// Klucz to typ pola z plansza-trasa.js, "spotkanie" to zejscie sie obu pionkow,
// a "zwykle" to pula ogolna dla pol bez efektu (leci tylko czasem, zeby gra nie
// zamienila sie w sciane tekstu).
//
// Kto jest kim - patrz docs/bohaterowie.md. Krotko, z emotka i tak, zeby po
// samym tekscie dalo sie poznac postac.
const GAME_BUBBLES = {
    bonus: {
        johny: [
            "Wyliczyłem to na drukarce 3D 🖨️😎",
            "Skrót jak z mapy zamku 🏰⚡",
            "Biegam. Czasem nawet szybko 🏃‍♂️😄"
        ],
        deedee: [
            "Staruszek mnie nie złapie 👴😜",
            "Szybciej niż na żużlu! 🏍️💨",
            "Bachata mi nogi wyćwiczyła 💃⚡"
        ]
    },

    wind: {
        johny: [
            "Wiatr jak na ruinach zamku 🏰🌬️",
            "Za moich czasów wiało wolniej 👴🌬️",
            "Gitara mi się rozstroiła 🎸😖"
        ],
        deedee: [
            "O kurczę, już go nie dogonię 😩🌬️",
            "Wiatr zniszczył mi fryzurę! 💇‍♀️😤",
            "W Dolomitach tak nie wieje 🏔️😖"
        ]
    },

    lawina: {
        johny: [
            "Zjazd gorszy niż w Energylandii 🎢😱",
            "Za stary jestem na takie akcje 👴❄️",
            "Dziesięć pól. Policzyłem 📊😰"
        ],
        deedee: [
            "Jak na kajaku, tylko bez kajaka 🛶😱",
            "Moje włosy! I moje pola! 💇‍♀️😱",
            "Loki, ratuj mnie stąd! 🐕😰"
        ]
    },

    zamiec: {
        johny: [
            "Byłem trzy pola od szczytu… 🥶💔",
            "Zimniej niż na ściance w listopadzie 🧗🥶",
            "Wracam. Znowu. I to na piechotę 🥶😩"
        ],
        deedee: [
            "NIE. Ja tam byłam! 🥶😭",
            "Zjazd do Samotni. Chociaż kawa ☕🥶",
            "Kto zamówił tę zamieć?! 🥶😤"
        ]
    },

    view: {
        johny: [
            "Panorama jak z ruin zamku 🏰📸",
            "Widok na cały mecz stąd ⚽😎",
            "Zagrałbym tu coś na gitarze 🎸🏔️"
        ],
        deedee: [
            "Widok jak z Dolomitów! 🏔️😍",
            "Wyślę sobie stąd pocztówkę 💌🏔️",
            "Tu bym postawiła SUP-a 🏄‍♀️😍"
        ]
    },

    ski: {
        johny: [
            "Szybciej niż moja drukarka 🖨️🎿",
            "Kiedyś jeździłem. Kiedyś ⛷️👴",
            "Zjazd jak kontra w piłce ⚽💨"
        ],
        deedee: [
            "Jak spływ kajakiem, tylko po śniegu 🛶🎿",
            "Szybciej niż na żużlu! 🏍️💨",
            "Trzymaj się, Loki! 🐕🎿"
        ]
    },

    shelter: {
        johny: [
            "Wyciągam gitarę, siadamy 🎸☕",
            "Nogi swoje odbiegały 🏃‍♂️😴",
            "Labrador by tu został na zawsze 🐕😴"
        ],
        deedee: [
            "Kawa. Z mlekiem. Inaczej nie idę ☕🥛",
            "Zaśpiewajmy Stare Dobre Małżeństwo 🎶😊",
            "Poszukam tu blatów do kuchni 🔨😄"
        ]
    },

    lift: {
        johny: [
            "Sprawdziłem nośność. Dwa razy 🤓🚡",
            "Wolę to niż ściankę wspinaczkową 🧗🚡",
            "Siadam. Nogi mają wolne 👴🚡"
        ],
        deedee: [
            "Jadę gondolą, pa pa! 🚡😘",
            "Widok z góry — pocztówka gotowa 💌🚡",
            "Jak kolejka w Energylandii! 🎢😆"
        ]
    },

    meta: {
        johny: [
            "Szczyt zdobyty. Zagram wam marsza 🎸🏆",
            "Wygrałem! I to bez wyciągu 💪🏆",
            "Gol w ostatniej minucie ⚽🏆"
        ],
        deedee: [
            "Śnieżka moja! Teraz lody 🏆🍦",
            "Wygrałam! Zatańczmy bachatę 💃🏆",
            "Pocztówka ze szczytu — do siebie 💌🏔️"
        ]
    },

    spotkanie: {
        johny: [
            "Jak na tym koncercie Amy 🎤💗",
            "Zaśpiewam ci, jak wtedy 🎸💗",
            "Randka na szlaku ⛰️💗"
        ],
        deedee: [
            "Zatańczysz tu ze mną? 💃💗",
            "Pamiętasz ten koncert Amy? 🎤💗",
            "Płyniemy latem kajakiem, tak? 🛶💗"
        ]
    },

    zwykle: {
        johny: [
            "Tempo w normie ⚽",
            "Nogi jeszcze niosą 🏃‍♂️",
            "Za moich czasów szło się szybciej 👴",
            "Zaśpiewałbym coś 🎸",
            "Krok po kroku 🥾"
        ],
        deedee: [
            "Idziemy dalej! 🥾",
            "Loki by tu już był 🐕",
            "W Dolomitach będzie lepiej 🏔️",
            "Jeszcze kawałek i lody 🍦",
            "A latem kajaki 🛶"
        ]
    }
};

// Tryb nerda: te zdania sa zamieniane na kod binarny w locie.
// Krotkie, zeby dalo sie je rozszyfrowac i zeby zmiescily sie w dymku.
const NERD_PHRASES = [
    "Kocham Cie",
    "Ladnie dzis",
    "Kawa?",
    "Tak"
];

// Zartobliwy plan wieczoru, chowany pod przyciskiem w rogu.
const PLAN = [
    ["19:00", "Johnny szuka okularów"],
    ["19:15", "Johnny nadal szuka okularów"],
    ["19:30", "Wyjście. Krótkie spodenki. Znowu 🩳"],
    ["19:45", "Kawa. Z mlekiem. Bez krowy ☕"],
    ["20:00", "Baciata 💃"],
    ["21:00", "Lody czekoladowe. Podwójne 🍦"],
    ["22:00", "Loki dostaje pampucha 🐕"],
    ["23:00", "Johnny mówi „dobrywieczór” i idzie spać"]
];
