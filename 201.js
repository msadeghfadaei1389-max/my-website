const API = "https://api.alquran.cloud/v1";
const AUDIO_CDN = "https://cdn.islamic.network/quran/audio/128";

const $ = id => document.getElementById(id);

const surahGrid = $("surahGrid");
const surahCount = $("surahCount");
const noResults = $("noResults");
const searchInput = $("searchInput");

const surahModal = $("surahModal");
const closeSurah = $("closeSurah");
const modalSurahNumber = $("modalSurahNumber");
const modalSurahName = $("modalSurahName");
const modalSurahInfo = $("modalSurahInfo");
const translationSelect = $("translationSelect");
const reciterSelect = $("reciterSelect");
const ayahContainer = $("ayahContainer");
const surahLoading = $("surahLoading");

const quranAudio = $("quranAudio");
const audioStatus = $("audioStatus");
const surahAudioButton = $("surahAudioButton");
const stopAudioButton = $("stopAudioButton");
const previousAyahButton = $("previousAyahButton");
const nextAyahButton = $("nextAyahButton");

const searchModal = $("searchModal");
const openSearchButton = $("openSearchButton");
const closeSearch = $("closeSearch");
const ayahSearchInput = $("ayahSearchInput");
const ayahSearchButton = $("ayahSearchButton");
const searchResults = $("searchResults");
const searchLoading = $("searchLoading");

const bookmarkList = $("bookmarkList");
const clearBookmarks = $("clearBookmarks");

const continueButton = $("continueButton");
const continueModal = $("continueModal");
const closeContinue = $("closeContinue");
const continueText = $("continueText");
const openContinue = $("openContinue");

const randomButton = $("randomButton");
const themeButton = $("themeButton");
const menuButton = $("menuButton");
const nav = $("nav");
const toast = $("toast");


let surahs = [];
let currentSurah = null;
let currentAyahs = [];
let currentTranslation = [];
let currentTranslationEdition = "";

let availableTranslations = [];
let availableReciters = [];

let currentAudioIndex = 0;
let playMode = "stopped";
let searchMode = "smart";
let searchCache = new Map();

const DEFAULT_TRANSLATION =
    localStorage.getItem("quranTranslation") || "";

const DEFAULT_RECITER =
    localStorage.getItem("quranReciter") || "";


/* ================= HELPERS ================= */

function toPersianNumber(value) {
    return String(value).replace(
        /\d/g,
        digit => "۰۱۲۳۴۵۶۷۸۹"[digit]
    );
}


function normalizeNumber(value) {
    return String(value)
        .replace(/[۰٠]/g, "0")
        .replace(/[۱١]/g, "1")
        .replace(/[۲٢]/g, "2")
        .replace(/[۳٣]/g, "3")
        .replace(/[۴٤]/g, "4")
        .replace(/[۵٥]/g, "5")
        .replace(/[۶٦]/g, "6")
        .replace(/[۷٧]/g, "7")
        .replace(/[۸٨]/g, "8")
        .replace(/[۹٩]/g, "9");
}


function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670]/g, "")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ى/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/ة/g, "ه")
        .replace(/\s+/g, " ")
        .trim();
}


function isPersianText(text) {
    return /[پچژگکی]/.test(text);
}


function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(
        () => toast.classList.remove("show"),
        2600
    );
}


function openModal(modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}


function closeModal(modal) {
    modal.classList.remove("active");

    if (!document.querySelector(".modal.active")) {
        document.body.style.overflow = "";
    }
}


async function api(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("خطا در ارتباط با سرور");
    }

    const json = await response.json();

    if (json.code !== 200) {
        throw new Error(json.data || "خطا در دریافت اطلاعات");
    }

    return json.data;
}


function getStorage(key, fallback) {
    try {
        return JSON.parse(
            localStorage.getItem(key)
        ) ?? fallback;
    } catch {
        return fallback;
    }
}


function setStorage(key, value) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}


/* ================= THEME ================= */

function loadTheme() {
    const theme =
        localStorage.getItem("quranTheme");

    if (theme === "dark") {
        document.body.classList.add("dark");
        themeButton.textContent = "☀️";
    }
}


themeButton.addEventListener(
    "click",
    () => {
        const dark =
            document.body.classList.toggle("dark");

        localStorage.setItem(
            "quranTheme",
            dark ? "dark" : "light"
        );

        themeButton.textContent =
            dark ? "☀️" : "🌙";
    }
);


/* ================= MENU ================= */

menuButton.addEventListener(
    "click",
    () => nav.classList.toggle("active")
);

nav.querySelectorAll("a").forEach(
    link => {
        link.addEventListener(
            "click",
            () => nav.classList.remove("active")
        );
    }
);


/* ================= SURAHS ================= */

async function loadSurahs() {
    try {
        const data = await api(
            `${API}/surah`
        );

        surahs =
            Array.isArray(data)
                ? data
                : data.surahs || [];

        renderSurahs();

    } catch {
        surahGrid.innerHTML = `
            <div class="empty-message">
                <h3>ارتباط برقرار نشد</h3>
                <p>اتصال اینترنت را بررسی و صفحه را دوباره باز کنید.</p>
            </div>
        `;
    }
}


function renderSurahs(list = surahs) {
    surahGrid.innerHTML = "";

    surahCount.textContent =
        `${toPersianNumber(list.length)} سوره`;

    noResults.classList.toggle(
        "hidden",
        list.length !== 0
    );

    list.forEach(
        surah => {
            const button =
                document.createElement("button");

            button.type = "button";
            button.className = "surah-card";

            button.innerHTML = `
                <span class="surah-number">
                    ${toPersianNumber(surah.number)}
                </span>

                <span class="surah-card-info">
                    <strong>
                        ${escapeHtml(surah.englishName)}
                    </strong>

                    <small>
                        ${toPersianNumber(surah.numberOfAyahs)} آیه
                        ·
                        ${surah.revelationType === "Meccan"
                            ? "مکی"
                            : "مدنی"
                        }
                    </small>
                </span>

                <span class="surah-name-arabic">
                    ${escapeHtml(surah.name)}
                </span>
            `;

            button.addEventListener(
                "click",
                () => openSurah(surah.number)
            );

            surahGrid.appendChild(button);
        }
    );
}


searchInput.addEventListener(
    "input",
    () => {
        const query =
            normalizeText(
                normalizeNumber(searchInput.value)
            );

        if (!query) {
            renderSurahs();
            return;
        }

        const results = surahs.filter(
            surah => {
                const values = [
                    surah.number,
                    surah.name,
                    surah.englishName,
                    surah.englishNameTranslation,
                    `سوره ${surah.number}`
                ]
                    .map(normalizeText)
                    .join(" ");

                return values.includes(query);
            }
        );

        renderSurahs(results);
    }
);


/* ================= EDITIONS ================= */

async function loadEditions() {
    try {
        const editions = await api(
            `${API}/edition?format=text`
        );

        availableTranslations =
            editions.filter(
                edition =>
                    edition.language === "fa" &&
                    edition.type === "translation"
            );

        if (!availableTranslations.length) {
            availableTranslations = editions.filter(
                edition =>
                    edition.language === "fa"
            );
        }

        translationSelect.innerHTML = "";

        const none =
            document.createElement("option");

        none.value = "";
        none.textContent = "بدون ترجمه";

        translationSelect.appendChild(none);

        availableTranslations.forEach(
            edition => {
                const option =
                    document.createElement("option");

                option.value =
                    edition.identifier;

                option.textContent =
                    edition.name ||
                    edition.englishName ||
                    edition.identifier;

                translationSelect.appendChild(option);
            }
        );

        const saved =
            availableTranslations.some(
                item =>
                    item.identifier === DEFAULT_TRANSLATION
            )
                ? DEFAULT_TRANSLATION
                : availableTranslations[0]?.identifier || "";

        translationSelect.value = saved;
        currentTranslationEdition = saved;

        if (saved) {
            localStorage.setItem(
                "quranTranslation",
                saved
            );
        }

    } catch {
        translationSelect.innerHTML =
            `<option value="">بدون ترجمه</option>`;
    }

    try {
        const editions = await api(
            `${API}/edition?format=audio`
        );

        availableReciters =
            editions.filter(
                edition =>
                    edition.language === "ar"
            );

        reciterSelect.innerHTML = "";

        availableReciters.forEach(
            edition => {
                const option =
                    document.createElement("option");

                option.value =
                    edition.identifier;

                option.textContent =
                    edition.name ||
                    edition.englishName ||
                    edition.identifier;

                reciterSelect.appendChild(option);
            }
        );

        const preferred =
            availableReciters.find(
                item =>
                    item.identifier === DEFAULT_RECITER
            ) ||
            availableReciters.find(
                item =>
                    item.identifier === "ar.alafasy"
            ) ||
            availableReciters[0];

        if (preferred) {
            reciterSelect.value =
                preferred.identifier;

            localStorage.setItem(
                "quranReciter",
                preferred.identifier
            );
        }

    } catch {
        reciterSelect.innerHTML =
            `<option value="ar.alafasy">مشاری راشد العفاسی</option>`;
    }
}


translationSelect.addEventListener(
    "change",
    async () => {
        currentTranslationEdition =
            translationSelect.value;

        localStorage.setItem(
            "quranTranslation",
            currentTranslationEdition
        );

        if (currentSurah) {
            await loadCurrentTranslation();
            renderAyahs();
        }
    }
);


reciterSelect.addEventListener(
    "change",
    () => {
        localStorage.setItem(
            "quranReciter",
            reciterSelect.value
        );

        stopAudio(false);

        showToast(
            "قاری انتخاب شد."
        );
    }
);


/* ================= SURAH ================= */

async function openSurah(number, focusAyah = null) {
    try {
        stopAudio(false);

        openModal(surahModal);

        ayahContainer.innerHTML = "";
        surahLoading.classList.remove("hidden");

        currentSurah =
            surahs.find(
                item =>
                    item.number === Number(number)
            ) || null;

        const data = await api(
            `${API}/surah/${number}`
        );

        currentSurah = data;
        currentAyahs = data.ayahs || [];

        modalSurahNumber.textContent =
            toPersianNumber(data.number);

        modalSurahName.textContent =
            data.name;

        modalSurahInfo.textContent =
            `${data.englishName} · ${toPersianNumber(data.numberOfAyahs)} آیه`;

        await loadCurrentTranslation();

        renderAyahs();

        surahLoading.classList.add("hidden");

        if (focusAyah) {
            setTimeout(
                () => focusAyahIntoView(focusAyah),
                150
            );
        }

    } catch {
        surahLoading.classList.add("hidden");

        ayahContainer.innerHTML = `
            <div class="empty-message">
                <h3>دریافت سوره ناموفق بود</h3>
                <p>لطفاً اتصال اینترنت را بررسی کنید.</p>
            </div>
        `;
    }
}


async function loadCurrentTranslation() {
    currentTranslation = [];

    if (!currentTranslationEdition) {
        return;
    }

    try {
        const data = await api(
            `${API}/surah/${currentSurah.number}/${encodeURIComponent(currentTranslationEdition)}`
        );

        currentTranslation =
            data.ayahs || [];

    } catch {
        currentTranslation = [];

        showToast(
            "ترجمه انتخاب‌شده در دسترس نیست."
        );
    }
}


function getLastRead() {
    return getStorage(
        "quranLastRead",
        null
    );
}


function renderAyahs() {
    ayahContainer.innerHTML = "";

    const lastRead =
        getLastRead();

    currentAyahs.forEach(
        (ayah, index) => {
            const translation =
                currentTranslation[index]?.text || "";

            const saved =
                isBookmarked(ayah.number);

            const isLastRead =
                lastRead &&
                lastRead.globalAyah === ayah.number;

            const card =
                document.createElement("article");

            card.className =
                `ayah-card ${isLastRead ? "last-read" : ""}`;

            card.id =
                `ayah-${ayah.numberInSurah}`;

            card.innerHTML = `
                <div class="ayah-top">

                    <span class="ayah-number">
                        آیه ${toPersianNumber(ayah.numberInSurah)}
                    </span>

                    <div class="ayah-actions">

                        <button
                            class="ayah-action play"
                            type="button"
                            title="پخش آیه"
                        >
                            ▶
                        </button>

                        <button
                            class="ayah-action bookmark ${saved ? "saved" : ""}"
                            type="button"
                            title="نشان‌گذاری"
                        >
                            🔖
                        </button>

                        <button
                            class="ayah-action copy"
                            type="button"
                            title="کپی"
                        >
                            ⧉
                        </button>

                        <button
                            class="ayah-action share"
                            type="button"
                            title="اشتراک‌گذاری"
                        >
                            ↗
                        </button>

                    </div>

                </div>

                <div class="ayah-arabic">
                    ${escapeHtml(ayah.text)}
                </div>

                ${
                    translation
                        ? `
                            <p class="ayah-translation">
                                ${escapeHtml(translation)}
                            </p>
                        `
                        : ""
                }
            `;

            card.addEventListener(
                "click",
                event => {
                    if (
                        event.target.closest("button")
                    ) {
                        return;
                    }

                    saveLastRead(ayah);
                }
            );

            card.querySelector(".play")
                .addEventListener(
                    "click",
                    () => {
                        saveLastRead(ayah);
                        currentAudioIndex = index;
                        playMode = "single";
                        playCurrentAyah();
                    }
                );

            card.querySelector(".bookmark")
                .addEventListener(
                    "click",
                    event => {
                        toggleBookmark(
                            ayah,
                            translation
                        );

                        event.currentTarget.classList.toggle(
                            "saved"
                        );
                    }
                );

            card.querySelector(".copy")
                .addEventListener(
                    "click",
                    () => copyAyah(
                        ayah,
                        translation
                    )
                );

            card.querySelector(".share")
                .addEventListener(
                    "click",
                    () => shareAyah(
                        ayah,
                        translation
                    )
                );

            ayahContainer.appendChild(card);
        }
    );
}


function focusAyahIntoView(number) {
    const element =
        $(`ayah-${number}`);

    if (!element) {
        return;
    }

    element.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    element.classList.add("last-read");

    setTimeout(
        () => {
            element.classList.remove("last-read");
        },
        3000
    );
}


/* ================= AUDIO ================= */

function getAudioUrl(ayah) {
    return `${AUDIO_CDN}/${reciterSelect.value}/${ayah.number}.mp3`;
}


async function playCurrentAyah() {
    if (!currentAyahs.length) {
        return;
    }

    if (
        currentAudioIndex < 0 ||
        currentAudioIndex >= currentAyahs.length
    ) {
        return;
    }

    const ayah =
        currentAyahs[currentAudioIndex];

    quranAudio.pause();

    quranAudio.src =
        getAudioUrl(ayah);

    updateAudioUI();

    try {
        await quranAudio.play();

        audioStatus.textContent =
            `در حال پخش آیه ${toPersianNumber(ayah.numberInSurah)}`;

        updateActiveAyah();

    } catch {
        audioStatus.textContent =
            "مرورگر اجازه پخش صوت را نداد.";

        showToast(
            "برای پخش صوت دوباره روی دکمه پخش بزنید."
        );
    }
}


function updateActiveAyah() {
    document
        .querySelectorAll(".ayah-card")
        .forEach(
            item =>
                item.classList.remove(
                    "active-audio"
                )
        );

    const ayah =
        currentAyahs[currentAudioIndex];

    if (!ayah) {
        return;
    }

    const card =
        $(`ayah-${ayah.numberInSurah}`);

    card?.classList.add("active-audio");

    card?.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function updateAudioUI() {
    if (playMode === "surah") {
        surahAudioButton.textContent =
            quranAudio.paused
                ? "▶ ادامه"
                : "⏸ مکث";
    } else {
        surahAudioButton.textContent =
            "▶ پخش سوره";
    }
}


function stopAudio(reset = true) {
    quranAudio.pause();

    quranAudio.removeAttribute("src");
    quranAudio.load();

    playMode = "stopped";

    if (reset) {
        currentAudioIndex = 0;
    }

    document
        .querySelectorAll(".ayah-card")
        .forEach(
            item =>
                item.classList.remove(
                    "active-audio"
                )
        );

    audioStatus.textContent =
        "پخش متوقف شد.";

    updateAudioUI();
}


surahAudioButton.addEventListener(
    "click",
    async () => {
        if (!currentAyahs.length) {
            return;
        }

        if (playMode !== "surah") {
            playMode = "surah";
            currentAudioIndex = 0;
            await playCurrentAyah();
            return;
        }

        if (quranAudio.paused) {
            await quranAudio.play();

            audioStatus.textContent =
                "پخش ادامه یافت.";

        } else {
            quranAudio.pause();

            audioStatus.textContent =
                "پخش مکث شد.";
        }

        updateAudioUI();
    }
);


stopAudioButton.addEventListener(
    "click",
    () => stopAudio()
);


previousAyahButton.addEventListener(
    "click",
    () => {
        if (!currentAyahs.length) {
            return;
        }

        currentAudioIndex =
            Math.max(
                0,
                currentAudioIndex - 1
            );

        playMode = "single";
        playCurrentAyah();
    }
);


nextAyahButton.addEventListener(
    "click",
    () => {
        if (!currentAyahs.length) {
            return;
        }

        currentAudioIndex =
            Math.min(
                currentAyahs.length - 1,
                currentAudioIndex + 1
            );

        playMode = "single";
        playCurrentAyah();
    }
);


quranAudio.addEventListener(
    "ended",
    async () => {
        if (
            playMode === "surah" &&
            currentAudioIndex <
                currentAyahs.length - 1
        ) {
            currentAudioIndex++;
            await playCurrentAyah();

        } else {
            stopAudio(false);

            audioStatus.textContent =
                "پخش سوره به پایان رسید.";
        }
    }
);


quranAudio.addEventListener(
    "pause",
    () => {
        if (
            playMode === "surah" &&
            quranAudio.currentTime > 0
        ) {
            updateAudioUI();
        }
    }
);


/* ================= LAST READ ================= */

function saveLastRead(ayah) {
    if (!currentSurah) {
        return;
    }

    setStorage(
        "quranLastRead",
        {
            surahNumber:
                currentSurah.number,

            surahName:
                currentSurah.name,

            ayahNumber:
                ayah.numberInSurah,

            globalAyah:
                ayah.number,

            text:
                ayah.text,

            time:
                Date.now()
        }
    );
}


continueButton.addEventListener(
    "click",
    () => {
        const saved =
            getLastRead();

        if (!saved) {
            continueText.textContent =
                "هنوز مطالعه‌ای ذخیره نشده است.";

            openContinue.disabled = true;

        } else {
            continueText.textContent =
                `${saved.surahName}، آیه ${toPersianNumber(saved.ayahNumber)}`;

            openContinue.disabled = false;
        }

        openModal(continueModal);
    }
);


openContinue.addEventListener(
    "click",
    async () => {
        const saved =
            getLastRead();

        if (!saved) {
            return;
        }

        closeModal(continueModal);

        await openSurah(
            saved.surahNumber,
            saved.ayahNumber
        );
    }
);


/* ================= BOOKMARKS ================= */

function getBookmarks() {
    return getStorage(
        "quranBookmarks",
        []
    );
}


function isBookmarked(globalAyah) {
    return getBookmarks().some(
        item =>
            item.globalAyah === globalAyah
    );
}


function toggleBookmark(
    ayah,
    translation
) {
    let bookmarks =
        getBookmarks();

    const exists =
        bookmarks.find(
            item =>
                item.globalAyah === ayah.number
        );

    if (exists) {
        bookmarks =
            bookmarks.filter(
                item =>
                    item.globalAyah !== ayah.number
            );

        showToast(
            "نشان‌گذاری حذف شد."
        );

    } else {
        bookmarks.unshift(
            {
                globalAyah:
                    ayah.number,

                surahNumber:
                    currentSurah.number,

                surahName:
                    currentSurah.name,

                ayahNumber:
                    ayah.numberInSurah,

                text:
                    ayah.text,

                translation:
                    translation || ""
            }
        );

        showToast(
            "آیه نشان‌گذاری شد."
        );
    }

    setStorage(
        "quranBookmarks",
        bookmarks
    );

    renderBookmarks();
}


function renderBookmarks() {
    const bookmarks =
        getBookmarks();

    if (!bookmarks.length) {
        bookmarkList.innerHTML = `
            <div class="empty-message">
                <div class="empty-icon">🔖</div>
                <h3>هنوز آیه‌ای ذخیره نشده است</h3>
                <p>روی آیکون نشان‌گذاری در کنار هر آیه بزنید.</p>
            </div>
        `;

        return;
    }

    bookmarkList.innerHTML = "";

    bookmarks.forEach(
        bookmark => {
            const item =
                document.createElement("article");

            item.className =
                "bookmark-item";

            item.innerHTML = `
                <div class="bookmark-item-content">
                    <strong>
                        ${escapeHtml(bookmark.surahName)}
                        · آیه
                        ${toPersianNumber(bookmark.ayahNumber)}
                    </strong>

                    <p>
                        ${escapeHtml(bookmark.text)}
                    </p>
                </div>

                <div class="bookmark-actions">
                    <button
                        class="open-bookmark"
                        type="button"
                    >
                        باز کردن
                    </button>

                    <button
                        class="delete-bookmark"
                        type="button"
                    >
                        حذف
                    </button>
                </div>
            `;

            item.querySelector(".open-bookmark")
                .addEventListener(
                    "click",
                    () =>
                        openSurah(
                            bookmark.surahNumber,
                            bookmark.ayahNumber
                        )
                );

            item.querySelector(".delete-bookmark")
                .addEventListener(
                    "click",
                    () => {
                        const updated =
                            getBookmarks().filter(
                                item =>
                                    item.globalAyah !==
                                    bookmark.globalAyah
                            );

                        setStorage(
                            "quranBookmarks",
                            updated
                        );

                        renderBookmarks();

                        if (currentSurah) {
                            renderAyahs();
                        }
                    }
                );

            bookmarkList.appendChild(item);
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
            !confirm(
                "همه آیات نشان‌شده حذف شوند؟"
            )
        ) {
            return;
        }

        setStorage(
            "quranBookmarks",
            []
        );

        renderBookmarks();

        if (currentSurah) {
            renderAyahs();
        }

        showToast(
            "همه نشان‌گذاری‌ها حذف شدند."
        );
    }
);


/* ================= COPY / SHARE ================= */

function ayahFullText(
    ayah,
    translation = ""
) {
    return `${ayah.text}

${translation ? `ترجمه: ${translation}\n\n` : ""}
سوره ${currentSurah?.name || ""}، آیه ${ayah.numberInSurah || ""}`;
}


async function copyAyah(
    ayah,
    translation
) {
    try {
        await navigator.clipboard.writeText(
            ayahFullText(
                ayah,
                translation
            )
        );

        showToast(
            "آیه کپی شد."
        );

    } catch {
        showToast(
            "کپی در این مرورگر ممکن نشد."
        );
    }
}


async function shareAyah(
    ayah,
    translation
) {
    const text =
        ayahFullText(
            ayah,
            translation
        );

    if (navigator.share) {
        try {
            await navigator.share({
                title: "قرآن کریم",
                text
            });

        } catch {
            /* لغو اشتراک‌گذاری */
        }

    } else {
        await copyAyah(
            ayah,
            translation
        );
    }
}


/* ================= RANDOM ================= */

randomButton.addEventListener(
    "click",
    async () => {
        if (!surahs.length) {
            return;
        }

        const surah =
            surahs[
                Math.floor(
                    Math.random() *
                    surahs.length
                )
            ];

        const ayah =
            Math.floor(
                Math.random() *
                surah.numberOfAyahs
            ) + 1;

        await openSurah(
            surah.number,
            ayah
        );
    }
);


/* ================= SEARCH ================= */

openSearchButton.addEventListener(
    "click",
    () => {
        openModal(searchModal);

        setTimeout(
            () =>
                ayahSearchInput.focus(),
            150
        );
    }
);


document
    .querySelectorAll(".search-tab")
    .forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    document
                        .querySelectorAll(".search-tab")
                        .forEach(
                            tab =>
                                tab.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add(
                        "active"
                    );

                    searchMode =
                        button.dataset.search;
                }
            );
        }
    );


function parseAyahReference(query) {
    const normalized =
        normalizeNumber(query)
            .replace(/\s/g, "")
            .replace(/،/g, ":")
            .replace(/\//g, ":");

    const match =
        normalized.match(
            /^(\d{1,3}):(\d{1,3})$/
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

    return { surah, ayah };
}


async function searchArabic(query) {
    const data = await api(
        `${API}/search/${encodeURIComponent(query)}/all/quran-uthmani`
    );

    return data.matches || [];
}


async function getTranslationForSearch() {
    const edition =
        currentTranslationEdition ||
        translationSelect.value;

    if (!edition) {
        throw new Error(
            "ترجمه‌ای انتخاب نشده است."
        );
    }

    const cacheKey =
        `quranTranslationFull_${edition}`;

    const cached =
        getStorage(
            cacheKey,
            null
        );

    if (cached?.surahs) {
        return cached;
    }

    const data = await api(
        `${API}/quran/${encodeURIComponent(edition)}`
    );

    try {
        setStorage(
            cacheKey,
            data
        );
    } catch {
        /* حافظه مرورگر ممکن است پر باشد */
    }

    return data;
}


async function searchPersian(query) {
    const data =
        await getTranslationForSearch();

    const normalizedQuery =
        normalizeText(query);

    const matches = [];

    const chapters =
        data.surahs || [];

    chapters.forEach(
        surah => {
            (surah.ayahs || []).forEach(
                ayah => {
                    if (
                        normalizeText(
                            ayah.text
                        ).includes(
                            normalizedQuery
                        )
                    ) {
                        matches.push(
                            {
                                surah,
                                ayah
                            }
                        );
                    }
                }
            );
        }
    );

    return matches;
}


async function getArabicAyah(
    surahNumber,
    ayahNumber
) {
    const key =
        `${surahNumber}:${ayahNumber}`;

    if (searchCache.has(key)) {
        return searchCache.get(key);
    }

    const data = await api(
        `${API}/ayah/${key}/quran-uthmani`
    );

    searchCache.set(
        key,
        data
    );

    return data;
}


async function searchAyahs() {
    const rawQuery =
        ayahSearchInput.value.trim();

    const query =
        normalizeNumber(rawQuery);

    if (!query) {
        showToast(
            "عبارت موردنظر را وارد کنید."
        );

        return;
    }

    const reference =
        parseAyahReference(query);

    if (reference) {
        closeModal(searchModal);

        await openSurah(
            reference.surah,
            reference.ayah
        );

        return;
    }

    searchResults.innerHTML = "";
    searchLoading.classList.remove("hidden");

    try {
        let results = [];

        const shouldSearchPersian =
            searchMode === "persian" ||
            (
                searchMode === "smart" &&
                isPersianText(query)
            );

        const shouldSearchArabic =
            searchMode === "arabic" ||
            (
                searchMode === "smart" &&
                !isPersianText(query)
            );

        if (shouldSearchArabic) {
            const arabicResults =
                await searchArabic(query);

            results = arabicResults.map(
                match => ({
                    type: "arabic",
                    surahNumber:
                        match.surah.number,

                    ayahNumber:
                        match.numberInSurah,

                    arabic:
                        match.text,

                    persian: ""
                })
            );
        }

        if (shouldSearchPersian) {
            const persianResults =
                await searchPersian(query);

            results = await Promise.all(
                persianResults
                    .slice(0, 100)
                    .map(
                        async item => {
                            const arabic =
                                await getArabicAyah(
                                    item.surah.number,
                                    item.ayah.numberInSurah
                                );

                            return {
                                type: "persian",
                                surahNumber:
                                    item.surah.number,

                                ayahNumber:
                                    item.ayah.numberInSurah,

                                arabic:
                                    arabic.text,

                                persian:
                                    item.ayah.text
                            };
                        }
                    )
            );
        }

        renderSearchResults(results);

    } catch (error) {
        searchResults.innerHTML = `
            <div class="empty-message">
                <h3>جستجو انجام نشد</h3>
                <p>
                    ${
                        error.message ||
                        "اتصال اینترنت را بررسی کنید."
                    }
                </p>
            </div>
        `;
    } finally {
        searchLoading.classList.add("hidden");
    }
}


function renderSearchResults(results) {
    if (!results.length) {
        searchResults.innerHTML = `
            <div class="empty-message">
                <div class="empty-icon">🔎</div>
                <h3>نتیجه‌ای پیدا نشد</h3>
                <p>عبارت دیگری را امتحان کنید.</p>
            </div>
        `;

        return;
    }

    const limited =
        results.slice(0, 50);

    searchResults.innerHTML = `
        <div class="search-hint">
            ${toPersianNumber(limited.length)}
            نتیجه نمایش داده می‌شود.
        </div>
    `;

    limited.forEach(
        result => {
            const button =
                document.createElement("button");

            button.type = "button";
            button.className = "search-result";

            const surah =
                surahs.find(
                    item =>
                        item.number ===
                        result.surahNumber
                );

            button.innerHTML = `
                <strong>
                    ${escapeHtml(
                        surah?.name ||
                        `سوره ${result.surahNumber}`
                    )}
                    ·
                    آیه ${toPersianNumber(result.ayahNumber)}
                </strong>

                <div class="search-result-arabic">
                    ${escapeHtml(result.arabic)}
                </div>

                ${
                    result.persian
                        ? `
                            <div class="search-result-persian">
                                ${escapeHtml(result.persian)}
                            </div>
                        `
                        : ""
                }
            `;

            button.addEventListener(
                "click",
                async () => {
                    closeModal(searchModal);

                    await openSurah(
                        result.surahNumber,
                        result.ayahNumber
                    );
                }
            );

            searchResults.appendChild(button);
        }
    );
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


/* ================= CLOSE ================= */

closeSurah.addEventListener(
    "click",
    () => {
        stopAudio();
        closeModal(surahModal);
    }
);


closeSearch.addEventListener(
    "click",
    () => closeModal(searchModal)
);


closeContinue.addEventListener(
    "click",
    () => closeModal(continueModal)
);


document
    .querySelectorAll(".modal")
    .forEach(
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
                            stopAudio();
                        }

                        closeModal(modal);
                    }
                }
            );
        }
    );


document.addEventListener(
    "keydown",
    event => {
        if (event.key === "Escape") {
            if (
                surahModal.classList.contains("active")
            ) {
                stopAudio();
                closeModal(surahModal);
            }

            if (
                searchModal.classList.contains("active")
            ) {
                closeModal(searchModal);
            }

            if (
                continueModal.classList.contains("active")
            ) {
                closeModal(continueModal);
            }
        }
    }
);


/* ================= START ================= */

async function start() {
    loadTheme();
    renderBookmarks();

    await Promise.all([
        loadSurahs(),
        loadEditions()
    ]);
}

start();
