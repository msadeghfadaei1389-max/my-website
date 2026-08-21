"use strict";

/* =========================================
   تنظیمات
========================================= */

const API = "https://api.alquran.cloud/v1";

const EDITION = "quran-uthmani";

const FALLBACK_TRANSLATION = "fa.makarem";


/* =========================================
   عناصر صفحه
========================================= */

const $ = selector =>
    document.querySelector(selector);


const surahGrid = $("#surahGrid");
const searchInput = $("#searchInput");
const surahCount = $("#surahCount");
const noResults = $("#noResults");

const themeButton = $("#themeButton");
const menuButton = $("#menuButton");

const continueButton = $("#continueButton");
const randomButton = $("#randomButton");

const bookmarkList = $("#bookmarkList");

const surahModal = $("#surahModal");
const closeSurah = $("#closeSurah");

const modalSurahNumber =
    $("#modalSurahNumber");

const modalSurahName =
    $("#modalSurahName");

const modalSurahInfo =
    $("#modalSurahInfo");

const ayahContainer =
    $("#ayahContainer");

const surahLoading =
    $("#surahLoading");

const translationSelect =
    $("#translationSelect");

const searchModal =
    $("#searchModal");

const closeSearch =
    $("#closeSearch");

const ayahSearchInput =
    $("#ayahSearchInput");

const ayahSearchButton =
    $("#ayahSearchButton");

const searchResults =
    $("#searchResults");

const continueModal =
    $("#continueModal");

const closeContinue =
    $("#closeContinue");

const continueText =
    $("#continueText");

const openContinue =
    $("#openContinue");

const toast =
    $("#toast");


/* =========================================
   وضعیت برنامه
========================================= */

let surahs = [];

let currentSurah = null;

let currentAyahs = [];

let currentTranslations = [];

let currentRequestId = 0;

let bookmarks = [];

let lastRead = null;


/* =========================================
   LocalStorage
========================================= */

function getStorage(key, fallback) {

    try {

        const value =
            localStorage.getItem(key);

        return value
            ? JSON.parse(value)
            : fallback;

    }

    catch (error) {

        console.warn(
            "خطا در خواندن اطلاعات ذخیره‌شده",
            error
        );

        return fallback;

    }

}


function setStorage(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    }

    catch (error) {

        console.warn(
            "خطا در ذخیره اطلاعات",
            error
        );

    }

}


bookmarks = getStorage(
    "quranBookmarks",
    []
);

lastRead = getStorage(
    "quranLastRead",
    null
);


/* =========================================
   تبدیل اعداد
========================================= */

function toPersianNumber(value) {

    const numbers =
        "۰۱۲۳۴۵۶۷۸۹";

    return String(value).replace(
        /\d/g,
        digit => numbers[digit]
    );

}


function toEnglishDigits(value) {

    return String(value)

        .replace(
            /[۰-۹]/g,
            digit =>
                "۰۱۲۳۴۵۶۷۸۹".indexOf(
                    digit
                )
        )

        .replace(
            /[٠-٩]/g,
            digit =>
                "٠١٢٣٤٥٦٧٨٩".indexOf(
                    digit
                )
        );

}


/* =========================================
   نرمال‌سازی فارسی و عربی
========================================= */

function normalizeText(value) {

    return toEnglishDigits(value || "")

        .toLowerCase()

        .replace(
            /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,
            ""
        )

        .replace(
            /[أإٱآ]/g,
            "ا"
        )

        .replace(
            /[يى]/g,
            "ی"
        )

        .replace(
            /ك/g,
            "ک"
        )

        .replace(
            /ة/g,
            "ه"
        )

        .replace(
            /ۀ/g,
            "ه"
        )

        .replace(
            /ؤ/g,
            "و"
        )

        .replace(
            /ـ/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================
   جلوگیری از XSS
========================================= */

function escapeHTML(value) {

    return String(value ?? "")

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


/* =========================================
   پیام
========================================= */

let toastTimer;


function showToast(message) {

    if (!toast) return;

    clearTimeout(toastTimer);

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


/* =========================================
   مودال
========================================= */

function openModal(modal) {

    if (!modal) return;

    modal.classList.add(
        "show"
    );

    document.body.style.overflow =
        "hidden";

}


function closeModal(modal) {

    if (!modal) return;

    modal.classList.remove(
        "show"
    );

    document.body.style.overflow =
        "";

}


/* =========================================
   نام‌های جایگزین سوره‌ها
========================================= */

const SURAH_ALIASES = {

    1: [
        "فاتحه",
        "فاتحه الکتاب",
        "حمد"
    ],

    2: [
        "بقره"
    ],

    3: [
        "ال عمران",
        "آل عمران"
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
        "ابراهیم",
        "ابراهيم"
    ],

    15: [
        "حجر"
    ],

    16: [
        "نحل"
    ],

    17: [
        "اسراء",
        "اسرا",
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
        "انبیا",
        "انبیاء"
    ],

    22: [
        "حج"
    ],

    23: [
        "مومنون",
        "مؤمنون"
    ],

    24: [
        "نور"
    ],

    25: [
        "فرقان"
    ],

    27: [
        "نمل"
    ],

    29: [
        "عنکبوت",
        "عنكبوت"
    ],

    32: [
        "سجده"
    ],

    33: [
        "احزاب"
    ],

    36: [
        "یس",
        "یسین",
        "یاسین",
        "ياسين"
    ],

    37: [
        "صافات"
    ],

    39: [
        "زمر"
    ],

    41: [
        "فصلت"
    ],

    44: [
        "دخان"
    ],

    48: [
        "فتح"
    ],

    50: [
        "ق"
    ],

    53: [
        "نجم"
    ],

    54: [
        "قمر"
    ],

    55: [
        "رحمن",
        "الرحمن"
    ],

    56: [
        "واقعه"
    ],

    57: [
        "حدید"
    ],

    59: [
        "حشر"
    ],

    62: [
        "جمعه"
    ],

    67: [
        "ملک",
        "ملك",
        "تبارک"
    ],

    71: [
        "نوح"
    ],

    72: [
        "جن"
    ],

    73: [
        "مزمل"
    ],

    74: [
        "مدثر"
    ],

    75: [
        "قیامت"
    ],

    76: [
        "انسان",
        "دهر"
    ],

    78: [
        "نبا",
        "نبأ"
    ],

    79: [
        "نازعات"
    ],

    80: [
        "عبس"
    ],

    81: [
        "تکویر",
        "تكوير"
    ],

    82: [
        "انفطار"
    ],

    83: [
        "مطففین",
        "مطففین"
    ],

    84: [
        "انشقاق"
    ],

    85: [
        "بروج"
    ],

    87: [
        "اعلی",
        "اعلى"
    ],

    89: [
        "فجر"
    ],

    91: [
        "شمس"
    ],

    92: [
        "لیل"
    ],

    93: [
        "ضحی",
        "ضحى"
    ],

    94: [
        "انشراح",
        "شرح",
        "الم نشرح"
    ],

    95: [
        "تین"
    ],

    96: [
        "علق",
        "اقرا",
        "اقرأ"
    ],

    97: [
        "قدر"
    ],

    98: [
        "بینه",
        "بینة"
    ],

    99: [
        "زلزال"
    ],

    100: [
        "عادیات"
    ],

    101: [
        "قارعه"
    ],

    102: [
        "تکاثر"
    ],

    103: [
        "عصر"
    ],

    104: [
        "همزه"
    ],

    105: [
        "فیل"
    ],

    106: [
        "قریش"
    ],

    107: [
        "ماعون",
        "ماعون"
    ],

    108: [
        "کوثر"
    ],

    109: [
        "کافرون",
        "کافرین"
    ],

    110: [
        "نصر"
    ],

    111: [
        "مسد",
        "تبت"
    ],

    112: [
        "اخلاص",
        "توحید",
        "قل هو الله"
    ],

    113: [
        "فلق"
    ],

    114: [
        "ناس"
    ]

};


/* =========================================
   دریافت سوره‌ها
========================================= */

async function loadSurahs() {

    if (!surahGrid) return;

    try {

        const response =
            await fetch(
                `${API}/surah`
            );

        if (!response.ok) {

            throw new Error(
                `خطای سرور: ${response.status}`
            );

        }

        const result =
            await response.json();

        if (
            !Array.isArray(
                result.data
            )
        ) {

            throw new Error(
                "فهرست سوره‌ها دریافت نشد"
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

        surahGrid.innerHTML = `
            <div class="error-message">
                <h3>خطا در دریافت سوره‌ها</h3>
                <p>
                    اتصال اینترنت را بررسی کنید و
                    صفحه را دوباره بارگذاری کنید.
                </p>
            </div>
        `;

    }

}


/* =========================================
   نمایش سوره‌ها
========================================= */

function renderSurahs(list) {

    if (!surahGrid) return;

    surahGrid.innerHTML = "";

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

    const fragment =
        document.createDocumentFragment();

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

            <span class="surah-card-number">
                ${toPersianNumber(
                    surah.number
                )}
            </span>

            <div class="surah-card-info">

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

            <span class="surah-card-ayats">

                ${toPersianNumber(
                    surah.numberOfAyahs
                )}

                آیه

            </span>

        `;

        card.addEventListener(
            "click",
            () =>
                openSurah(
                    surah.number
                )
        );

        fragment.appendChild(
            card
        );

    });

    surahGrid.appendChild(
        fragment
    );

}


/* =========================================
   جستجوی سوره
========================================= */

function findSurahs(query) {

    const normalizedQuery =
        normalizeText(query)

            .replace(
                /^(سوره|سورت)\s*/g,
                ""
            )

            .trim();

    if (!normalizedQuery) {

        return surahs;

    }

    return surahs.filter(surah => {

        const fields = [

            surah.number,

            surah.name,

            surah.englishName,

            surah.englishNameTranslation,

            ...(SURAH_ALIASES[
                surah.number
            ] || [])

        ];

        return fields.some(value =>

            normalizeText(value)
                .includes(
                    normalizedQuery
                )

        );

    });

}


function searchSurahs(query) {

    renderSurahs(
        findSurahs(query)
    );

}


/* =========================================
   دریافت edition
========================================= */

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
            `خطای دریافت اطلاعات: ${response.status}`
        );

    }

    const result =
        await response.json();

    if (
        !result.data ||
        !Array.isArray(
            result.data.ayahs
        ) ||
        !result.data.ayahs.length
    ) {

        throw new Error(
            "اطلاعات آیات دریافت نشد"
        );

    }

    return result.data;

}


/* =========================================
   باز کردن سوره
========================================= */

async function openSurah(number) {

    const requestId =
        ++currentRequestId;

    currentSurah =
        Number(number);

    currentAyahs = [];

    currentTranslations = [];

    ayahContainer.innerHTML = "";

    openModal(
        surahModal
    );

    surahLoading?.classList.remove(
        "hidden"
    );

    const surah =
        surahs.find(
            item =>
                Number(item.number) ===
                Number(number)
        );

    if (surah) {

        modalSurahNumber.textContent =
            toPersianNumber(
                surah.number
            );

        modalSurahName.textContent =
            surah.name;

        modalSurahInfo.textContent =
            `${toPersianNumber(
                surah.numberOfAyahs
            )} آیه • ${
                surah.revelationType === "Meccan"
                    ? "مکی"
                    : "مدنی"
            }`;

    }

    try {

        const quranData =
            await fetchEdition(
                number,
                EDITION
            );

        if (
            requestId !==
            currentRequestId
        ) {

            return;

        }

        currentAyahs =
            quranData.ayahs;

        const translationEdition =
            translationSelect?.value ||
            "";

        if (translationEdition) {

            try {

                const translationData =
                    await fetchEdition(
                        number,
                        translationEdition
                    );

                if (
                    requestId ===
                    currentRequestId
                ) {

                    currentTranslations =
                        translationData.ayahs;

                }

            }

            catch (error) {

                console.warn(
                    "ترجمه دریافت نشد",
                    error
                );

            }

        }

        if (
            requestId !==
            currentRequestId
        ) {

            return;

        }

        renderAyahs();

        scrollToLastRead();

    }

    catch (error) {

        console.error(error);

        ayahContainer.innerHTML = `
            <div class="error-message">
                <h3>
                    آیات دریافت نشدند
                </h3>
                <p>
                    اینترنت خود را بررسی کنید و
                    دوباره تلاش کنید.
                </p>
            </div>
        `;

    }

    finally {

        if (
            requestId ===
            currentRequestId
        ) {

            surahLoading?.classList.add(
                "hidden"
            );

        }

    }

}


/* =========================================
   نمایش آیات
========================================= */

function renderAyahs() {

    if (!ayahContainer) return;

    ayahContainer.innerHTML = "";

    const fragment =
        document.createDocumentFragment();

    currentAyahs.forEach(
        (ayah, index) => {

            const ayahNumber =
                ayah.numberInSurah;

            const translation =
                currentTranslations[
                    index
                ]?.text || "";

            const isBookmarked =
                bookmarks.some(item =>

                    Number(item.surah) ===
                    Number(currentSurah)

                    &&

                    Number(item.ayah) ===
                    Number(ayahNumber)

                );

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "ayah-card";

            card.id =
                `ayah-${ayahNumber}`;

            card.tabIndex =
                0;

            card.innerHTML = `

                <div class="ayah-top">

                    <span class="ayah-number">
                        ${toPersianNumber(
                            ayahNumber
                        )}
                    </span>

                    <button
                        class="ayah-bookmark"
                        type="button"
                        title="نشان‌گذاری آیه"
                        aria-label="نشان‌گذاری آیه"
                    >
                        ${isBookmarked
                            ? "🔖"
                            : "🔗"
                        }
                    </button>

                </div>

                <p class="ayah-arabic">
                    ${escapeHTML(
                        ayah.text
                    )}
                </p>

                ${
                    translation
                        ? `
                            <p class="ayah-translation">
                                ${escapeHTML(
                                    translation
                                )}
                            </p>
                        `
                        : ""
                }

                <div class="ayah-source">

                    سوره

                    ${escapeHTML(
                        surahs.find(
                            item =>
                                item.number ===
                                currentSurah
                        )?.name || ""
                    )}

                    • آیه

                    ${toPersianNumber(
                        ayahNumber
                    )}

                </div>

            `;

            const bookmarkButton =
                card.querySelector(
                    ".ayah-bookmark"
                );

            bookmarkButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    toggleBookmark(
                        ayah
                    );

                    bookmarkButton.textContent =
                        isAyahBookmarked(
                            ayahNumber
                        )
                            ? "🔖"
                            : "🔗";

                }
            );

            card.addEventListener(
                "click",
                () => {

                    saveLastRead(
                        ayahNumber
                    );

                }
            );

            fragment.appendChild(
                card
            );

        }
    );

    ayahContainer.appendChild(
        fragment
    );

}


/* =========================================
   ترجمه
========================================= */

async function changeTranslation() {

    if (!currentSurah) return;

    await openSurah(
        currentSurah
    );

}


translationSelect?.addEventListener(
    "change",
    changeTranslation
);


/* =========================================
   نشان‌گذاری
========================================= */

function isAyahBookmarked(
    ayahNumber
) {

    return bookmarks.some(item =>

        Number(item.surah) ===
        Number(currentSurah)

        &&

        Number(item.ayah) ===
        Number(ayahNumber)

    );

}


function toggleBookmark(ayah) {

    const index =
        bookmarks.findIndex(item =>

            Number(item.surah) ===
            Number(currentSurah)

            &&

            Number(item.ayah) ===
            Number(ayah.numberInSurah)

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

        const surah =
            surahs.find(
                item =>
                    item.number ===
                    currentSurah
            );

        bookmarks.unshift({

            surah:
                currentSurah,

            ayah:
                ayah.numberInSurah,

            name:
                surah?.name || "",

            text:
                ayah.text

        });

        showToast(
            "آیه نشان‌گذاری شد"
        );

    }

    setStorage(
        "quranBookmarks",
        bookmarks
    );

    renderBookmarks();

}


function renderBookmarks() {

    if (!bookmarkList) return;

    if (!bookmarks.length) {

        bookmarkList.innerHTML = `
            <div class="empty-bookmarks">

                <span>🔖</span>

                <p>
                    هنوز آیه‌ای نشان‌گذاری نشده است.
                </p>

            </div>
        `;

        return;

    }

    bookmarkList.innerHTML = "";

    const fragment =
        document.createDocumentFragment();

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

                lastRead = {
                    surah: item.surah,
                    ayah: item.ayah,
                    name: item.name
                };

                setStorage(
                    "quranLastRead",
                    lastRead
                );

                openSurah(
                    item.surah
                );

            }
        );

        fragment.appendChild(
            card
        );

    });

    bookmarkList.appendChild(
        fragment
    );

}


/* =========================================
   آخرین مطالعه
========================================= */

function saveLastRead(
    ayahNumber
) {

    const surah =
        surahs.find(
            item =>
                item.number ===
                currentSurah
        );

    lastRead = {

        surah:
            currentSurah,

        ayah:
            ayahNumber,

        name:
            surah?.name || ""

    };

    setStorage(
        "quranLastRead",
        lastRead
    );

}


function scrollToLastRead() {

    if (
        !lastRead ||
        Number(lastRead.surah) !==
        Number(currentSurah)
    ) {

        return;

    }

    setTimeout(() => {

        const element =
            document.getElementById(
                `ayah-${lastRead.ayah}`
            );

        element?.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }, 350);

}


function showContinueModal() {

    openModal(
        continueModal
    );

    if (!lastRead) {

        continueText.textContent =
            "هنوز آیه‌ای برای ادامه مطالعه ذخیره نشده است.";

        openContinue.style.display =
            "none";

        return;

    }

    continueText.textContent =
        `آخرین مطالعه: سوره ${lastRead.name}، آیه ${toPersianNumber(
            lastRead.ayah
        )}`;

    openContinue.style.display =
        "";

}


/* =========================================
   جستجوی آیات
========================================= */

async function searchAyahs() {

    const originalQuery =
        ayahSearchInput?.value
            .trim() || "";

    if (!originalQuery) {

        searchResults.innerHTML = `
            <div class="empty-message">
                عبارت موردنظر را وارد کنید.
            </div>
        `;

        return;

    }

    const query =
        normalizeText(
            originalQuery
        );

    searchResults.innerHTML = `
        <div class="loading-search">
            در حال جستجو...
        </div>
    `;

    try {

        const edition =
            translationSelect?.value ||
            FALLBACK_TRANSLATION;

        const response =
            await fetch(
                `${API}/search/${encodeURIComponent(
                    originalQuery
                )}/all/${edition}`
            );

        if (!response.ok) {

            throw new Error(
                `خطای جستجو: ${response.status}`
            );

        }

        const result =
            await response.json();

        const matches =
            result.data?.matches || [];

        const normalizedMatches =
            matches.filter(match => {

                const text =
                    normalizeText(
                        match.text
                    );

                return text.includes(
                    query
                );

            });

        const finalMatches =
            normalizedMatches.length
                ? normalizedMatches
                : matches;

        renderSearchResults(
            finalMatches,
            originalQuery
        );

    }

    catch (error) {

        console.error(error);

        searchResults.innerHTML = `
            <div class="empty-message">

                جستجو با مشکل مواجه شد.

                <br>

                دوباره تلاش کنید.

            </div>
        `;

    }

}


function renderSearchResults(
    matches,
    query
) {

    if (!searchResults) return;

    if (!matches.length) {

        searchResults.innerHTML = `
            <div class="empty-message">
                نتیجه‌ای برای «${escapeHTML(
                    query
                )}» پیدا نشد.
            </div>
        `;

        return;

    }

    searchResults.innerHTML = "";

    const fragment =
        document.createDocumentFragment();

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

                    setStorage(
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

            fragment.appendChild(
                item
            );

        });

    searchResults.appendChild(
        fragment
    );

}


/* =========================================
   جستجوی اصلی سایت
========================================= */

searchInput?.addEventListener(
    "input",
    event => {

        const query =
            event.target.value;

        searchSurahs(
            query
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

        event.preventDefault();

        const originalQuery =
            event.target.value.trim();

        const query =
            normalizeText(
                originalQuery
            );

        if (!query) return;

        const results =
            findSurahs(
                originalQuery
            );

        if (results.length === 1) {

            openSurah(
                results[0].number
            );

            return;

        }

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

                openSurah(number);

                return;

            }

        }

        /*
            اگر سوره پیدا نشد،
            عبارت به جستجوی آیات منتقل می‌شود.
        */

        if (results.length === 0) {

            ayahSearchInput.value =
                originalQuery;

            openModal(
                searchModal
            );

            searchAyahs();

        }

    }
);


/* =========================================
   آیه تصادفی
========================================= */

function openRandomSurah() {

    if (!surahs.length) return;

    const randomIndex =
        Math.floor(
            Math.random() *
            surahs.length
        );

    openSurah(
        surahs[
            randomIndex
        ].number
    );

}


/* =========================================
   حالت شب
========================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            "quranTheme"
        );

    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

    }

    updateThemeButton();

}


function updateThemeButton() {

    if (!themeButton) return;

    themeButton.textContent =
        document.body.classList.contains(
            "dark"
        )
            ? "☀️"
            : "🌙";

}


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );

    localStorage.setItem(
        "quranTheme",

        document.body.classList.contains(
            "dark"
        )
            ? "dark"
            : "light"
    );

    updateThemeButton();

}


/* =========================================
   رویدادها
========================================= */

themeButton?.addEventListener(
    "click",
    toggleTheme
);


randomButton?.addEventListener(
    "click",
    openRandomSurah
);


continueButton?.addEventListener(
    "click",
    showContinueModal
);


closeSurah?.addEventListener(
    "click",
    () => {

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

            event.preventDefault();

            searchAyahs();

        }

    }
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


[
    surahModal,
    searchModal,
    continueModal
].forEach(modal => {

    modal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeModal(
                    modal
                );

            }

        }
    );

});


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            [
                surahModal,
                searchModal,
                continueModal
            ].forEach(
                closeModal
            );

        }

    }
);


/* =========================================
   شروع سایت
========================================= */

loadTheme();

renderBookmarks();

loadSurahs();
