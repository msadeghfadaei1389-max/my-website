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

        // حذف حرکات عربی
        .replace(
            /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,
            ""
        )

        // تبدیل حروف عربی و فارسی
        .replace(/[يى]/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/ة/g, "ه")
        .replace(/ۀ/g, "ه")
        .replace(/ؤ/g, "و")
        .replace(/[أإٱ]/g, "ا")

        // فاصله‌ها
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

    toast.textContent = message;

    toast.classList.add("show");

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


// ===============================
// دریافت سوره‌ها
// ===============================

async function loadSurahs() {

    try {

        const response =
            await fetch(`${API}/surah`);

        const result =
            await response.json();


        if (!result.data) {

            throw new Error(
                "خطا در دریافت سوره‌ها"
            );

        }


        surahs = result.data;

        renderSurahs(surahs);

    }

    catch (error) {

        console.error(error);

        if (surahGrid) {

            surahGrid.innerHTML = `

                <div class="error-message">

                    <h3>
                        اتصال برقرار نشد
                    </h3>

                    <p>
                        لطفاً اینترنت خود را بررسی و دوباره تلاش کنید.
                    </p>

                    <button
                        type="button"
                        onclick="location.reload()">

                        تلاش دوباره

                    </button>

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


    surahGrid.innerHTML = "";


    if (surahCount) {

        surahCount.textContent =
            `${toPersianNumber(list.length)} سوره`;

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
            document.createElement("button");

        card.type = "button";

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
            () => openSurah(
                surah.number
            )
        );


        surahGrid.appendChild(card);

    });

}


// ===============================
// جستجوی پیشرفته سوره
// ===============================

function searchSurahs(query) {

    const normalized =
        normalizeText(query);


    if (!normalized) {

        renderSurahs(surahs);

        return;

    }


    // حذف کلمه سوره
    const cleanQuery =
        normalized

            .replace(
                /^(سوره|سورت)\s*/g,
                ""
            )

            .trim();


    const results =
        surahs.filter(surah => {


            const persianName =
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


            // جستجوی نام‌های جایگزین
            const aliases =
                getSurahAliases(
                    surah.number
                );


            return (

                // نام اصلی
                persianName.includes(
                    cleanQuery
                )

                ||

                // جستجوی برعکس
                cleanQuery.includes(
                    persianName
                )

                ||

                // نام انگلیسی
                englishName.includes(
                    cleanQuery
                )

                ||

                // شماره
                number === cleanQuery

                ||

                // شماره به صورت بخشی
                number.includes(
                    cleanQuery
                )

                ||

                // نام‌های رایج فارسی
                aliases.some(alias =>

                    normalizeText(alias)
                        .includes(
                            cleanQuery
                        )

                    ||

                    cleanQuery.includes(
                        normalizeText(alias)
                    )

                )

            );

        });


    renderSurahs(results);

}


// ===============================
// نام‌های جایگزین سوره‌ها
// ===============================

function getSurahAliases(number) {

    const aliases = {

        1: [
            "فاتحه",
            "حمد"
        ],

        2: [
            "بقره",
            "بقر"
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

        9: [
            "توبه",
            "برائت"
        ],

        10: [
            "یونس"
        ],

        12: [
            "یوسف"
        ],

        18: [
            "کهف",
            "كهف"
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
            "ياسين",
            "یاسین",
            "یسین"
        ],

        55: [
            "الرحمن",
            "رحمن"
        ],

        56: [
            "واقعه",
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
// باز کردن سوره
// ===============================

async function openSurah(number) {

    try {

        stopAudio();


        currentSurah = number;

        currentTranslation =
            translationSelect?.value || "";


        surahModal?.classList.add(
            "show"
        );


        document.body.style.overflow =
            "hidden";


        ayahContainer.innerHTML = "";

        surahLoading?.classList.remove(
            "hidden"
        );


        const surah =
            surahs.find(
                item =>
                    item.number === number
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
                )} آیه • ${surah.revelationType === "Meccan"
                    ? "مکی"
                    : "مدنی"
                }`;

        }


        const response =
            await fetch(
                `${API}/surah/${number}/ar.alafasy`
            );


        const result =
            await response.json();


        if (!result.data) {

            throw new Error(
                "آیات دریافت نشدند"
            );

        }


        currentAyahs =
            result.data.ayahs;


        let translationData = null;


        if (currentTranslation) {

            try {

                const translationResponse =
                    await fetch(
                        `${API}/surah/${number}/${currentTranslation}`
                    );


                const translationResult =
                    await translationResponse.json();


                if (
                    translationResult.data
                ) {

                    translationData =
                        translationResult.data.ayahs;

                }

            }

            catch (error) {

                console.error(error);

            }

        }


        renderAyahs(
            currentAyahs,
            translationData
        );


        surahLoading?.classList.add(
            "hidden"
        );


        // اگر از ادامه مطالعه باز شده
        if (
            lastRead &&
            lastRead.surah === number
        ) {

            setTimeout(() => {

                const element =
                    document.getElementById(
                        `ayah-${lastRead.ayah}`
                    );

                element?.scrollIntoView({

                    behavior: "smooth",
                    block: "center"

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

    ayahContainer.innerHTML = "";


    ayahs.forEach((ayah, index) => {

        const translation =
            translationsData?.[index]?.text || "";


        const isBookmarked =
            bookmarks.some(
                item =>

                    item.surah ===
                    ayah.surah.number

                    &&

                    item.ayah ===
                    ayah.numberInSurah
            );


        const ayahElement =
            document.createElement("article");


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
                        title="پخش آیه">

                        ▶

                    </button>


                    <button
                        class="ayah-bookmark"
                        type="button"
                        title="نشان‌گذاری">

                        ${isBookmarked ? "🔖" : "🔗"}

                    </button>

                </div>

            </div>


            <p class="ayah-arabic">

                ${ayah.text}

            </p>


            ${translation
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
            () => {

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
            () => {

                toggleBookmark(
                    ayah
                );

                bookmarkButton.textContent =
                    bookmarks.some(
                        item =>

                            item.surah ===
                            ayah.surah.number

                            &&

                            item.ayah ===
                            ayah.numberInSurah
                    )

                    ? "🔖"
                    : "🔗";

            }
        );


        // ذخیره آخرین آیه هنگام کلیک
        ayahElement.addEventListener(
            "click",
            event => {

                if (
                    event.target.tagName ===
                    "BUTTON"
                ) return;


                saveLastRead(ayah);

            }
        );


        ayahContainer.appendChild(
            ayahElement
        );

    });

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

                item.surah ===
                ayah.surah.number

                &&

                item.ayah ===
                ayah.numberInSurah
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
// نمایش نشان‌شده‌ها
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


    bookmarkList.innerHTML = "";


    bookmarks.forEach(item => {

        const card =
            document.createElement("button");


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

                openSurah(
                    item.surah
                );


                lastRead = item;

                localStorage.setItem(
                    "quranLastRead",
                    JSON.stringify(lastRead)
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

            showToast(
                "پخش صوت ممکن نشد"
            );

        });


    audio.onended =
        () => {

            isPlaying = false;

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


    let index = 0;


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


        audio =
            new Audio(
                ayah.audio
            );


        isPlaying = true;


        surahAudioButton.textContent =
            `⏸ توقف • ${toPersianNumber(
                index + 1
            )}`;


        audio.play()
            .catch(error => {

                console.error(error);

                stopAudio();

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

        audio.currentTime = 0;

    }


    isPlaying =
        false;


    if (surahAudioButton) {

        surahAudioButton.textContent =
            "🎧 پخش سوره";

    }


    document
        .querySelectorAll(
            ".ayah-play"
        )
        .forEach(button => {

            button.textContent =
                "▶";

        });

}


// ===============================
// تغییر ترجمه
// ===============================

translationSelect?.addEventListener(
    "change",
    () => {

        if (currentSurah) {

            openSurah(
                currentSurah
            );

        }

    }
);


// ===============================
// جستجوی آیات
// ===============================

async function searchAyahs() {

    const query =
        ayahSearchInput?.value.trim();


    if (!query) {

        searchResults.innerHTML = `

            <div class="empty-search">

                عبارت موردنظر را وارد کنید.

            </div>

        `;

        return;

    }


    searchResults.innerHTML = `

        <div class="search-loading">

            در حال جستجو...

        </div>

    `;


    try {

        // جستجوی فارسی با ترجمه مکارم
        const response =
            await fetch(
                `${API}/search/${encodeURIComponent(
                    query
                )}/all/fa.makarem`
            );


        const result =
            await response.json();


        if (
            !result.data ||
            !result.data.matches
        ) {

            throw new Error(
                "نتیجه‌ای پیدا نشد"
            );

        }


        renderSearchResults(
            result.data.matches
        );

    }

    catch (error) {

        console.error(error);


        searchResults.innerHTML = `

            <div class="empty-search">

                نتیجه‌ای پیدا نشد یا اتصال با سرور برقرار نشد.

            </div>

        `;

    }

}


// ===============================
// نمایش نتایج جستجو
// ===============================

function renderSearchResults(matches) {

    if (!matches.length) {

        searchResults.innerHTML = `

            <div class="empty-search">

                نتیجه‌ای پیدا نشد.

            </div>

        `;

        return;

    }


    searchResults.innerHTML = "";


    matches.slice(
        0,
        50
    ).forEach(match => {

        const item =
            document.createElement("button");


        item.type =
            "button";


        item.className =
            "search-result-item";


        item.innerHTML = `

            <strong>

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

                closeModal(
                    searchModal
                );


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


    if (savedTheme === "dark") {

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


    themeButton.textContent =
        isDark
            ? "☀️"
            : "🌙";

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
            event.key !== "Enter"
        ) {

            return;

        }


        const query =
            normalizeText(
                event.target.value
            );


        // شماره سوره
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


        // اگر فقط یک نتیجه پیدا شد
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
            event.key === "Enter"
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
                event.target === modal
            ) {

                if (
                    modal === surahModal
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
// کلید ESC
// ===============================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) return;


        stopAudio();


        closeModal(
            surahModal
        );

        closeModal(
            searchModal
        );

        closeModal(
            continueModal
        );

    }
);


// ===============================
// منوی موبایل
// ===============================

menuButton?.addEventListener(
    "click",
    () => {

        const nav =
            document.querySelector(
                ".nav"
            );


        nav?.classList.toggle(
            "show"
        );

    }
);


// ===============================
// شروع برنامه
// ===============================

loadTheme();

renderBookmarks();

loadSurahs();
