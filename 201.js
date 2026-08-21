const surahGrid =
    document.getElementById("surahGrid");

const surahSearch =
    document.getElementById("surahSearch");

const noSurahResult =
    document.getElementById("noSurahResult");

const surahSelect =
    document.getElementById("surahSelect");

const translatorSelect =
    document.getElementById("translatorSelect");

const showSurahButton =
    document.getElementById("showSurahButton");

const ayahList =
    document.getElementById("ayahList");

const readerSurahNumber =
    document.getElementById("readerSurahNumber");

const readerSurahName =
    document.getElementById("readerSurahName");

const readerSurahInfo =
    document.getElementById("readerSurahInfo");

const quranTools =
    document.getElementById("quranTools");

const showTranslation =
    document.getElementById("showTranslation");

const showWordMeaning =
    document.getElementById("showWordMeaning");

const darkModeButton =
    document.getElementById("darkModeButton");

const menuButton =
    document.getElementById("menuButton");

const navMenu =
    document.getElementById("navMenu");

const continueButton =
    document.getElementById("continueButton");

const verseSearch =
    document.getElementById("verseSearch");

const verseSearchButton =
    document.getElementById("verseSearchButton");

const verseResults =
    document.getElementById("verseResults");

const bookmarkList =
    document.getElementById("bookmarkList");

const bookmarkSurahButton =
    document.getElementById(
        "bookmarkSurahButton"
    );

const playAudioButton =
    document.getElementById(
        "playAudioButton"
    );

const reciterSelect =
    document.getElementById(
        "reciterSelect"
    );

const quranAudio =
    document.getElementById(
        "quranAudio"
    );

const audioPlayer =
    document.getElementById(
        "audioPlayer"
    );

const audioSurahName =
    document.getElementById(
        "audioSurahName"
    );

const audioReciterName =
    document.getElementById(
        "audioReciterName"
    );

const closeAudioButton =
    document.getElementById(
        "closeAudioButton"
    );

const toast =
    document.getElementById("toast");


let allSurahs = [];

let currentSurah = null;

let currentAyahs = [];


let bookmarks =
    JSON.parse(
        localStorage.getItem(
            "quranBookmarks"
        )
    ) || [];


/* ==================================
   نام مترجم‌ها
================================== */

const translators = {

    ansarian:
        "حسین انصاریان",

    makarem:
        "آیت‌الله مکارم شیرازی",

    fooladvand:
        "محمدمهدی فولادوند",

    elahi:
        "الهی قمشه‌ای"

};


/* ==================================
   قاری‌ها
================================== */

const reciters = {

    abdulbasit:
        "عبدالباسط عبدالصمد",

    minshawi:
        "محمد صدیق منشاوی",

    husary:
        "محمود خلیل الحصری",

    sudais:
        "عبدالرحمن السدیس"

};


/* ==================================
   نام سوره‌ها
================================== */

const persianSurahNames = [

    "فاتحه",
    "بقره",
    "آل عمران",
    "نساء",
    "مائده",
    "انعام",
    "اعراف",
    "انفال",
    "توبه",
    "یونس",
    "هود",
    "یوسف",
    "رعد",
    "ابراهیم",
    "حجر",
    "نحل",
    "اسراء",
    "کهف",
    "مریم",
    "طه",
    "انبیاء",
    "حج",
    "مؤمنون",
    "نور",
    "فرقان",
    "شعراء",
    "نمل",
    "قصص",
    "عنکبوت",
    "روم",
    "لقمان",
    "سجده",
    "احزاب",
    "سبأ",
    "فاطر",
    "یس",
    "صافات",
    "ص",
    "زمر",
    "غافر",
    "فصلت",
    "شوری",
    "زخرف",
    "دخان",
    "جاثیه",
    "احقاف",
    "محمد",
    "فتح",
    "حجرات",
    "ق",
    "ذاریات",
    "طور",
    "نجم",
    "قمر",
    "رحمن",
    "واقعه",
    "حدید",
    "مجادله",
    "حشر",
    "ممتحنه",
    "صف",
    "جمعه",
    "منافقون",
    "تغابن",
    "طلاق",
    "تحریم",
    "ملک",
    "قلم",
    "حاقه",
    "معارج",
    "نوح",
    "جن",
    "مزمل",
    "مدثر",
    "قیامت",
    "انسان",
    "مرسلات",
    "نبأ",
    "نازعات",
    "عبس",
    "تکویر",
    "انفطار",
    "مطففین",
    "انشقاق",
    "بروج",
    "طارق",
    "اعلی",
    "غاشیه",
    "فجر",
    "بلد",
    "شمس",
    "لیل",
    "ضحی",
    "شرح",
    "تین",
    "علق",
    "قدر",
    "بینه",
    "زلزال",
    "عادیات",
    "قارعه",
    "تکاثر",
    "عصر",
    "همزه",
    "فیل",
    "قریش",
    "ماعون",
    "کوثر",
    "کافرون",
    "نصر",
    "مسد",
    "اخلاص",
    "فلق",
    "ناس"

];


/* ==================================
   شماره فارسی
================================== */

function faNumber(number) {

    return new Intl.NumberFormat(
        "fa-IR"
    ).format(number);

}


/* ==================================
   پیام
================================== */

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}


/* ==================================
   دریافت لیست ۱۱۴ سوره
================================== */

async function loadSurahs() {

    try {

        const response =
            await fetch(
                "https://api.alquran.cloud/v1/surah"
            );


        const data =
            await response.json();


        allSurahs = data.data;


        renderSurahs(
            allSurahs
        );


        fillSurahSelect();

    } catch (error) {

        console.error(error);


        surahGrid.innerHTML = `

            <div class="reader-empty">

                <h3>
                    خطا در دریافت سوره‌ها
                </h3>

                <p>
                    اتصال اینترنت را بررسی کنید.
                </p>

            </div>

        `;

    }

}


/* ==================================
   نمایش سوره‌ها
================================== */

function renderSurahs(list) {

    surahGrid.innerHTML = "";


    list.forEach(
        function (surah) {

            const persianName =
                persianSurahNames[
                    surah.number - 1
                ];


            const card =
                document.createElement(
                    "button"
                );


            card.type = "button";


            card.className =
                "surah-card";


            card.innerHTML = `

                <span
                    class="surah-number">

                    ${faNumber(
                        surah.number
                    )}

                </span>


                <span
                    class="surah-name">

                    <strong>
                        ${persianName}
                    </strong>

                    <span>
                        ${surah.name}
                    </span>

                </span>


                <span>

                    ${faNumber(
                        surah.numberOfAyahs
                    )}

                    آیه

                </span>

            `;


            card.addEventListener(
                "click",
                function () {

                    surahSelect.value =
                        surah.number;


                    document
                        .getElementById(
                            "reader"
                        )
                        .scrollIntoView({

                            behavior:
                                "smooth"

                        });


                    showToast(
                        "حالا مترجم را انتخاب کنید."
                    );

                }
            );


            surahGrid.appendChild(
                card
            );

        }
    );


    noSurahResult.style.display =

        list.length === 0
            ? "block"
            : "none";

}


/* ==================================
   پر کردن لیست انتخاب سوره
================================== */

function fillSurahSelect() {

    allSurahs.forEach(
        function (surah) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                surah.number;


            option.textContent =

                faNumber(
                    surah.number
                )

                +

                " - "

                +

                persianSurahNames[
                    surah.number - 1
                ];


            surahSelect.appendChild(
                option
            );

        }
    );

}


/* ==================================
   جستجوی سوره
================================== */

surahSearch.addEventListener(
    "input",
    function () {

        const value =

            surahSearch.value
                .trim()
                .toLowerCase();


        const filtered =

            allSurahs.filter(
                function (surah) {

                    const persianName =

                        persianSurahNames[
                            surah.number - 1
                        ];


                    return (

                        persianName
                            .toLowerCase()
                            .includes(value)

                        ||

                        surah.number
                            .toString()
                            .includes(value)

                        ||

                        surah.name
                            .includes(value)

                    );

                }
            );


        renderSurahs(
            filtered
        );

    }
);


/* ==================================
   دریافت سوره و ترجمه
================================== */

async function loadSurah() {

    const surahNumber =
        Number(
            surahSelect.value
        );


    const translator =
        translatorSelect.value;


    if (!surahNumber) {

        showToast(
            "ابتدا سوره را انتخاب کنید."
        );

        return;

    }


    if (!translator) {

        showToast(
            "ابتدا مترجم را انتخاب کنید."
        );

        return;

    }


    showSurahButton.textContent =
        "در حال دریافت...";


    showSurahButton.disabled =
        true;


    try {

        /*
            متن عربی
        */

        const arabicResponse =
            await fetch(

                "https://api.alquran.cloud/v1/surah/"

                +

                surahNumber

            );


        const arabicData =
            await arabicResponse.json();


        currentSurah =
            arabicData.data;


        /*
            ترجمه
        */

        const translationResponse =
            await fetch(

                "https://api.alquran.cloud/v1/surah/"

                +

                surahNumber

                +

                "/"

                +

                getTranslationEdition(
                    translator
                )

            );


        const translationData =
            await translationResponse.json();


        const translationAyahs =
            translationData.data.ayahs;


        currentAyahs =

            currentSurah.ayahs.map(
                function (
                    ayah,
                    index
                ) {

                    return {

                        number:
                            ayah.numberInSurah,

                        arabic:
                            ayah.text,

                        translation:
                            translationAyahs[
                                index
                            ].text

                    };

                }
            );


        renderReader();


        quranTools.classList.add(
            "active"
        );


        document
            .getElementById(
                "reader"
            )
            .scrollIntoView({

                behavior:
                    "smooth"

            });


        localStorage.setItem(

            "lastQuranSurah",

            JSON.stringify({

                number:
                    surahNumber,

                translator:
                    translator

            })

        );


        showToast(
            "سوره با موفقیت نمایش داده شد."
        );

    } catch (error) {

        console.error(error);


        ayahList.innerHTML = `

            <div class="reader-empty">

                <h3>
                    دریافت سوره ناموفق بود
                </h3>

                <p>
                    اینترنت خود را بررسی کنید.
                </p>

            </div>

        `;


        showToast(
            "خطا در دریافت اطلاعات."
        );

    } finally {

        showSurahButton.textContent =
            "نمایش سوره";


        showSurahButton.disabled =
            false;

    }

}


/* ==================================
   انتخاب ترجمه
================================== */

function getTranslationEdition(
    translator
) {

    const editions = {

        ansarian:
            "fa.ansarian",

        makarem:
            "fa.makarem",

        fooladvand:
            "fa.fooladvand",

        elahi:
            "fa.elahi"

    };


    return editions[
        translator
    ];

}


/* ==================================
   نمایش سوره
================================== */

function renderReader() {

    if (!currentSurah) {

        return;

    }


    readerSurahNumber.textContent =

        "سوره "

        +

        faNumber(
            currentSurah.number
        );


    readerSurahName.textContent =

        persianSurahNames[
            currentSurah.number - 1
        ]

        +

        " | "

        +

        currentSurah.name;


    readerSurahInfo.textContent =

        currentSurah.numberOfAyahs

        +

        " آیه | "

        +

        translators[
            translatorSelect.value
        ];


    ayahList.innerHTML = "";


    currentAyahs.forEach(
        function (ayah) {

            const isSaved =

                bookmarks.some(
                    function (item) {

                        return (

                            item.surah ===
                                currentSurah.number

                            &&

                            item.ayah ===
                                ayah.number

                        );

                    }
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "ayah-card";


            card.dataset.ayah =
                ayah.number;


            card.innerHTML = `

                <div class="ayah-top">

                    <span
                        class="ayah-number">

                        ${faNumber(
                            ayah.number
                        )}

                    </span>


                    <button
                        class="bookmark-button
                        ${

                            isSaved

                                ? "saved"

                                : ""

                        }"

                        data-ayah="${ayah.number}"

                        type="button">

                        🔖

                    </button>

                </div>


                <p
                    class="ayah-text">

                    ${ayah.arabic}

                </p>


                <p
                    class="translation
                    ${

                        showTranslation.checked

                            ? ""

                            : "hidden"

                    }">

                    ${ayah.translation}

                </p>


                <div
                    class="word-meaning">

                    لغت‌نامه:
                    توضیح واژه‌های مهم این آیه
                    در نسخه بعدی اضافه می‌شود.

                </div>

            `;


            ayahList.appendChild(
                card
            );

        }
    );


    updateTranslationVisibility();

}


/* ==================================
   نمایش ترجمه
================================== */

function updateTranslationVisibility() {

    document
        .querySelectorAll(
            ".translation"
        )
        .forEach(
            function (element) {

                element.style.display =

                    showTranslation.checked

                        ? "block"

                        : "none";

            }
        );


    document
        .querySelectorAll(
            ".word-meaning"
        )
        .forEach(
            function (element) {

                element.style.display =

                    showWordMeaning.checked

                        ? "block"

                        : "none";

            }
        );

}


showTranslation.addEventListener(
    "change",
    updateTranslationVisibility
);


showWordMeaning.addEventListener(
    "change",
    updateTranslationVisibility
);


/* ==================================
   ذخیره آیه
================================== */

ayahList.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".bookmark-button"
            );


        if (!button) {

            return;

        }


        const ayahNumber =
            Number(
                button.dataset.ayah
            );


        const index =
            bookmarks.findIndex(
                function (item) {

                    return (

                        item.surah ===
                            currentSurah.number

                        &&

                        item.ayah ===
                            ayahNumber

                    );

                }
            );


        if (index >= 0) {

            bookmarks.splice(
                index,
                1
            );


            showToast(
                "نشان‌گذاری حذف شد."
            );

        } else {

            const ayah =

                currentAyahs.find(
                    function (item) {

                        return (

                            item.number ===
                                ayahNumber

                        );

                    }
                );


            bookmarks.push({

                surah:
                    currentSurah.number,

                surahName:
                    persianSurahNames[
                        currentSurah.number - 1
                    ],

                ayah:
                    ayahNumber,

                text:
                    ayah.arabic

            });


            showToast(
                "آیه نشان‌گذاری شد."
            );

        }


        localStorage.setItem(

            "quranBookmarks",

            JSON.stringify(
                bookmarks
            )

        );


        renderBookmarks();


        renderReader();

    }
);


/* ==================================
   نمایش نشان‌شده‌ها
================================== */

function renderBookmarks() {

    bookmarkList.innerHTML = "";


    if (bookmarks.length === 0) {

        bookmarkList.innerHTML = `

            <div
                class="empty-bookmark">

                هنوز آیه‌ای
                نشان‌گذاری نشده است.

            </div>

        `;


        return;

    }


    bookmarks.forEach(
        function (
            bookmark,
            index
        ) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "bookmark-item";


            item.innerHTML = `

                <div>

                    <strong>

                        ${bookmark.surahName}

                        -

                        آیه

                        ${faNumber(
                            bookmark.ayah
                        )}

                    </strong>


                    <p>

                        ${bookmark.text}

                    </p>

                </div>


                <button
                    data-index="${index}">

                    حذف

                </button>

            `;


            bookmarkList.appendChild(
                item
            );

        }
    );

}


bookmarkList.addEventListener(
    "click",
    function (event) {

        const index =
            event.target.dataset.index;


        if (
            index === undefined
        ) {

            return;

        }


        bookmarks.splice(
            index,
            1
        );


        localStorage.setItem(

            "quranBookmarks",

            JSON.stringify(
                bookmarks
            )

        );


        renderBookmarks();


        if (currentSurah) {

            renderReader();

        }

    }
);


/* ==================================
   نشان‌گذاری کل سوره
================================== */

bookmarkSurahButton.addEventListener(
    "click",
    function () {

        if (!currentSurah) {

            showToast(
                "ابتدا یک سوره انتخاب کنید."
            );

            return;

        }


        document
            .getElementById(
                "reader"
            )
            .scrollIntoView({

                behavior:
                    "smooth"

            });


        showToast(
            "برای نشان‌گذاری، روی 🔖 کنار هر آیه بزنید."
        );

    }
);


/* ==================================
   ادامه مطالعه
================================== */

continueButton.addEventListener(
    "click",
    function () {

        const last =
            JSON.parse(
                localStorage.getItem(
                    "lastQuranSurah"
                )
            );


        if (!last) {

            showToast(
                "هنوز سوره‌ای مطالعه نکرده‌اید."
            );

            return;

        }


        surahSelect.value =
            last.number;


        translatorSelect.value =
            last.translator;


        loadSurah();

    }
);


/* ==================================
   جستجوی آیه
================================== */

verseSearchButton.addEventListener(
    "click",
    searchVerses
);


verseSearch.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            searchVerses();

        }

    }
);


function searchVerses() {

    const query =
        verseSearch.value
            .trim();


    if (!query) {

        showToast(
            "کلمه موردنظر را وارد کنید."
        );

        return;

    }


    verseResults.innerHTML = `

        <div class="reader-empty">

            در حال جستجو...

        </div>

    `;


    const results = [];


    currentAyahs.forEach(
        function (ayah) {

            if (

                ayah.arabic
                    .includes(query)

                ||

                ayah.translation
                    .includes(query)

            ) {

                results.push(
                    ayah
                );

            }

        }
    );


    if (results.length === 0) {

        verseResults.innerHTML = `

            <div class="reader-empty">

                نتیجه‌ای پیدا نشد.

                <br>

                برای جستجوی دقیق،
                ابتدا سوره موردنظر را
                انتخاب و نمایش دهید.

            </div>

        `;


        return;

    }


    verseResults.innerHTML = "";


    results.forEach(
        function (ayah) {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "verse-result-card";


            item.innerHTML = `

                <strong>

                    سوره

                    ${currentSurah.name}

                    -

                    آیه

                    ${faNumber(
                        ayah.number
                    )}

                </strong>


                <p>

                    ${ayah.arabic}

                </p>


                <div
                    class="translation">

                    ${ayah.translation}

                </div>

            `;


            verseResults.appendChild(
                item
            );

        }
    );

}


/* ==================================
   حالت شب
================================== */

darkModeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark"
        );


        const isDark =

            document.body.classList.contains(
                "dark"
            );


        darkModeButton.textContent =

            isDark

                ? "☀️"

                : "🌙";


        localStorage.setItem(

            "quranDarkMode",

            isDark

        );

    }
);


/* ==================================
   ذخیره حالت شب
================================== */

if (

    localStorage.getItem(
        "quranDarkMode"
    ) === "true"

) {

    document.body.classList.add(
        "dark"
    );


    darkModeButton.textContent =
        "☀️";

}


/* ==================================
   منوی موبایل
================================== */

menuButton.addEventListener(
    "click",
    function () {

        navMenu.classList.toggle(
            "active"
        );

    }
);


navMenu
    .querySelectorAll("a")
    .forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    navMenu.classList.remove(
                        "active"
                    );

                }
            );

        }
    );


/* ==================================
   صوت
================================== */

playAudioButton.addEventListener(
    "click",
    function () {

        if (!currentSurah) {

            showToast(
                "ابتدا یک سوره را انتخاب کنید."
            );

            return;

        }


        const reciter =
            reciterSelect.value;


        const reciterName =
            reciters[
                reciter
            ];


        audioSurahName.textContent =

            "سوره "

            +

            persianSurahNames[
                currentSurah.number - 1
            ];


        audioReciterName.textContent =
            reciterName;


        /*
            فعلاً ساختار صوت آماده است.
            لینک صوت باید براساس API
            انتخابی قاری اضافه شود.
        */

        audioPlayer.classList.add(
            "active"
        );


        showToast(
            "پخش‌کننده صوت آماده است."
        );

    }
);


closeAudioButton.addEventListener(
    "click",
    function () {

        quranAudio.pause();

        audioPlayer.classList.remove(
            "active"
        );

    }
);


/* ==================================
   دکمه نمایش سوره
================================== */

showSurahButton.addEventListener(
    "click",
    loadSurah
);


/* ==================================
   شروع سایت
================================== */

loadSurahs();

renderBookmarks();
