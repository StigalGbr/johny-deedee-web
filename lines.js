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
            "Zoptymalizowałem trasę 📊⛰️",
            "To przewaga technologiczna 🤓⚡",
            "Skrót wydrukowany w 3D 🖨️😎"
        ],
        deedee: [
            "Staruszek mnie nie złapie 👴😜",
            "To za te spodenki! 🩳💨",
            "Szybsza niż Loki po pampucha 🐕🍩"
        ]
    },

    wind: {
        johny: [
            "Za moich czasów wiało wolniej 👴🌬️",
            "Okulary poleciały. Znowu 🤓💨",
            "To nie porażka, to rollback 💾😖"
        ],
        deedee: [
            "O kurczę, już go nie dogonię 😩🌬️",
            "Wiatr zniszczył mi fryzurę! 💇‍♀️😤",
            "Kto zamówił halny?! 🌬️😖"
        ]
    },

    view: {
        johny: [
            "Widzę wszystko. Bez okularów 🤓🔭",
            "Zapisuję współrzędne, trzy kopie 💾🗺️",
            "Panorama bez kompresji 📸😎"
        ],
        deedee: [
            "Widok jak z Dolomitów! 🏔️😍",
            "Zdjęcie i lecimy na lody 📸🍦",
            "Wyślę sobie stąd pocztówkę 💌🏔️"
        ]
    },

    ski: {
        johny: [
            "Akcelerator sprzętowy 🚀🎿",
            "Kiedyś jeździłem na desce. Kiedyś ⛷️👴",
            "Trzy pola. Wydajność nerdowska 🎿🤓"
        ],
        deedee: [
            "Zjazd! Prawie jak na SUP-ie 🏄‍♀️😆",
            "Szybciej niż na żużlu! 🏍️💨",
            "Trzymaj się, Loki! 🐕🎿"
        ]
    },

    shelter: {
        johny: [
            "Ładowanie baterii 🔋😴",
            "Kawa i gitara, reszta czeka 🎸☕",
            "Tu przynajmniej mają kabel ☎️👴"
        ],
        deedee: [
            "Kawa. Z mlekiem. Inaczej nie idę ☕🥛",
            "Pampuch i ruszamy 🍩😊",
            "Loki, łapy na kanapę! 🐕😴"
        ]
    },

    lift: {
        johny: [
            "Sprawdziłem nośność. Dwa razy 🤓🚡",
            "Trzymam się. Jestem stary, nie głupi 👴🚡",
            "Skrót w pełni zoptymalizowany 📊🚡"
        ],
        deedee: [
            "Jadę gondolą, pa pa! 🚡😘",
            "Nogi mi podziękują 🚡💅",
            "Widok z góry — pocztówka gotowa 💌🚡"
        ]
    },

    meta: {
        johny: [
            "Szczyt zdobyty. Excel się zgadzał 📊🏆",
            "Wygrałem! Gdzie moje okulary? 🤓🏆",
            "Zapisuję. Trzy kopie, jedna w chmurze 💾🏆"
        ],
        deedee: [
            "Śnieżka moja! Teraz lody 🏆🍦",
            "Wygrałam! Zatańczmy bachatę 💃🏆",
            "Pocztówka ze szczytu — do siebie 💌🏔️"
        ]
    },

    spotkanie: {
        johny: [
            "Ładnie dziś wyglądasz 😍💗",
            "Zbackupowałem ten moment 💾💗",
            "Randka na szlaku ⛰️💗"
        ],
        deedee: [
            "Zatańczysz tu ze mną? 💃💗",
            "Masz pampucha? 🍩💗",
            "Spotkanie na szlaku 🥰💗"
        ]
    },

    zwykle: {
        johny: [
            "Tempo w normie 📊",
            "Gdzie ja mam okulary 🤓",
            "Za moich czasów szło się szybciej 👴",
            "Krok po kroku 🥾",
            "Nie zmęczyłem się. Wcale ⚽"
        ],
        deedee: [
            "Idziemy dalej! 🥾",
            "Loki by tu już był 🐕",
            "Jeszcze kawałek i lody 🍦",
            "Ładnie tu 😊",
            "Buty nowe, więc dam radę 🥾💅"
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
