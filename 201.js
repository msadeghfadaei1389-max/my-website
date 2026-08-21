"use strict";

// ==========================================
// تنظیمات API
// ==========================================

const API = "https://api.alquran.cloud/v1";

const DEFAULT_RECITER = "ar.alafasy";
const DEFAULT_TRANSLATION = "fa.makarem";


// ==========================================
// اطلاعات قاری‌ها
// ==========================================

const RECITERS = [
    {
        id: "ar.alafasy",
        name: "مشاری راشد العفاسی"
    },

    {
        id: "ar.abdulbasitmurattal",
        name: "عبدالباسط عبدالصمد"
    },

    {
        id: "ar.husary",
        name: "محمود خلیل الحصری"
    },

    {
        id: "ar.minshawi",
        name: "محمد صدیق المنشاوی"
    },

    {
        id: "ar.sudais",
        name: "عبدالرحمن السدیس"
    },

    {
        id: "ar.hudhaify",
        name: "علی الحذیفی"
    }
];


// ==========================================
// مترجم‌ها
// ==========================================

const TRANSLATIONS = [
    {
        id: "",
        name: "بدون ترجمه"
    },

    {
        id: "fa.makarem",
        name: "آیت‌الله مکارم شیرازی"
    },

    {
        id: "fa.ansarian",
        name: "حسین انصاریان"
    },

    {
        id: "fa.ayati",
        name: "عبدالمحمد آیتی"
    },

    {
        id: "fa.fooladvand",
        name: "محمدمهدی فولادوند"
    }
];


// ==========================================
// عناصر صفحه
// ==========================================

const $ = selector =>
    document.querySelector(selector);


const $$ = selector =>
    [...document.querySelectorAll(selector)];


// هدر و اصلی

const nav =
    $("#nav");

const themeButton =
    $("#themeButton");

const menuButton =
    $("#menuButton");

const searchInput =
    $("#searchInput");

const continueButton =
    $("#continueButton");

const randomButton =
    $("#randomButton");

const openSearchButton =
    $("#openSearchButton");


// سوره‌ها

const surahGrid =
    $("#surahGrid");

const surahCount =
    $("#surahCount");

const noResults =
    $("#noResults");


// نشان‌شده‌ها

const bookmarkList =
    $("#bookmarkList");

const clearBookmarks =
    $("#clearBookmarks");


// مودال سوره

const surahModal =
    $("#surahModal");

const closeSurah =
    $("#closeSurah");

const modalSurahNumber =
    $("#modalSurahNumber");

const modalSurahName =
    $("#modalSurahName");

const modalSurahInfo =
    $("#modalSurahInfo");

const translationSelect =
    $("#translationSelect");

const reciterSelect =
    $("#reciterSelect");

const audioStatus =
    $("#audioStatus");

const previousAyahButton =
    $("#previousAyahButton");

const surahAudioButton =
    $("#surahAudioButton");

const stopAudioButton =
    $("#stopAudioButton");

const nextAyahButton =
    $("#nextAyahButton");

const surahLoading =
    $("#surahLoading");

const ayahContainer =
    $("#ayahContainer");

const quranAudio =
    $("#quranAudio");


// جستجو

const searchModal =
    $("#searchModal");

const closeSearch =
    $("#closeSearch");

const searchTabs =
    $$(".search-tab");

const ayahSearchInput =
    $("#ayahSearchInput");

const ayahSearchButton =
    $("#ayahSearchButton");

const searchHint =
    $("#searchHint");

const searchLoading =
    $("#searchLoading");

const searchResults =
    $("#searchResults");


// ادامه مطالعه

const continueModal =
    $("#continueModal");

const closeContinue =
    $("#closeContinue");

const continueText =
    $("#continueText");

const openContinue =
    $("#openContinue");


// پیام

const toast =
    $("#toast");


// ==========================================
// وضعیت برنامه
// ==========================================

let surahs = [];

let currentSurah = null;

let currentAyahs = [];

let currentTranslations = [];

let currentAyahIndex = 0;

let currentSearchMode = "smart";

let isPlaying = false;

let shouldContinue = false;

let toastTimer = null;


let bookmarks = loadStorage(
    "quranBookmarks",
    []
);


let lastRead = loadStorage(
    "quranLastRead",
    null
);


let savedTheme =
    localStorage.getItem(
        "quranTheme"
    ) || "light";


// ==========================================
// ذخیره امن LocalStorage
// ==========================================

function loadStorage(
    key,
    fallback
) {

    try {

        const value =
            localStorage.getItem(key);


        return value
            ? JSON.parse(value)
            : fallback;

    }

    catch (error) {

        console.error(
            "Storage error:",
            error
        );

        return fallback;

    }

}


function saveStorage(
    key,
    value
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    }

    catch (error) {

        console.error(
            "Storage save error:",
            error
        );

    }

}


// ==========================================
// تبدیل اعداد
// ==========================================

function toPersianNumber(value) {

    const digits =
        "۰۱۲۳۴۵۶۷۸۹";


    return String(value).replace(
        /\d/g,
        digit => digits[digit]
    );

}


function toEnglishDigits(value) {

    const persian =
        "۰۱۲۳۴۵۶۷۸۹";

    const arabic =
        "٠١٢٣٤٥٦٧٨٩";


    return String(value)

        .replace(
            /[۰-۹]/g,
            digit =>
                persian.indexOf(digit)
        )

        .replace(
            /[٠-٩]/g,
            digit =>
                arabic.indexOf(digit)
        );

}


// ==========================================
// نرمال‌سازی فارسی و عربی
// ==========================================

function normalizeText(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    return toEnglishDigits(text)

        .toString()

        .trim()

        .toLowerCase()

        // حذف حرکات و اعراب
        .replace(
            /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,
            ""
        )

        // یکسان کردن حروف عربی و فارسی
        .replace(/[يى]/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/[ةۀ]/g, "ه")
        .replace(/ؤ/g, "و")
        .replace(/[أإٱ]/g, "ا")

        // فاصله‌های تکراری
        .replace(/\s+/g, " ")

        .trim();

}


// ==========================================
// جلوگیری از HTML Injection
// ==========================================

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// نمایش پیام
// ==========================================

function showToast(message) {

    if (!toast) return;


    clearTimeout(
        toastTimer
    );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3000);

}


// ==========================================
// مدیریت حالت شب
// ==========================================

function applyTheme(theme) {

    document.body.classList.toggle(
        "dark",
        theme === "dark"
    );


    if (themeButton) {

        themeButton.textContent =
            theme === "dark"
                ? "☀️"
                : "🌙";

    }

}


function toggleTheme() {

    savedTheme =
        savedTheme === "dark"
            ? "light"
            : "dark";


    localStorage.setItem(
        "quranTheme",
        savedTheme
    );


    applyTheme(
        savedTheme
    );

}


// ==========================================
// مودال‌ها
// ==========================================

function openModal(modal) {

    modal?.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


function closeModal(modal) {

    modal?.classList.remove(
        "show"
    );


    const hasOpenModal =
        $$(".modal.show").length > 0;


    if (!hasOpenModal) {

        document.body.style.overflow =
            "";

    }

}


// ==========================================
// پر کردن انتخاب مترجم
// ==========================================

function setupTranslations() {

    if (!translationSelect) return;


    const savedTranslation =
        localStorage.getItem(
            "quranTranslation"
        ) || DEFAULT_TRANSLATION;


    translationSelect.innerHTML =
        TRANSLATIONS.map(
            translation => `

                <option
                    value="${translation.id}"
                >
                    ${translation.name}
                </option>

            `
        ).join("");


    const exists =
        TRANSLATIONS.some(
            item =>
                item.id ===
                savedTranslation
        );


    translationSelect.value =
        exists
            ? savedTranslation
            : DEFAULT_TRANSLATION;

}


// ==========================================
// پر کردن انتخاب قاری
// ==========================================

function setupReciters() {

    if (!reciterSelect) return;


    const savedReciter =
        localStorage.getItem(
            "quranReciter"
        ) || DEFAULT_RECITER;


    reciterSelect.innerHTML =
        RECITERS.map(
            reciter => `

                <option
                    value="${reciter.id}"
                >
                    ${reciter.name}
                </option>

            `
        ).join("");


    const exists =
        RECITERS.some(
            item =>
                item.id ===
                savedReciter
        );


    reciterSelect.value =
        exists
            ? savedReciter
            : DEFAULT_RECITER;

}


// ==========================================
// دریافت فهرست سوره‌ها
// ==========================================

async function loadSurahs() {

    try {

        if (surahCount) {

            surahCount.textContent =
                "در حال بارگذاری";

        }


        const response =
            await fetch(
                `${API}/surah`
            );


        if (!response.ok) {

            throw new Error(
                "خطا در دریافت سوره‌ها"
            );

        }


        const result =
            await response.json();


        if (
            !result.data ||
            !Array.isArray(result.data)
        ) {

            throw new Error(
                "اطلاعات سوره‌ها نامعتبر است"
            );

        }


        surahs =
            result.data;


        renderSurahs(
            surahs
        );

    }

    catch (error) {

        console.error(error);


        if (surahCount) {

            surahCount.textContent =
                "خطا";

        }


        if (surahGrid) {

            surahGrid.innerHTML = `

                <div class="empty-message">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        دریافت سوره‌ها انجام نشد
                    </h3>

                    <p>
                        اینترنت را بررسی کنید و دوباره تلاش کنید.
                    </p>

                </div>

            `;

        }

    }

}


// ==========================================
// نمایش سوره‌ها
// ==========================================

function renderSurahs(list) {

    if (!surahGrid) return;


    surahGrid.innerHTML =
        "";


    if (surahCount) {

        surahCount.textContent =
            `${toPersianNumber(
                list.length
            )} سوره`;

    }


    if (!list.length) {

        noResults?.classList.remove(
            "hidden"
        );

        return;

    }


    noResults?.classList.add(
        "hidden"
    );


    list.forEach(surah => {

        const card =
            document.createElement(
                "button"
            );


        card.type =
            "button";


        card.className =
            "surah-card";


        card.innerHTML = `

            <span
                class="surah-card-number"
            >
                ${toPersianNumber(
                    surah.number
                )}
            </span>

            <div
                class="surah-card-info"
            >

                <strong>
                    ${escapeHTML(
                        surah.name
                    )}
                </strong>

                <small>
                    ${escapeHTML(
                        surah.englishName
                    )}
                </small>

            </div>

            <span
                class="surah-card-ayats"
            >
                ${toPersianNumber(
                    surah.numberOfAyahs
                )}
                آیه
            </span>

        `;


        card.addEventListener(
            "click",
            () => {

                openSurah(
                    surah.number
                );

            }
        );


        surahGrid.appendChild(
            card
        );

    });

}


// ==========================================
// نام‌های جایگزین سوره
// ==========================================

function getSurahAliases(number) {

    const aliases = {

        1: [
            "فاتحه",
            "حمد"
        ],

        2: [
            "بقره"
        ],

        3: [
            "آل عمران",
            "ال عمران"
        ],

        4: [
            "نساء",
            "نسا"
        ],

        5: [
            "مائده",
            "مایده"
        ],

        6: [
            "انعام"
        ],

        7: [
            "اعراف"
        ],

        8: [
            "انفال"
        ],

        9: [
            "توبه",
            "برائت"
        ],

        10: [
            "یونس"
        ],

        11: [
            "هود"
        ],

        12: [
            "یوسف"
        ],

        13: [
            "رعد"
        ],

        14: [
            "ابراهیم"
        ],

        15: [
            "حجر"
        ],

        16: [
            "نحل"
        ],

        17: [
            "اسراء",
            "بنی اسرائیل",
            "بنی اسراییل"
        ],

        18: [
            "کهف"
        ],

        19: [
            "مریم"
        ],

        20: [
            "طه",
            "طاه"
        ],

        21: [
            "انبیاء",
            "انبیا"
        ],

        36: [
            "یس",
            "یسین",
            "یاسین",
            "ياسين"
        ],

        55: [
            "الرحمن",
            "رحمن"
        ],

        56: [
            "واقعه"
        ],

        67: [
            "ملک",
            "تبارک"
        ],

        78: [
            "نبأ",
            "نبا"
        ],

        97: [
            "قدر"
        ],

        112: [
            "اخلاص",
            "توحید"
        ],

        113: [
            "فلق"
        ],

        114: [
            "ناس"
        ]

    };


    return aliases[number] || [];

}


// ==========================================
// جستجوی سوره
// ==========================================

function searchSurahs(query) {

    const normalized =
        normalizeText(query);


    const cleanQuery =
        normalized
            .replace(
                /^(سوره|سورت)\s*/g,
                ""
            )
            .trim();


    if (!cleanQuery) {

        renderSurahs(
            surahs
        );

        return;

    }


    const results =
        surahs.filter(surah => {

            const name =
                normalizeText(
                    surah.name
                );


            const englishName =
                normalizeText(
                    surah.englishName
                );


            const number =
                String(
                    surah.number
                );


            const aliases =
                getSurahAliases(
                    surah.number
                ).map(
                    normalizeText
                );


            return (

                name.includes(
                    cleanQuery
                )

                ||

                englishName.includes(
                    cleanQuery
                )

                ||

                aliases.some(
                    alias =>
                        alias.includes(
                            cleanQuery
                        )
                )

                ||

                number ===
                    cleanQuery

                ||

                (
                    cleanQuery.length > 1
                    &&
                    number.includes(
                        cleanQuery
                    )
                )

            );

        });


    renderSurahs(
        results
    );

}


// ==========================================
// دریافت آیات
// ==========================================

async function fetchEdition(
    surahNumber,
    edition
) {

    const response =
        await fetch(
            `${API}/surah/${surahNumber}/${edition}`
        );


    if (!response.ok) {

        throw new Error(
            "خطا در دریافت اطلاعات"
        );

    }


    const result =
        await response.json();


    if (
        !result.data ||
        !Array.isArray(
            result.data.ayahs
        )
    ) {

        throw new Error(
            "اطلاعات دریافت نشد"
        );

    }


    return result.data;

}


// ==========================================
// باز کردن سوره
// ==========================================

async function openSurah(number) {

    try {

        stopAudio();


        currentSurah =
            Number(number);


        currentAyahIndex =
            0;


        currentAyahs =
            [];


        currentTranslations =
            [];


        openModal(
            surahModal
        );


        ayahContainer.innerHTML =
            "";


        surahLoading?.classList.remove(
            "hidden"
        );


        const surahInfo =
            surahs.find(
                item =>
                    item.number ===
                    currentSurah
            );


        if (surahInfo) {

            modalSurahNumber.textContent =
                toPersianNumber(
                    surahInfo.number
                );


            modalSurahName.textContent =
                surahInfo.name;


            modalSurahInfo.textContent =
                `${toPersianNumber(
                    surahInfo.numberOfAyahs
                )} آیه • ${
                    surahInfo.revelationType ===
                    "Meccan"
                        ? "مکی"
                        : "مدنی"
                }`;

        }


        const reciter =
            reciterSelect?.value ||
            DEFAULT_RECITER;


        const quranData =
            await fetchEdition(
                currentSurah,
                reciter
            );


        currentAyahs =
            quranData.ayahs;


        await loadCurrentTranslation();


        renderAyahs();


        surahLoading?.classList.add(
            "hidden"
        );


        const targetAyah =
            lastRead &&
            Number(lastRead.surah) ===
            currentSurah
                ? Number(lastRead.ayah)
                : 1;


        const index =
            Math.max(
                0,
                currentAyahs.findIndex(
                    ayah =>
                        ayah.numberInSurah ===
                        targetAyah
                )
            );


        currentAyahIndex =
            index;


        setTimeout(() => {

            const element =
                document.getElementById(
                    `ayah-${targetAyah}`
                );


            element?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }, 300);


        updateAudioStatus();

    }

    catch (error) {

        console.error(error);


        surahLoading?.classList.add(
            "hidden"
        );


        ayahContainer.innerHTML = `

            <div class="empty-message">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    دریافت سوره انجام نشد
                </h3>

                <p>
                    اتصال اینترنت یا سرویس دریافت قرآن را بررسی کنید.
                </p>

            </div>

        `;


        showToast(
            "خطا در دریافت سوره"
        );

    }

}


// ==========================================
// دریافت ترجمه
// ==========================================

async function loadCurrentTranslation() {

    const translation =
        translationSelect?.value ||
        "";


    currentTranslations =
        [];


    if (
        !translation ||
        translation === "loading"
    ) {

        return;

    }


    try {

        const translationData =
            await fetchEdition(
                currentSurah,
                translation
            );


        currentTranslations =
            translationData.ayahs;

    }

    catch (error) {

        console.error(
            "Translation error:",
            error
        );


        showToast(
            "ترجمه انتخاب‌شده دریافت نشد"
        );

    }

}


// ==========================================
// نمایش آیات
// ==========================================

function renderAyahs() {

    ayahContainer.innerHTML =
        "";


    currentAyahs.forEach(
        (
            ayah,
            index
        ) => {

            const translation =
                currentTranslations[index]?.text ||
                "";


            const isBookmarked =
                bookmarks.some(
                    item =>
                        Number(item.surah) ===
                        Number(
                            ayah.surah.number
                        )

                        &&

                        Number(item.ayah) ===
                        Number(
                            ayah.numberInSurah
                        )
                );


            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "ayah-card";


            article.id =
                `ayah-${ayah.numberInSurah}`;


            article.innerHTML = `

                <div class="ayah-top">

                    <span
                        class="ayah-number"
                    >
                        ${toPersianNumber(
                            ayah.numberInSurah
                        )}
                    </span>

                    <div
                        class="ayah-actions"
                    >

                        <button
                            class="ayah-play"
                            type="button"
                            title="پخش آیه"
                        >
                            ▶
                        </button>

                        <button
                            class="ayah-bookmark"
                            type="button"
                            title="نشان‌گذاری"
                        >
                            ${
                                isBookmarked
                                    ? "🔖"
                                    : "🔗"
                            }
                        </button>

                    </div>

                </div>

                <p
                    class="ayah-arabic"
                >
                    ${escapeHTML(
                        ayah.text
                    )}
                </p>

                ${
                    translation
                        ? `
                            <p
                                class="ayah-translation"
                            >
                                ${escapeHTML(
                                    translation
                                )}
                            </p>
                        `
                        : ""
                }

                <div
                    class="ayah-source"
                >
                    سوره
                    ${escapeHTML(
                        ayah.surah.name
                    )}

                    • آیه

                    ${toPersianNumber(
                        ayah.numberInSurah
                    )}
                </div>

            `;


            const playButton =
                article.querySelector(
                    ".ayah-play"
                );


            playButton.addEventListener(
                "click",
                () => {

                    currentAyahIndex =
                        index;


                    shouldContinue =
                        false;


                    if (
                        isPlaying &&
                        currentAudioMatches(
                            ayah.audio
                        )
                    ) {

                        pauseAudio();

                    }

                    else {

                        playCurrentAyah(
                            false
                        );

                    }

                }
            );


            const bookmarkButton =
                article.querySelector(
                    ".ayah-bookmark"
                );


            bookmarkButton.addEventListener(
                "click",
                () => {

                    toggleBookmark(
                        ayah
                    );

                }
            );


            article.addEventListener(
                "click",
                event => {

                    if (
                        event.target.closest(
                            "button"
                        )
                    ) {

                        return;

                    }


                    currentAyahIndex =
                        index;


                    saveLastRead(
                        ayah
                    );


                    updateActiveAyah();

                }
            );


            ayahContainer.appendChild(
                article
            );

        }
    );


    updateActiveAyah();

}


// ==========================================
// فعال کردن آیه در حال پخش
// ==========================================

function updateActiveAyah() {

    $$(".ayah-card").forEach(
        card => {

            card.classList.remove(
                "playing"
            );

        }
    );


    $$(".ayah-play").forEach(
        button => {

            button.textContent =
                "▶";

        }
    );


    const ayah =
        currentAyahs[
            currentAyahIndex
        ];


    if (!ayah) return;


    const card =
        document.getElementById(
            `ayah-${ayah.numberInSurah}`
        );


    if (
        card &&
        isPlaying
    ) {

        card.classList.add(
            "playing"
        );


        card.querySelector(
            ".ayah-play"
        ).textContent =
            "⏸";

    }

}


// ==========================================
// ذخیره آخرین مطالعه
// ==========================================

function saveLastRead(ayah) {

    if (!ayah) return;


    lastRead = {

        surah:
            ayah.surah.number,

        ayah:
            ayah.numberInSurah,

        name:
            ayah.surah.name

    };


    saveStorage(
        "quranLastRead",
        lastRead
    );

}


// ==========================================
// بررسی صوت فعلی
// ==========================================

function currentAudioMatches(url) {

    if (
        !quranAudio ||
        !quranAudio.src
    ) {

        return false;

    }


    return quranAudio.src ===
        new URL(
            url,
            window.location.href
        ).href;

}


// ==========================================
// پخش آیه فعلی
// ==========================================

async function playCurrentAyah(
    continueAfter = false
) {

    const ayah =
        currentAyahs[
            currentAyahIndex
        ];


    if (!ayah) {

        return;

    }


    if (!ayah.audio) {

        showToast(
            "فایل صوتی این قاری دریافت نشد"
        );

        return;

    }


    shouldContinue =
        continueAfter;


    saveLastRead(
        ayah
    );


    try {

        if (
            !currentAudioMatches(
                ayah.audio
            )
        ) {

            quranAudio.src =
                ayah.audio;

        }


        await quranAudio.play();


        isPlaying =
            true;


        updateAudioUI();

        updateActiveAyah();

        updateAudioStatus();

    }

    catch (error) {

        console.error(
            "Audio error:",
            error
        );


        isPlaying =
            false;


        updateAudioUI();


        showToast(
            "پخش صوت انجام نشد"
        );

    }

}


// ==========================================
// پخش یا توقف دکمه اصلی
// ==========================================

function toggleSurahPlayback() {

    if (!currentAyahs.length) {

        showToast(
            "ابتدا یک سوره را باز کنید"
        );

        return;

    }


    if (isPlaying) {

        pauseAudio();

        return;

    }


    shouldContinue =
        true;


    playCurrentAyah(
        true
    );

}


// ==========================================
// مکث صوت
// ==========================================

function pauseAudio() {

    if (!quranAudio) return;


    quranAudio.pause();


    isPlaying =
        false;


    updateAudioUI();

    updateActiveAyah();

    updateAudioStatus(
        "پخش متوقف شده است."
    );

}


// ==========================================
// توقف کامل
// ==========================================

function stopAudio() {

    if (!quranAudio) return;


    quranAudio.pause();


    try {

        quranAudio.currentTime =
            0;

    }

    catch (error) {

        // خطای احتمالی مرورگر
    }


    quranAudio.removeAttribute(
        "src"
    );


    quranAudio.load();


    isPlaying =
        false;


    shouldContinue =
        false;


    updateAudioUI();

    updateActiveAyah();

    updateAudioStatus(
        "برای شروع، دکمه پخش را بزنید."
    );

}


// ==========================================
// آیه بعد
// ==========================================

function playNextAyah(
    autoPlay = true
) {

    if (!currentAyahs.length) return;


    if (
        currentAyahIndex <
        currentAyahs.length - 1
    ) {

        currentAyahIndex++;


        updateActiveAyah();

        scrollToCurrentAyah();


        if (autoPlay) {

            playCurrentAyah(
                shouldContinue
            );

        }

    }

    else {

        stopAudio();


        showToast(
            "پخش سوره به پایان رسید"
        );

    }

}


// ==========================================
// آیه قبل
// ==========================================

function playPreviousAyah() {

    if (!currentAyahs.length) return;


    if (
        currentAyahIndex > 0
    ) {

        currentAyahIndex--;


        updateActiveAyah();

        scrollToCurrentAyah();


        if (isPlaying) {

            playCurrentAyah(
                shouldContinue
            );

        }

        else {

            updateAudioStatus();

        }

    }

}


// ==========================================
// اسکرول به آیه فعلی
// ==========================================

function scrollToCurrentAyah() {

    const ayah =
        currentAyahs[
            currentAyahIndex
        ];


    if (!ayah) return;


    const element =
        document.getElementById(
            `ayah-${ayah.numberInSurah}`
        );


    element?.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}


// ==========================================
// رابط صوت
// ==========================================

function updateAudioUI() {

    if (!surahAudioButton) return;


    if (isPlaying) {

        surahAudioButton.textContent =
            "⏸ مکث";

    }

    else {

        surahAudioButton.textContent =
            "▶ پخش";

    }

}


function updateAudioStatus(
    customText = ""
) {

    if (!audioStatus) return;


    if (customText) {

        audioStatus.textContent =
            customText;

        return;

    }


    const ayah =
        currentAyahs[
            currentAyahIndex
        ];


    if (!ayah) {

        audioStatus.textContent =
            "برای شروع، دکمه پخش را بزنید.";

        return;

    }


    const reciter =
        RECITERS.find(
            item =>
                item.id ===
                reciterSelect?.value
        );


    audioStatus.textContent =
        `آیه ${toPersianNumber(
            ayah.numberInSurah
        )} از ${toPersianNumber(
            currentAyahs.length
        )} • ${
            reciter?.name ||
            "قاری انتخاب‌شده"
        }`;

}


// ==========================================
// رویداد پایان صوت
// ==========================================

quranAudio?.addEventListener(
    "ended",
    () => {

        isPlaying =
            false;


        updateActiveAyah();


        if (
            shouldContinue
        ) {

            if (
                currentAyahIndex <
                currentAyahs.length - 1
            ) {

                currentAyahIndex++;


                playCurrentAyah(
                    true
                );

            }

            else {

                stopAudio();


                showToast(
                    "تلاوت سوره پایان یافت"
                );

            }

        }

        else {

            updateAudioUI();

            updateAudioStatus();

        }

    }
);


// ==========================================
// خطای صوت
// ==========================================

quranAudio?.addEventListener(
    "error",
    () => {

        if (
            quranAudio.error
        ) {

            console.error(
                "Audio error:",
                quranAudio.error
            );

        }


        isPlaying =
            false;


        shouldContinue =
            false;


        updateAudioUI();

        updateActiveAyah();


        showToast(
            "فایل صوتی قاری قابل پخش نیست"
        );

    }
);


// ==========================================
// زمان در حال پخش
// ==========================================

quranAudio?.addEventListener(
    "play",
    () => {

        isPlaying =
            true;


        updateAudioUI();

        updateActiveAyah();

    }
);


quranAudio?.addEventListener(
    "pause",
    () => {

        if (
            !quranAudio.ended
        ) {

            isPlaying =
                false;

        }


        updateAudioUI();

        updateActiveAyah();

    }
);


// ==========================================
// تغییر قاری
// ==========================================

reciterSelect?.addEventListener(
    "change",
    async () => {

        const newReciter =
            reciterSelect.value;


        localStorage.setItem(
            "quranReciter",
            newReciter
        );


        if (!currentSurah) {

            showToast(
                "قاری جدید انتخاب شد"
            );

            return;

        }


        stopAudio();


        try {

            showToast(
                "در حال تغییر قاری..."
            );


            const data =
                await fetchEdition(
                    currentSurah,
                    newReciter
                );


            currentAyahs =
                data.ayahs;


            renderAyahs();


            updateAudioStatus();


            showToast(
                "قاری تغییر کرد"
            );

        }

        catch (error) {

            console.error(error);


            showToast(
                "دریافت صوت این قاری انجام نشد"
            );

        }

    }
);


// ==========================================
// تغییر مترجم
// ==========================================

translationSelect?.addEventListener(
    "change",
    async () => {

        const selected =
            translationSelect.value;


        localStorage.setItem(
            "quranTranslation",
            selected
        );


        if (!currentSurah) return;


        try {

            showToast(
                "در حال تغییر ترجمه..."
            );


            await loadCurrentTranslation();


            renderAyahs();


            showToast(
                "ترجمه تغییر کرد"
            );

        }

        catch (error) {

            console.error(error);

        }

    }
);


// ==========================================
// نشان‌گذاری
// ==========================================

function toggleBookmark(ayah) {

    const index =
        bookmarks.findIndex(
            item =>
                Number(item.surah) ===
                Number(
                    ayah.surah.number
                )

                &&

                Number(item.ayah) ===
                Number(
                    ayah.numberInSurah
                )
        );


    if (index >= 0) {

        bookmarks.splice(
            index,
            1
        );


        showToast(
            "نشان‌گذاری حذف شد"
        );

    }

    else {

        bookmarks.unshift({

            surah:
                ayah.surah.number,

            ayah:
                ayah.numberInSurah,

            name:
                ayah.surah.name,

            text:
                ayah.text

        });


        showToast(
            "آیه ذخیره شد"
        );

    }


    saveStorage(
        "quranBookmarks",
        bookmarks
    );


    renderBookmarks();

    renderAyahs();

}


// ==========================================
// نمایش نشان‌شده‌ها
// ==========================================

function renderBookmarks() {

    if (!bookmarkList) return;


    if (!bookmarks.length) {

        bookmarkList.innerHTML = `

            <div class="empty-message">

                <div class="empty-icon">
                    🔖
                </div>

                <h3>
                    هنوز آیه‌ای ذخیره نشده است
                </h3>

                <p>
                    برای ذخیره، روی دکمه نشان‌گذاری آیه بزنید.
                </p>

            </div>

        `;

        return;

    }


    bookmarkList.innerHTML =
        "";


    bookmarks.forEach(item => {

        const card =
            document.createElement(
                "button"
            );


        card.type =
            "button";


        card.className =
            "bookmark-card";


        card.innerHTML = `

            <span>
                ${escapeHTML(
                    item.text
                )}
            </span>

            <small>

                سوره
                ${escapeHTML(
                    item.name
                )}

                • آیه

                ${toPersianNumber(
                    item.ayah
                )}

            </small>

        `;


        card.addEventListener(
            "click",
            () => {

                lastRead =
                    item;


                saveStorage(
                    "quranLastRead",
                    lastRead
                );


                openSurah(
                    item.surah
                );

            }
        );


        bookmarkList.appendChild(
            card
        );

    });

}


// ==========================================
// حذف همه نشان‌گذاری‌ها
// ==========================================

clearBookmarks?.addEventListener(
    "click",
    () => {

        if (!bookmarks.length) {

            showToast(
                "نشان‌گذاری‌ای وجود ندارد"
            );

            return;

        }


        const confirmed =
            confirm(
                "همه آیات نشان‌شده حذف شوند؟"
            );


        if (!confirmed) return;


        bookmarks =
            [];


        saveStorage(
            "quranBookmarks",
            bookmarks
        );


        renderBookmarks();


        if (currentSurah) {

            renderAyahs();

        }


        showToast(
            "همه نشان‌گذاری‌ها حذف شدند"
        );

    }
);


// ==========================================
// جستجوی مستقیم آدرس
// نمونه: 2:255
// ==========================================

function parseAyahAddress(query) {

    const normalized =
        toEnglishDigits(query)
            .replace(
                /\s/g,
                ""
            );


    const match =
        normalized.match(
            /^(\d{1,3})[:\/\-](\d{1,3})$/
        );


    if (!match) {

        return null;

    }


    const surah =
        Number(match[1]);


    const ayah =
        Number(match[2]);


    if (
        surah < 1 ||
        surah > 114 ||
        ayah < 1
    ) {

        return null;

    }


    return {

        surah,
        ayah

    };

}


// ==========================================
// نرمال‌سازی متن برای جستجوی آیه
// ==========================================

function normalizeSearchQuery(query) {

    return normalizeText(query)

        .replace(
            /[،؛!؟.,]/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// ==========================================
// تغییر تب جستجو
// ==========================================

function setSearchMode(mode) {

    currentSearchMode =
        mode;


    searchTabs.forEach(
        tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.search ===
                mode
            );

        }
    );


    if (searchHint) {

        if (
            mode === "arabic"
        ) {

            searchHint.textContent =
                "جستجو در متن عربی قرآن انجام می‌شود.";

        }

        else if (
            mode === "persian"
        ) {

            searchHint.textContent =
                "جستجو در ترجمه فارسی انجام می‌شود.";

        }

        else {

            searchHint.textContent =
                "جستجوی هوشمند در متن عربی و ترجمه فارسی انجام می‌شود.";

        }

    }

}


// ==========================================
// جستجوی آیات
// ==========================================

async function searchAyahs() {

    const rawQuery =
        ayahSearchInput?.value.trim();


    if (!rawQuery) {

        searchResults.innerHTML = `

            <div class="empty-message">

                عبارت موردنظر را وارد کنید.

            </div>

        `;

        return;

    }


    const address =
        parseAyahAddress(
            rawQuery
        );


    if (address) {

        lastRead = {

            surah:
                address.surah,

            ayah:
                address.ayah,

            name: ""

        };


        saveStorage(
            "quranLastRead",
            lastRead
        );


        closeModal(
            searchModal
        );


        openSurah(
            address.surah
        );

        return;

    }


    const query =
        normalizeSearchQuery(
            rawQuery
        );


    searchResults.innerHTML =
        "";


    searchLoading?.classList.remove(
        "hidden"
    );


    try {

        let allResults =
            [];


        const searchTasks =
            [];


        if (
            currentSearchMode ===
            "smart"

            ||

            currentSearchMode ===
            "arabic"
        ) {

            searchTasks.push(
                searchInEdition(
                    query,
                    "quran-uthmani"
                )
            );

        }


        if (
            currentSearchMode ===
            "smart"

            ||

            currentSearchMode ===
            "persian"
        ) {

            const edition =
                translationSelect?.value ||
                DEFAULT_TRANSLATION;


            searchTasks.push(
                searchInEdition(
                    query,
                    edition === ""
                        ? DEFAULT_TRANSLATION
                        : edition
                )
            );

        }


        const results =
            await Promise.allSettled(
                searchTasks
            );


        results.forEach(result => {

            if (
                result.status ===
                "fulfilled"
            ) {

                allResults.push(
                    ...result.value
                );

            }

        });


        const uniqueResults =
            removeDuplicateResults(
                allResults
            );


        renderSearchResults(
            uniqueResults
        );

    }

    catch (error) {

        console.error(error);


        renderSearchResults(
            []
        );

    }

    finally {

        searchLoading?.classList.add(
            "hidden"
        );

    }

}


// ==========================================
// جستجو در API
// ==========================================

async function searchInEdition(
    query,
    edition
) {

    const response =
        await fetch(
            `${API}/search/${encodeURIComponent(
                query
            )}/all/${edition}`
        );


    if (!response.ok) {

        throw new Error(
            "Search failed"
        );

    }


    const result =
        await response.json();


    return result.data?.matches ||
        [];

}


// ==========================================
// حذف نتایج تکراری
// ==========================================

function removeDuplicateResults(results) {

    const map =
        new Map();


    results.forEach(item => {

        const key =
            `${item.surah.number}-${item.numberInSurah}`;


        if (
            !map.has(key)
        ) {

            map.set(
                key,
                item
            );

        }

    });


    return [
        ...map.values()
    ];

}


// ==========================================
// نمایش نتایج جستجو
// ==========================================

function renderSearchResults(matches) {

    if (!searchResults) return;


    if (!matches.length) {

        searchResults.innerHTML = `

            <div class="empty-message">

                <div class="empty-icon">
                    🔎
                </div>

                <h3>
                    نتیجه‌ای پیدا نشد
                </h3>

                <p>
                    عبارت دیگری را امتحان کنید.
                </p>

            </div>

        `;

        return;

    }


    searchResults.innerHTML =
        "";


    matches
        .slice(0, 100)
        .forEach(match => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "search-result-item";


            item.innerHTML = `

                <strong>

                    سوره
                    ${escapeHTML(
                        match.surah.name
                    )}

                    • آیه

                    ${toPersianNumber(
                        match.numberInSurah
                    )}

                </strong>

                <p>

                    ${escapeHTML(
                        match.text
                    )}

                </p>

            `;


            item.addEventListener(
                "click",
                () => {

                    lastRead = {

                        surah:
                            match.surah.number,

                        ayah:
                            match.numberInSurah,

                        name:
                            match.surah.name

                    };


                    saveStorage(
                        "quranLastRead",
                        lastRead
                    );


                    closeModal(
                        searchModal
                    );


                    openSurah(
                        match.surah.number
                    );

                }
            );


            searchResults.appendChild(
                item
            );

        });

}


// ==========================================
// ادامه مطالعه
// ==========================================

function showContinueModal() {

    if (!lastRead) {

        continueText.textContent =
            "هنوز مطالعه‌ای ذخیره نشده است.";


        openContinue.style.display =
            "none";

    }

    else {

        continueText.textContent =
            `آخرین مطالعه شما: سوره ${
                lastRead.name || ""
            }، آیه ${
                toPersianNumber(
                    lastRead.ayah
                )
            }`;


        openContinue.style.display =
            "inline-flex";

    }


    openModal(
        continueModal
    );

}


// ==========================================
// آیه تصادفی
// ==========================================

async function openRandomAyah() {

    if (!surahs.length) {

        showToast(
            "سوره‌ها هنوز بارگذاری نشده‌اند"
        );

        return;

    }


    const surah =
        surahs[
            Math.floor(
                Math.random() *
                surahs.length
            )
        ];


    lastRead = {

        surah:
            surah.number,

        ayah:
            1,

        name:
            surah.name

    };


    saveStorage(
        "quranLastRead",
        lastRead
    );


    await openSurah(
        surah.number
    );


    showToast(
        "یک آیه برای مطالعه انتخاب شد ✨"
    );

}


// ==========================================
// رویدادهای صفحه
// ==========================================

themeButton?.addEventListener(
    "click",
    toggleTheme
);


menuButton?.addEventListener(
    "click",
    () => {

        nav?.classList.toggle(
            "show"
        );

    }
);


$$(".nav a").forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                nav?.classList.remove(
                    "show"
                );

            }
        );

    }
);


// جستجوی سوره

searchInput?.addEventListener(
    "input",
    event => {

        searchSurahs(
            event.target.value
        );

    }
);


searchInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Enter"
        ) {

            return;

        }


        const query =
            normalizeText(
                event.target.value
            );


        if (!query) return;


        if (
            /^\d+$/.test(
                query
            )
        ) {

            const number =
                Number(query);


            if (
                number >= 1 &&
                number <= 114
            ) {

                openSurah(
                    number
                );

                return;

            }

        }


        const exact =
            surahs.filter(
                surah => {

                    const names = [

                        normalizeText(
                            surah.name
                        ),

                        normalizeText(
                            surah.englishName
                        ),

                        ...getSurahAliases(
                            surah.number
                        ).map(
                            normalizeText
                        )

                    ];


                    return names.includes(
                        query
                    );

                }
            );


        if (
            exact.length === 1
        ) {

            openSurah(
                exact[0].number
            );

        }

    }
);


// ادامه مطالعه

continueButton?.addEventListener(
    "click",
    showContinueModal
);


openContinue?.addEventListener(
    "click",
    () => {

        if (!lastRead) return;


        closeModal(
            continueModal
        );


        openSurah(
            lastRead.surah
        );

    }
);


// آیه تصادفی

randomButton?.addEventListener(
    "click",
    openRandomAyah
);


// باز کردن جستجو

openSearchButton?.addEventListener(
    "click",
    () => {

        openModal(
            searchModal
        );


        setTimeout(() => {

            ayahSearchInput?.focus();

        }, 200);

    }
);


// تب‌های جستجو

searchTabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            () => {

                setSearchMode(
                    tab.dataset.search
                );

            }
        );

    }
);


// اجرای جستجو

ayahSearchButton?.addEventListener(
    "click",
    searchAyahs
);


ayahSearchInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            searchAyahs();

        }

    }
);


// کنترل صوت

surahAudioButton?.addEventListener(
    "click",
    toggleSurahPlayback
);


stopAudioButton?.addEventListener(
    "click",
    stopAudio
);


nextAyahButton?.addEventListener(
    "click",
    () => {

        shouldContinue =
            isPlaying;


        playNextAyah(
            isPlaying
        );

    }
);


previousAyahButton?.addEventListener(
    "click",
    playPreviousAyah
);


// بستن مودال‌ها

closeSurah?.addEventListener(
    "click",
    () => {

        stopAudio();

        closeModal(
            surahModal
        );

    }
);


closeSearch?.addEventListener(
    "click",
    () => {

        closeModal(
            searchModal
        );

    }
);


closeContinue?.addEventListener(
    "click",
    () => {

        closeModal(
            continueModal
        );

    }
);


// کلیک بیرون مودال

[
    surahModal,
    searchModal,
    continueModal
].forEach(
    modal => {

        modal?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    if (
                        modal ===
                        surahModal
                    ) {

                        stopAudio();

                    }


                    closeModal(
                        modal
                    );

                }

            }
        );

    }
);


// ESC

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        if (
            surahModal?.classList.contains(
                "show"
            )
        ) {

            stopAudio();

            closeModal(
                surahModal
            );

        }


        closeModal(
            searchModal
        );


        closeModal(
            continueModal
        );

    }
);


// ==========================================
// شروع برنامه
// ==========================================

function init() {

    applyTheme(
        savedTheme
    );


    setupTranslations();

    setupReciters();

    renderBookmarks();

    setSearchMode(
        "smart"
    );

    updateAudioUI();

    updateAudioStatus();

    loadSurahs();

}


init();
