const API = "https://api.alquran.cloud/v1";

const surahGrid = document.getElementById("surahGrid");
const surahCount = document.getElementById("surahCount");
const noResults = document.getElementById("noResults");
const searchInput = document.getElementById("searchInput");

const surahModal = document.getElementById("surahModal");
const closeSurah = document.getElementById("closeSurah");

const modalSurahNumber = document.getElementById("modalSurahNumber");
const modalSurahName = document.getElementById("modalSurahName");
const modalSurahInfo = document.getElementById("modalSurahInfo");

const translationSelect =
    document.getElementById("translationSelect");

const reciterSelect =
    document.getElementById("reciterSelect");

const surahAudioButton =
    document.getElementById("surahAudioButton");

const stopAudioButton =
    document.getElementById("stopAudioButton");

const audioStatus =
    document.getElementById("audioStatus");

const surahLoading =
    document.getElementById("surahLoading");

const ayahContainer =
    document.getElementById("ayahContainer");

const quranAudio =
    document.getElementById("quranAudio");

const searchModal =
    document.getElementById("searchModal");

const openSearchButton =
    document.getElementById("openSearchButton");

const closeSearch =
    document.getElementById("closeSearch");

const ayahSearchInput =
    document.getElementById("ayahSearchInput");

const ayahSearchButton =
    document.getElementById("ayahSearchButton");

const searchResults =
    document.getElementById("searchResults");

const searchLoading =
    document.getElementById("searchLoading");

const bookmarkList =
    document.getElementById("bookmarkList");

const clearBookmarks =
    document.getElementById("clearBookmarks");

const continueButton =
    document.getElementById("continueButton");

const continueModal =
    document.getElementById("continueModal");

const closeContinue =
    document.getElementById("closeContinue");

const continueText =
    document.getElementById("continueText");

const openContinue =
    document.getElementById("openContinue");

const randomButton =
    document.getElementById("randomButton");

const themeButton =
    document.getElementById("themeButton");

const menuButton =
    document.getElementById("menuButton");

const nav =
    document.querySelector(".nav");

const toast =
    document.getElementById("toast");


let surahs = [];
let currentSurah = null;
let currentArabicAyahs = [];
let currentTranslationAyahs = [];

let playlist = [];
let currentAudioIndex = 0;
let playingSurah = false;


function toPersianNumber(value) {

    return String(value).replace(
        /\d/g,
        digit => "۰۱۲۳۴۵۶۷۸۹"[digit]
    );
}


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(
        window.toastTimer
    );

    window.toastTimer = setTimeout(
        () => {
            toast.classList.remove("show");
        },
        2500
    );
}


function openModal(modal) {

    modal.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeModal(modal) {

    modal.classList.remove("active");

    document.body.style.overflow = "";
}


async function fetchJSON(url) {

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات");
    }

    const result = await response.json();

    if (result.code !== 200) {
        throw new Error(
            result.data || "خطایی رخ داد"
        );
    }

    return result.data;
}


/* ================= THEME ================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem("quranTheme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeButton.textContent = "☀️";
    }
}


function toggleTheme() {

    document.body.classList.toggle("dark");

    const dark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "quranTheme",
        dark ? "dark" : "light"
    );

    themeButton.textContent =
        dark ? "☀️" : "🌙";
}


themeButton.addEventListener(
    "click",
    toggleTheme
);


/* ================= MOBILE MENU ================= */

menuButton.addEventListener(
    "click",
    () => {
        nav.classList.toggle("active");
    }
);


nav.querySelectorAll("a").forEach(
    link => {

        link.addEventListener(
            "click",
            () => {
                nav.classList.remove("active");
            }
        );

    }
);


/* ================= LOAD SURAHS ================= */

async function loadSurahs() {

    try {

        const data =
            await fetchJSON(
                `${API}/surah`
            );

        surahs = data;

        renderSurahs();

    } catch (error) {

        surahGrid.innerHTML = `
            <div class="empty-message">
                اتصال برقرار نشد. اینترنت را بررسی کنید.
            </div>
        `;

    }
}


function renderSurahs(list = surahs) {

    surahGrid.innerHTML = "";

    noResults.classList.toggle(
        "hidden",
        list.length > 0
    );

    surahCount.textContent =
        `${toPersianNumber(list.length)} سوره`;

    list.forEach(
        surah => {

            const button =
                document.createElement("button");

            button.className =
                "surah-card";

            button.type =
                "button";

            button.innerHTML = `

                <span class="surah-number">
                    ${toPersianNumber(surah.number)}
                </span>

                <span class="surah-card-info">

                    <strong>
                        ${surah.englishName}
                    </strong>

                    <small>
                        ${toPersianNumber(
                            surah.numberOfAyahs
                        )} آیه
                    </small>

                </span>

                <span class="surah-name-arabic">
                    ${surah.name}
                </span>
            `;

            button.addEventListener(
                "click",
                () => {
                    openSurah(
                        surah.number
                    );
                }
            );

            surahGrid.appendChild(
                button
            );

        }
    );
}


/* ================= SURAH SEARCH ================= */

searchInput.addEventListener(
    "input",
    () => {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();

        if (!query) {

            renderSurahs();

            return;
        }

        const filtered =
            surahs.filter(
                surah => {

                    return (
                        String(
                            surah.number
                        ).includes(query) ||

                        surah.name
                            .toLowerCase()
                            .includes(query) ||

                        surah.englishName
                            .toLowerCase()
                            .includes(query)
                    );

                }
            );

        renderSurahs(
            filtered
        );

    }
);


/* ================= OPEN SURAH ================= */

async function openSurah(number, focusAyah = null) {

    try {

        currentSurah =
            surahs.find(
                item =>
                    item.number === Number(number)
            );

        if (!currentSurah) {

            currentSurah =
                await fetchJSON(
                    `${API}/surah/${number}`
                );
        }

        modalSurahNumber.textContent =
            toPersianNumber(
                currentSurah.number
            );

        modalSurahName.textContent =
            currentSurah.name;

        modalSurahInfo.textContent =
            `${currentSurah.englishName} | ` +
            `${toPersianNumber(
                currentSurah.numberOfAyahs
            )} آیه`;

        ayahContainer.innerHTML = "";

        surahLoading.classList.remove(
            "hidden"
        );

        openModal(
            surahModal
        );

        stopSurahAudio();

        const [arabic, translation] =
            await Promise.all([

                fetchJSON(
                    `${API}/surah/${number}`
                ),

                translationSelect.value
                    ? fetchJSON(
                        `${API}/surah/${number}/${translationSelect.value}`
                    )
                    : Promise.resolve(
                        null
                    )

            ]);

        currentArabicAyahs =
            arabic.ayahs;

        currentTranslationAyahs =
            translation
                ? translation.ayahs
                : [];

        renderAyahs();

        surahLoading.classList.add(
            "hidden"
        );

        if (focusAyah) {

            setTimeout(
                () => {

                    const target =
                        document.getElementById(
                            `ayah-${focusAyah}`
                        );

                    target?.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                },
                300
            );
        }

    } catch (error) {

        surahLoading.classList.add(
            "hidden"
        );

        ayahContainer.innerHTML = `
            <div class="empty-message">
                دریافت آیات با خطا مواجه شد.
            </div>
        `;

    }
}


function renderAyahs() {

    ayahContainer.innerHTML = "";

    currentArabicAyahs.forEach(
        (ayah, index) => {

            const translation =
                currentTranslationAyahs[index];

            const isSaved =
                isBookmarked(
                    ayah.number
                );

            const card =
                document.createElement("article");

            card.className =
                "ayah-card";

            card.id =
                `ayah-${ayah.numberInSurah}`;

            card.innerHTML = `

                <div class="ayah-top">

                    <span class="ayah-number">
                        آیه ${toPersianNumber(
                            ayah.numberInSurah
                        )}
                    </span>

                    <div class="ayah-actions">

                        <button
                            class="play-ayah-button"
                            type="button"
                            title="پخش آیه"
                        >
                            ▶
                        </button>

                        <button
                            class="bookmark-button ${
                                isSaved ? "saved" : ""
                            }"
                            type="button"
                            title="نشان‌گذاری"
                        >
                            🔖
                        </button>

                    </div>

                </div>

                <div class="ayah-arabic">
                    ${ayah.text}
                </div>

                ${
                    translation
                        ? `
                            <p class="ayah-translation">
                                ${translation.text}
                            </p>
                        `
                        : ""
                }
            `;

            card.querySelector(
                ".play-ayah-button"
            ).addEventListener(
                "click",
                () => {

                    saveLastRead(
                        currentSurah,
                        ayah
                    );

                    playSingleAyah(
                        index
                    );

                }
            );

            card.querySelector(
                ".bookmark-button"
            ).addEventListener(
                "click",
                event => {

                    toggleBookmark(
                        currentSurah,
                        ayah,
                        translation
                    );

                    event.currentTarget.classList.toggle(
                        "saved"
                    );

                }
            );

            card.addEventListener(
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
                        currentSurah,
                        ayah
                    );

                }
            );

            ayahContainer.appendChild(
                card
            );

        }
    );
}


/* ================= TRANSLATION ================= */

translationSelect.addEventListener(
    "change",
    () => {

        if (currentSurah) {

            openSurah(
                currentSurah.number
            );

        }

    }
);


/* ================= AUDIO ================= */

async function playSingleAyah(index) {

    try {

        const ayah =
            currentArabicAyahs[index];

        const data =
            await fetchJSON(
                `${API}/ayah/${ayah.number}/${reciterSelect.value}`
            );

        playingSurah = false;

        currentAudioIndex = index;

        quranAudio.src =
            data.audio;

        quranAudio.play();

        updateActiveAyah(
            index
        );

        audioStatus.textContent =
            `در حال پخش آیه ${toPersianNumber(
                ayah.numberInSurah
            )}`;

    } catch (error) {

        showToast(
            "پخش صوت با خطا مواجه شد."
        );

    }
}


async function playSurahAudio() {

    try {

        if (quranAudio.src && playingSurah) {

            if (quranAudio.paused) {

                await quranAudio.play();

                audioStatus.textContent =
                    "ادامه پخش سوره";

            } else {

                quranAudio.pause();

                audioStatus.textContent =
                    "پخش متوقف شد";

            }

            return;
        }

        playingSurah = true;

        currentAudioIndex = 0;

        await loadAndPlayCurrentAyah();

    } catch (error) {

        showToast(
            "امکان پخش صوت وجود ندارد."
        );

    }
}


async function loadAndPlayCurrentAyah() {

    if (
        !currentArabicAyahs.length
    ) {
        return;
    }

    if (
        currentAudioIndex >=
        currentArabicAyahs.length
    ) {

        stopSurahAudio();

        audioStatus.textContent =
            "پخش سوره به پایان رسید.";

        showToast(
            "پخش سوره تمام شد."
        );

        return;
    }

    const ayah =
        currentArabicAyahs[
            currentAudioIndex
        ];

    const data =
        await fetchJSON(
            `${API}/ayah/${ayah.number}/${reciterSelect.value}`
        );

    quranAudio.src =
        data.audio;

    updateActiveAyah(
        currentAudioIndex
    );

    audioStatus.textContent =
        `در حال پخش آیه ${toPersianNumber(
            ayah.numberInSurah
        )}`;

    await quranAudio.play();
}


function stopSurahAudio() {

    quranAudio.pause();

    quranAudio.removeAttribute(
        "src"
    );

    quranAudio.load();

    playingSurah = false;

    currentAudioIndex = 0;

    document
        .querySelectorAll(
            ".ayah-card"
        )
        .forEach(
            item => {
                item.classList.remove(
                    "active-audio"
                );
            }
        );

    surahAudioButton.textContent =
        "▶ پخش سوره";
}


function updateActiveAyah(index) {

    document
        .querySelectorAll(
            ".ayah-card"
        )
        .forEach(
            item => {
                item.classList.remove(
                    "active-audio"
                );
            }
        );

    const card =
        document.getElementById(
            `ayah-${
                currentArabicAyahs[index]
                    .numberInSurah
            }`
        );

    card?.classList.add(
        "active-audio"
    );

    card?.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


surahAudioButton.addEventListener(
    "click",
    playSurahAudio
);


stopAudioButton.addEventListener(
    "click",
    () => {

        stopSurahAudio();

        audioStatus.textContent =
            "پخش متوقف شد.";

    }
);


quranAudio.addEventListener(
    "play",
    () => {

        if (playingSurah) {

            surahAudioButton.textContent =
                "⏸ مکث";

        }

    }
);


quranAudio.addEventListener(
    "pause",
    () => {

        if (
            playingSurah &&
            quranAudio.currentTime > 0
        ) {

            surahAudioButton.textContent =
                "▶ ادامه";

        }

    }
);


quranAudio.addEventListener(
    "ended",
    async () => {

        if (playingSurah) {

            currentAudioIndex++;

            await loadAndPlayCurrentAyah();

        }

    }
);


/* ================= BOOKMARKS ================= */

function getBookmarks() {

    return JSON.parse(
        localStorage.getItem(
            "quranBookmarks"
        ) || "[]"
    );
}


function isBookmarked(ayahNumber) {

    return getBookmarks().some(
        item =>
            item.ayahNumber === ayahNumber
    );
}


function toggleBookmark(
    surah,
    ayah,
    translation
) {

    let bookmarks =
        getBookmarks();

    const exists =
        bookmarks.find(
            item =>
                item.ayahNumber === ayah.number
        );

    if (exists) {

        bookmarks =
            bookmarks.filter(
                item =>
                    item.ayahNumber !== ayah.number
            );

        showToast(
            "نشان‌گذاری حذف شد."
        );

    } else {

        bookmarks.push({
            surahNumber:
                surah.number,

            surahName:
                surah.name,

            ayahNumber:
                ayah.number,

            ayahInSurah:
                ayah.numberInSurah,

            text:
                ayah.text,

            translation:
                translation?.text || ""
        });

        showToast(
            "آیه ذخیره شد."
        );
    }

    localStorage.setItem(
        "quranBookmarks",
        JSON.stringify(
            bookmarks
        )
    );

    renderBookmarks();
}


function renderBookmarks() {

    const bookmarks =
        getBookmarks();

    if (!bookmarks.length) {

        bookmarkList.innerHTML = `
            <div class="empty-message">
                هنوز آیه‌ای نشان‌گذاری نشده است.
            </div>
        `;

        return;
    }

    bookmarkList.innerHTML =
        "";

    bookmarks.forEach(
        bookmark => {

            const item =
                document.createElement("div");

            item.className =
                "bookmark-item";

            item.innerHTML = `

                <div class="bookmark-item-content">

                    <strong>
                        ${bookmark.surahName}
                        | آیه
                        ${toPersianNumber(
                            bookmark.ayahInSurah
                        )}
                    </strong>

                    <p>
                        ${bookmark.text}
                    </p>

                </div>

                <button
                    type="button"
                    class="open-bookmark"
                >
                    باز کردن
                </button>

                <button
                    type="button"
                    class="delete-bookmark"
                >
                    حذف
                </button>
            `;

            item.querySelector(
                ".open-bookmark"
            ).addEventListener(
                "click",
                () => {

                    openSurah(
                        bookmark.surahNumber,
                        bookmark.ayahInSurah
                    );

                }
            );

            item.querySelector(
                ".delete-bookmark"
            ).addEventListener(
                "click",
                () => {

                    const updated =
                        getBookmarks().filter(
                            entry =>
                                entry.ayahNumber !==
                                bookmark.ayahNumber
                        );

                    localStorage.setItem(
                        "quranBookmarks",
                        JSON.stringify(
                            updated
                        )
                    );

                    renderBookmarks();

                    if (
                        currentSurah &&
                        currentSurah.number ===
                            bookmark.surahNumber
                    ) {

                        renderAyahs();
                    }

                }
            );

            bookmarkList.appendChild(
                item
            );

        }
    );
}


clearBookmarks.addEventListener(
    "click",
    () => {

        const bookmarks =
            getBookmarks();

        if (!bookmarks.length) {
            return;
        }

        if (
            confirm(
                "همه آیات نشان‌شده حذف شوند؟"
            )
        ) {

            localStorage.removeItem(
                "quranBookmarks"
            );

            renderBookmarks();

            if (currentSurah) {
                renderAyahs();
            }

            showToast(
                "همه نشان‌گذاری‌ها حذف شدند."
            );
        }

    }
);


/* ================= LAST READ ================= */

function saveLastRead(
    surah,
    ayah
) {

    const data = {

        surahNumber:
            surah.number,

        surahName:
            surah.name,

        ayahNumber:
            ayah.numberInSurah,

        text:
            ayah.text

    };

    localStorage.setItem(
        "quranLastRead",
        JSON.stringify(data)
    );
}


continueButton.addEventListener(
    "click",
    () => {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "quranLastRead"
                ) || "null"
            );

        if (!saved) {

            continueText.textContent =
                "هنوز آخرین آیه‌ای ذخیره نشده است.";

            openContinue.disabled =
                true;

        } else {

            continueText.textContent =
                `آخرین مطالعه: ${saved.surahName}، ` +
                `آیه ${toPersianNumber(
                    saved.ayahNumber
                )}`;

            openContinue.disabled =
                false;
        }

        openModal(
            continueModal
        );

    }
);


openContinue.addEventListener(
    "click",
    () => {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "quranLastRead"
                ) || "null"
            );

        if (!saved) {
            return;
        }

        closeModal(
            continueModal
        );

        openSurah(
            saved.surahNumber,
            saved.ayahNumber
        );

    }
);


/* ================= RANDOM AYAH ================= */

randomButton.addEventListener(
    "click",
    async () => {

        try {

            const random =
                Math.floor(
                    Math.random() * 6236
                ) + 1;

            const data =
                await fetchJSON(
                    `${API}/ayah/${random}`
                );

            await openSurah(
                data.surah.number,
                data.numberInSurah
            );

        } catch (error) {

            showToast(
                "دریافت آیه تصادفی ممکن نشد."
            );

        }

    }
);


/* ================= AYAH SEARCH ================= */

openSearchButton.addEventListener(
    "click",
    () => {

        openModal(
            searchModal
        );

        setTimeout(
            () => {
                ayahSearchInput.focus();
            },
            100
        );

    }
);


async function searchAyahs() {

    const query =
        ayahSearchInput.value.trim();

    if (!query) {

        showToast(
            "عبارت موردنظر را وارد کنید."
        );

        return;
    }

    searchResults.innerHTML =
        "";

    searchLoading.classList.remove(
        "hidden"
    );

    try {

        const data =
            await fetchJSON(
                `${API}/search/${encodeURIComponent(
                    query
                )}/all/ar`
            );

        searchLoading.classList.add(
            "hidden"
        );

        if (!data.matches?.length) {

            searchResults.innerHTML = `
                <div class="empty-message">
                    نتیجه‌ای پیدا نشد.
                </div>
            `;

            return;
        }

        data.matches
            .slice(0, 50)
            .forEach(
                match => {

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "search-result";

                    button.innerHTML = `

                        <strong>
                            ${match.surah.name}
                            | آیه
                            ${toPersianNumber(
                                match.numberInSurah
                            )}
                        </strong>

                        <p>
                            ${match.text}
                        </p>
                    `;

                    button.addEventListener(
                        "click",
                        () => {

                            closeModal(
                                searchModal
                            );

                            openSurah(
                                match.surah.number,
                                match.numberInSurah
                            );

                        }
                    );

                    searchResults.appendChild(
                        button
                    );

                }
            );

    } catch (error) {

        searchLoading.classList.add(
            "hidden"
        );

        searchResults.innerHTML = `
            <div class="empty-message">
                جستجو با خطا مواجه شد.
            </div>
        `;

    }
}


ayahSearchButton.addEventListener(
    "click",
    searchAyahs
);


ayahSearchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            searchAyahs();
        }

    }
);


/* ================= CLOSE MODALS ================= */

closeSurah.addEventListener(
    "click",
    () => {

        stopSurahAudio();

        closeModal(
            surahModal
        );

    }
);


closeSearch.addEventListener(
    "click",
    () => {

        closeModal(
            searchModal
        );

    }
);


closeContinue.addEventListener(
    "click",
    () => {

        closeModal(
            continueModal
        );

    }
);


document.querySelectorAll(
    ".modal"
).forEach(
    modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    if (
                        modal === surahModal
                    ) {
                        stopSurahAudio();
                    }

                    closeModal(
                        modal
                    );

                }

            }
        );

    }
);


/* ================= START ================= */

loadTheme();

loadSurahs();

renderBookmarks();
