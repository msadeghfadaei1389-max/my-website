"use strict";

// ===============================
// تنظیمات
// ===============================

const API = "https://api.alquran.cloud/v1";

const translations = {
    "": {
        name: "بدون ترجمه",
        edition: null
    },

    "fa.makarem": {
        name: "ترجمه مکارم شیرازی",
        edition: "fa.makarem"
    },

    "fa.ansarian": {
        name: "ترجمه حسین انصاریان",
        edition: "fa.ansarian"
    }
};

const reciters = {
    "ar.alafasy": "مشاری راشد العفاسی",
    "ar.abdulbasitmurattal": "عبدالباسط عبدالصمد",
    "ar.husary": "محمود خلیل الحصری",
    "ar.minshawi": "محمد صدیق المنشاوی",
    "ar.sudais": "عبدالرحمن السدیس"
};


// ===============================
// عناصر صفحه
// ===============================

const surahGrid =
    document.getElementById("surahGrid");

const searchInput =
    document.getElementById("searchInput");

const surahCount =
    document.getElementById("surahCount");

const noResults =
    document.getElementById("noResults");

const themeButton =
    document.getElementById("themeButton");

const menuButton =
    document.getElementById("menuButton");

const continueButton =
    document.getElementById("continueButton");

const randomButton =
    document.getElementById("randomButton");

const bookmarkList =
    document.getElementById("bookmarkList");


// مودال سوره

const surahModal =
    document.getElementById("surahModal");

const closeSurah =
    document.getElementById("closeSurah");

const modalSurahNumber =
    document.getElementById("modalSurahNumber");

const modalSurahName =
    document.getElementById("modalSurahName");

const modalSurahInfo =
    document.getElementById("modalSurahInfo");

const ayahContainer =
    document.getElementById("ayahContainer");

const surahLoading =
    document.getElementById("surahLoading");

const translationSelect =
    document.getElementById("translationSelect");

const surahAudioButton =
    document.getElementById("surahAudioButton");


// جستجوی آیه

const searchModal =
    document.getElementById("searchModal");

const closeSearch =
    document.getElementById("closeSearch");

const ayahSearchInput =
    document.getElementById("ayahSearchInput");

const ayahSearchButton =
    document.getElementById("ayahSearchButton");

const searchResults =
    document.getElementById("searchResults");


// ادامه مطالعه

const continueModal =
    document.getElementById("continueModal");

const closeContinue =
    document.getElementById("closeContinue");

const continueText =
    document.getElementById("continueText");

const openContinue =
    document.getElementById("openContinue");


// پیام

const toast =
    document.getElementById("toast");


// ===============================
// متغیرها
// ===============================

let surahs = [];

let currentSurah = null;

let currentAyahs = [];

let currentTranslation = "";

let audio = null;

let isPlaying = false;

let bookmarks = JSON.parse(
    localStorage.getItem("quranBookmarks")
) || [];

let lastRead = JSON.parse(
    localStorage.getItem("quranLastRead")
) || null;


// ===============================
// تبدیل اعداد
// ===============================

function toPersianNumber(value) {

    return String(value).replace(
        /\d/g,
        digit => "۰۱۲۳۴۵۶۷۸۹"[digit]
    );

}


function toEnglishDigits(value) {

    const persian = "۰۱۲۳۴۵۶۷۸۹";

    const arabic = "٠١٢٣٤٥٦٧٨٩";


    return String(value)

        .replace(
            /[۰-۹]/g,
            digit => persian.indexOf(digit)
        )

        .replace(
            /[٠-٩]/g,
            digit => arabic.indexOf(digit)
        );

}


// ===============================
// نرمال کردن متن فارسی
// ===============================

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

        .replace(
            /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,
            ""
        )

        .replace(/[يى]/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/ة/g, "ه")
        .replace(/ۀ/g, "ه")
        .replace(/ؤ/g, "و")
        .replace(/[أإٱ]/g, "ا")

        .replace(/\s+/g, " ")

        .trim();

}


// ===============================
// نمایش پیام
// ===============================

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


// ===============================
// دریافت سوره‌ها
// ===============================

async function loadSurahs() {

    try {

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
                "خطا در دریافت سوره‌ها"
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


        if (surahGrid) {

            surahGrid.innerHTML = `
                <div class="error-message">
                    <h3>خطا در دریافت سوره‌ها</h3>
                    <p>اینترنت خود را بررسی کنید.</p>
                </div>
            `;

        }

    }

}


// ===============================
// نمایش سوره‌ها
// ===============================

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

            <span class="surah-card-number">

                ${toPersianNumber(
                    surah.number
                )}

            </span>

            <div class="surah-card-info">

                <strong>
                    ${surah.name}
                </strong>

                <small>
                    ${surah.englishName}
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


// ===============================
// نام‌های جایگزین سوره
// ===============================

function getSurahAliases(number) {

    const aliases = {

        1: ["فاتحه", "حمد"],

        2: ["بقره"],

        3: ["آل عمران", "ال عمران"],

        4: ["نساء", "نسا"],

        5: ["مائده", "مایده"],

        6: ["انعام"],

        7: ["اعراف"],

        8: ["انفال"],

        9: ["توبه", "برائت"],

        10: ["یونس"],

        11: ["هود"],

        12: ["یوسف"],

        13: ["رعد"],

        14: ["ابراهیم"],

        15: ["حجر"],

        16: ["نحل"],

        17: [
            "اسراء",
            "بنی اسرائیل",
            "بنی اسراییل"
        ],

        18: ["کهف"],

        19: ["مریم"],

        20: ["طه", "طاه"],

        21: ["انبیاء", "انبیا"],

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
            "ملك",
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


// ===============================
// جستجوی سوره
// ===============================

function searchSurahs(query) {

    const normalizedQuery =
        normalizeText(query)

            .replace(
                /^(سوره|سورت)\s*/g,
                ""
            )

            .trim();


    if (!normalizedQuery) {

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
                    normalizedQuery
                )

                ||

                englishName.includes(
                    normalizedQuery
                )

                ||

                aliases.some(alias =>
                    alias.includes(
                        normalizedQuery
                    )
                )

                ||

                number ===
                    normalizedQuery

            );

        });


    renderSurahs(
        results
    );

}


// ===============================
// دریافت اطلاعات سوره
// ===============================

async function fetchEdition(
    surahNumber,
    edition
) {

    const url =
        `${API}/surah/${surahNumber}/${edition}`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            `خطای API: ${response.status}`
        );

    }


    const result =
        await response.json();


    if (
        !result ||
        !result.data ||
        !Array.isArray(
            result.data.ayahs
        ) ||
        result.data.ayahs.length === 0
    ) {

        throw new Error(
            "آیات از API دریافت نشدند"
        );

    }


    return result.data;
}


// ===============================
// باز کردن سوره
// ===============================

async function openSurah(number) {

    try {

        stopAudio();


        currentSurah =
            number;


        currentTranslation =
            translationSelect?.value ||
            "";


        surahModal?.classList.add(
            "show"
        );


        document.body.style.overflow =
            "hidden";


        ayahContainer.innerHTML =
            "";


        surahLoading?.classList.remove(
            "hidden"
        );


        const surah =
            surahs.find(
                item =>
                    item.number ===
                    number
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
                    surah.revelationType ===
                    "Meccan"
                        ? "مکی"
                        : "مدنی"
                }`;

        }


        // دریافت آیات اصلی

        let quranData;


        try {

            quranData =
                await fetchEdition(
                    number,
                    "ar.alafasy"
                );

        }

        catch (error) {

            console.warn(
                "قاری پیش‌فرض دریافت نشد",
                error
            );


            quranData =
                await fetchEdition(
                    number,
                    "ar.alafasy"
                );

        }


        currentAyahs =
            quranData.ayahs;


        // دریافت ترجمه

        let translationData =
            null;


        if (currentTranslation) {

            try {

                const translation =
                    await fetchEdition(
                        number,
                        currentTranslation
                    );


                translationData =
                    translation.ayahs;

            }

            catch (error) {

                console.warn(
                    "ترجمه دریافت نشد:",
                    error
                );


                translationData =
                    null;

            }

        }


        // آیات حتی در صورت خطای ترجمه
        // باید نمایش داده شوند

        renderAyahs(
            currentAyahs,
            translationData
        );


        surahLoading?.classList.add(
            "hidden"
        );


        // ادامه مطالعه

        if (
            lastRead &&
            Number(lastRead.surah) ===
            Number(number)
        ) {

            setTimeout(() => {

                const element =
                    document.getElementById(
                        `ayah-${lastRead.ayah}`
                    );


                element?.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "center"

                });

            }, 400);

        }

    }

    catch (error) {

        console.error(error);


        surahLoading?.classList.add(
            "hidden"
        );


        ayahContainer.innerHTML = `

            <div class="error-message">

                <h3>
                    خطا در دریافت آیات
                </h3>

                <p>
                    اینترنت خود را بررسی کنید.
                </p>

            </div>

        `;

    }

}


// ===============================
// نمایش آیات
// ===============================

function renderAyahs(
    ayahs,
    translationsData = null
) {

    if (!ayahContainer) return;


    ayahContainer.innerHTML =
        "";


    ayahs.forEach(
        (
            ayah,
            index
        ) => {

            const translation =
                translationsData?.[index]?.text ||
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


            const ayahElement =
                document.createElement(
                    "article"
                );


            ayahElement.className =
                "ayah-card";


            ayahElement.id =
                `ayah-${ayah.numberInSurah}`;


            ayahElement.innerHTML = `

                <div class="ayah-top">

                    <span class="ayah-number">

                        ${toPersianNumber(
                            ayah.numberInSurah
                        )}

                    </span>

                    <div class="ayah-actions">

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

                <p class="ayah-arabic">

                    ${ayah.text}

                </p>

                ${
                    translation
                        ? `

                            <p class="ayah-translation">

                                ${translation}

                            </p>

                        `
                        : ""
                }

                <div class="ayah-source">

                    سوره

                    ${ayah.surah.name}

                    • آیه

                    ${toPersianNumber(
                        ayah.numberInSurah
                    )}

                </div>

            `;


            const playButton =
                ayahElement.querySelector(
                    ".ayah-play"
                );


            playButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    playAyah(
                        ayah.audio,
                        playButton
                    );

                }
            );


            const bookmarkButton =
                ayahElement.querySelector(
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
                        )
                            ? "🔖"
                            : "🔗";

                }
            );


            ayahElement.addEventListener(
                "click",
                event => {

                    if (
                        event.target.closest(
                            "button"
                        )
                    ) {

                        return;

                    }


                    saveLastRead(
                        ayah
                    );

                }
            );


            ayahContainer.appendChild(
                ayahElement
            );

        }
    );

}


// ===============================
// ذخیره آخرین آیه
// ===============================

function saveLastRead(ayah) {

    lastRead = {

        surah:
            ayah.surah.number,

        ayah:
            ayah.numberInSurah,

        name:
            ayah.surah.name

    };


    localStorage.setItem(
        "quranLastRead",
        JSON.stringify(lastRead)
    );

}


// ===============================
// نشان‌گذاری
// ===============================

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


    if (index > -1) {

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


    localStorage.setItem(
        "quranBookmarks",
        JSON.stringify(bookmarks)
    );


    renderBookmarks();

}


// ===============================
// نمایش نشان‌گذاری‌ها
// ===============================

function renderBookmarks() {

    if (!bookmarkList) return;


    if (!bookmarks.length) {

        bookmarkList.innerHTML = `

            <div class="empty-bookmarks">

                <span>
                    🔖
                </span>

                <p>
                    هنوز آیه‌ای نشان‌گذاری نشده است.
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

                ${item.text}

            </span>

            <small>

                ${item.name}

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


                localStorage.setItem(
                    "quranLastRead",
                    JSON.stringify(lastRead)
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


// ===============================
// پخش یک آیه
// ===============================

function playAyah(
    url,
    button
) {

    if (!url) {

        showToast(
            "فایل صوتی این آیه موجود نیست"
        );

        return;

    }


    if (
        audio &&
        audio.src === url
    ) {

        if (isPlaying) {

            stopAudio();

            return;

        }

    }


    stopAudio();


    audio =
        new Audio(url);


    isPlaying =
        true;


    audio.play()
        .catch(error => {

            console.error(error);


            isPlaying =
                false;


            showToast(
                "پخش صوت ممکن نشد"
            );

        });


    audio.onended =
        () => {

            isPlaying =
                false;


            if (button) {

                button.textContent =
                    "▶";

            }

        };


    if (button) {

        button.textContent =
            "⏸";

    }

}


// ===============================
// پخش کامل سوره
// ===============================

function playFullSurah() {

    if (!currentAyahs.length) {

        showToast(
            "ابتدا یک سوره باز کنید"
        );

        return;

    }


    if (isPlaying) {

        stopAudio();

        return;

    }


    let index =
        0;


    function playNext() {

        if (
            index >=
            currentAyahs.length
        ) {

            stopAudio();

            return;

        }


        const ayah =
            currentAyahs[index];


        saveLastRead(
            ayah
        );


        if (!ayah.audio) {

            index++;

            playNext();

            return;

        }


        audio =
            new Audio(
                ayah.audio
            );


        isPlaying =
            true;


        if (surahAudioButton) {

            surahAudioButton.textContent =
                `⏸ توقف • ${toPersianNumber(
                    index + 1
                )}`;

        }


        audio.play()
            .catch(error => {

                console.error(error);


                stopAudio();

                showToast(
                    "پخش صوت ممکن نشد"
                );

            });


        audio.onended =
            () => {

                index++;


                if (isPlaying) {

                    playNext();

                }

            };

    }


    playNext();

}


// ===============================
// توقف صوت
// ===============================

function stopAudio() {

    if (audio) {

        audio.pause();


        try {

            audio.currentTime =
                0;

        }

        catch (error) {

            console.warn(error);

        }

    }


    isPlaying =
        false;


    if (surahAudioButton) {

        surahAudioButton.textContent =
            "🎧 پخش سوره";

    }

}


// ===============================
// جستجوی آیه
// ===============================

async function searchAyahs() {

    const query =
        ayahSearchInput?.value
            .trim();


    if (!query) {

        searchResults.innerHTML = `

            <div class="empty-message">

                عبارت موردنظر را وارد کنید.

            </div>

        `;

        return;

    }


    searchResults.innerHTML = `

        <div class="loading-search">

            در حال جستجو...

        </div>

    `;


    try {

        const translation =
            translationSelect?.value ||
            "fa.makarem";


        const response =
            await fetch(

                `${API}/search/${encodeURIComponent(
                    query
                )}/all/${translation}`

            );


        if (!response.ok) {

            throw new Error(
                "خطا در جستجو"
            );

        }


        const result =
            await response.json();


        const matches =
            result.data?.matches ||
            [];


        if (!matches.length) {

            searchResults.innerHTML = `

                <div class="empty-message">

                    نتیجه‌ای پیدا نشد.

                </div>

            `;

            return;

        }


        searchResults.innerHTML =
            "";


        matches.slice(
            0,
            100
        ).forEach(match => {

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

                    ${match.surah.name}

                    • آیه

                    ${toPersianNumber(
                        match.numberInSurah
                    )}

                </strong>

                <p>

                    ${match.text}

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


                    localStorage.setItem(
                        "quranLastRead",
                        JSON.stringify(lastRead)
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

    catch (error) {

        console.error(error);


        searchResults.innerHTML = `

            <div class="empty-message">

                خطا در جستجو.
                اینترنت خود را بررسی کنید.

            </div>

        `;

    }

}


// ===============================
// آیه تصادفی
// ===============================

function openRandomAyah() {

    const surahNumber =
        Math.floor(
            Math.random() * 114
        ) + 1;


    openSurah(
        surahNumber
    );


    showToast(
        "یک سوره به‌صورت تصادفی انتخاب شد ✨"
    );

}


// ===============================
// ادامه مطالعه
// ===============================

function showContinueModal() {

    if (!lastRead) {

        continueText.textContent =
            "هنوز آیه‌ای برای ادامه مطالعه ذخیره نشده است.";


        openContinue.style.display =
            "none";

    }

    else {

        continueText.textContent =
            `آخرین مطالعه شما: سوره ${lastRead.name}، آیه ${toPersianNumber(
                lastRead.ayah
            )}`;


        openContinue.style.display =
            "inline-flex";

    }


    continueModal?.classList.add(
        "show"
    );

}


// ===============================
// حالت شب
// ===============================

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "quranTheme"
        );


    if (
        savedTheme ===
        "dark"
    ) {

        document.body.classList.add(
            "dark"
        );


        if (themeButton) {

            themeButton.textContent =
                "☀️";

        }

    }

}


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "quranTheme",
        isDark
            ? "dark"
            : "light"
    );


    if (themeButton) {

        themeButton.textContent =
            isDark
                ? "☀️"
                : "🌙";

    }

}


// ===============================
// باز و بسته کردن مودال
// ===============================

function closeModal(modal) {

    modal?.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


// ===============================
// رویدادهای جستجوی اصلی
// ===============================

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


        const query =
            normalizeText(
                event.target.value
            );


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


        const results =
            surahs.filter(surah =>

                normalizeText(
                    surah.name
                ) === query

                ||

                getSurahAliases(
                    surah.number
                ).some(alias =>

                    normalizeText(alias) ===
                    query

                )

            );


        if (
            results.length === 1
        ) {

            openSurah(
                results[0].number
            );

        }

    }
);


// ===============================
// رویدادهای دکمه‌ها
// ===============================

themeButton?.addEventListener(
    "click",
    toggleTheme
);


randomButton?.addEventListener(
    "click",
    openRandomAyah
);


continueButton?.addEventListener(
    "click",
    showContinueModal
);


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


surahAudioButton?.addEventListener(
    "click",
    playFullSurah
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


// ===============================
// بستن مودال با کلیک بیرون
// ===============================

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

});


// ===============================
// شروع سایت
// ===============================

loadTheme();

renderBookmarks();

loadSurahs();
