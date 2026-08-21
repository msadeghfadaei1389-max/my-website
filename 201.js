"use strict";


/* =========================
   تنظیمات API
========================= */

const API = "https://api.alquran.cloud/v1";

const AUDIO =
    "https://cdn.islamic.network/quran/audio/64/ar.alafasy";


/* =========================
   اطلاعات سوره‌ها
========================= */

const surahs = [
    ["الفاتحة","الفاتحة",7,"مکی"],
    ["البقرة","البقرة",286,"مدنی"],
    ["آل عمران","آل عمران",200,"مدنی"],
    ["النساء","النساء",176,"مدنی"],
    ["المائدة","المائدة",120,"مدنی"],
    ["الأنعام","الأنعام",165,"مکی"],
    ["الأعراف","الأعراف",206,"مکی"],
    ["الأنفال","الأنفال",75,"مدنی"],
    ["التوبة","التوبة",129,"مدنی"],
    ["يونس","يونس",109,"مکی"],
    ["هود","هود",123,"مکی"],
    ["يوسف","يوسف",111,"مکی"],
    ["الرعد","الرعد",43,"مدنی"],
    ["إبراهيم","ابراهيم",52,"مکی"],
    ["الحجر","الحجر",99,"مکی"],
    ["النحل","النحل",128,"مکی"],
    ["الإسراء","الإسراء",111,"مکی"],
    ["الكهف","الكهف",110,"مکی"],
    ["مريم","مريم",98,"مکی"],
    ["طه","طه",135,"مکی"],
    ["الأنبياء","الأنبياء",112,"مکی"],
    ["الحج","الحج",78,"مدنی"],
    ["المؤمنون","المؤمنون",118,"مکی"],
    ["النور","النور",64,"مدنی"],
    ["الفرقان","الفرقان",77,"مکی"],
    ["الشعراء","الشعراء",227,"مکی"],
    ["النمل","النمل",93,"مکی"],
    ["القصص","القصص",88,"مکی"],
    ["العنكبوت","العنكبوت",69,"مکی"],
    ["الروم","الروم",60,"مکی"],
    ["لقمان","لقمان",34,"مکی"],
    ["السجدة","السجدة",30,"مکی"],
    ["الأحزاب","الأحزاب",73,"مدنی"],
    ["سبأ","سبأ",54,"مکی"],
    ["فاطر","فاطر",45,"مکی"],
    ["يس","يس",83,"مکی"],
    ["الصافات","الصافات",182,"مکی"],
    ["ص","ص",88,"مکی"],
    ["الزمر","الزمر",75,"مکی"],
    ["غافر","غافر",85,"مکی"],
    ["فصلت","فصلت",54,"مکی"],
    ["الشورى","الشورى",53,"مکی"],
    ["الزخرف","الزخرف",89,"مکی"],
    ["الدخان","الدخان",59,"مکی"],
    ["الجاثية","الجاثية",37,"مکی"],
    ["الأحقاف","الأحقاف",35,"مکی"],
    ["محمد","محمد",38,"مدنی"],
    ["الفتح","الفتح",29,"مدنی"],
    ["الحجرات","الحجرات",18,"مدنی"],
    ["ق","ق",45,"مکی"],
    ["الذاريات","الذاريات",60,"مکی"],
    ["الطور","الطور",49,"مکی"],
    ["النجم","النجم",62,"مکی"],
    ["القمر","القمر",55,"مکی"],
    ["الرحمن","الرحمن",78,"مدنی"],
    ["الواقعة","الواقعة",96,"مکی"],
    ["الحديد","الحديد",29,"مدنی"],
    ["المجادلة","المجادلة",22,"مدنی"],
    ["الحشر","الحشر",24,"مدنی"],
    ["الممتحنة","الممتحنة",13,"مدنی"],
    ["الصف","الصف",14,"مدنی"],
    ["الجمعة","الجمعة",11,"مدنی"],
    ["المنافقون","المنافقون",11,"مدنی"],
    ["التغابن","التغابن",18,"مدنی"],
    ["الطلاق","الطلاق",12,"مدنی"],
    ["التحريم","التحريم",12,"مدنی"],
    ["الملك","الملك",30,"مکی"],
    ["القلم","القلم",52,"مکی"],
    ["الحاقة","الحاقة",52,"مکی"],
    ["المعارج","المعارج",44,"مکی"],
    ["نوح","نوح",28,"مکی"],
    ["الجن","الجن",28,"مکی"],
    ["المزمل","المزمل",20,"مکی"],
    ["المدثر","المدثر",56,"مکی"],
    ["القيامة","القيامة",40,"مکی"],
    ["الإنسان","الإنسان",31,"مدنی"],
    ["المرسلات","المرسلات",50,"مکی"],
    ["النبأ","النبأ",40,"مکی"],
    ["النازعات","النازعات",46,"مکی"],
    ["عبس","عبس",42,"مکی"],
    ["التكوير","التكوير",29,"مکی"],
    ["الانفطار","الانفطار",19,"مکی"],
    ["المطففين","المطففين",36,"مکی"],
    ["الانشقاق","الانشقاق",25,"مکی"],
    ["البروج","البروج",22,"مکی"],
    ["الطارق","الطارق",17,"مکی"],
    ["الأعلى","الأعلى",19,"مکی"],
    ["الغاشية","الغاشية",26,"مکی"],
    ["الفجر","الفجر",30,"مکی"],
    ["البلد","البلد",20,"مکی"],
    ["الشمس","الشمس",15,"مکی"],
    ["الليل","الليل",21,"مکی"],
    ["الضحى","الضحى",11,"مکی"],
    ["الشرح","الشرح",8,"مکی"],
    ["التين","التين",8,"مکی"],
    ["العلق","العلق",19,"مکی"],
    ["القدر","القدر",5,"مکی"],
    ["البينة","البينة",8,"مدنی"],
    ["الزلزلة","الزلزلة",8,"مدنی"],
    ["العاديات","العاديات",11,"مکی"],
    ["القارعة","القارعة",11,"مکی"],
    ["التكاثر","التكاثر",8,"مکی"],
    ["العصر","العصر",3,"مکی"],
    ["الهمزة","الهمزة",9,"مکی"],
    ["الفيل","الفيل",5,"مکی"],
    ["قريش","قريش",4,"مکی"],
    ["الماعون","الماعون",7,"مکی"],
    ["الكوثر","الكوثر",3,"مکی"],
    ["الكافرون","الكافرون",6,"مکی"],
    ["النصر","النصر",3,"مدنی"],
    ["المسد","المسد",5,"مکی"],
    ["الإخلاص","الإخلاص",4,"مکی"],
    ["الفلق","الفلق",5,"مکی"],
    ["الناس","الناس",6,"مکی"]
];


/* =========================
   عناصر صفحه
========================= */

const surahGrid =
    document.getElementById("surahGrid");

const searchInput =
    document.getElementById("searchInput");

const noResults =
    document.getElementById("noResults");

const surahCount =
    document.getElementById("surahCount");

const surahModal =
    document.getElementById("surahModal");

const closeSurah =
    document.getElementById("closeSurah");

const modalSurahName =
    document.getElementById("modalSurahName");

const modalSurahNumber =
    document.getElementById("modalSurahNumber");

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

const themeButton =
    document.getElementById("themeButton");

const menuButton =
    document.getElementById("menuButton");

const nav =
    document.querySelector(".nav");

const randomButton =
    document.getElementById("randomButton");

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

const bookmarkList =
    document.getElementById("bookmarkList");

const toast =
    document.getElementById("toast");

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


/* =========================
   متغیرهای برنامه
========================= */

let currentSurah = null;

let currentAyahs = [];

let currentAudio = null;

let bookmarks =
    JSON.parse(
        localStorage.getItem("quranBookmarks")
    ) || [];

let lastRead =
    JSON.parse(
        localStorage.getItem("lastRead")
    ) || null;


/* =========================
   اعداد فارسی
========================= */

function persianNumber(number) {

    return String(number).replace(
        /\d/g,
        digit =>
            "۰۱۲۳۴۵۶۷۸۹"[digit]
    );

}


/* =========================
   نمایش سوره‌ها
========================= */

function renderSurahs(list = surahs) {

    surahGrid.innerHTML = "";

    surahCount.textContent =
        `${persianNumber(list.length)} سوره`;

    if (!list.length) {

        noResults.classList.remove("hidden");

        return;

    }

    noResults.classList.add("hidden");


    list.forEach(
        (surah, index) => {

            const card =
                document.createElement("article");

            card.className =
                "surah-card";

            card.innerHTML = `

                <span class="surah-number">

                    ${persianNumber(index + 1)}

                </span>

                <div>

                    <h3>
                        ${surah[0]}
                    </h3>

                    <p>
                        ${surah[2]} آیه • ${surah[3]}
                    </p>

                </div>

            `;


            card.addEventListener(
                "click",
                () => openSurah(index + 1)
            );


            surahGrid.appendChild(card);

        }
    );

}


/* =========================
   جستجوی سوره
========================= */

searchInput.addEventListener(
    "input",
    () => {

        const value =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!value) {

            renderSurahs();

            return;

        }


        const filtered =
            surahs.filter(
                (surah, index) => {

                    return (

                        surah[0]
                            .toLowerCase()
                            .includes(value)

                        ||

                        String(index + 1)
                            .includes(value)

                    );

                }
            );


        renderSurahs(filtered);

    }
);


/* =========================
   باز کردن سوره
========================= */

async function openSurah(number, ayahToOpen = null) {

    currentSurah = number;

    surahModal.classList.add("active");

    document.body.style.overflow = "hidden";

    const info = surahs[number - 1];

    modalSurahName.textContent =
        info[0];

    modalSurahNumber.textContent =
        persianNumber(number);

    modalSurahInfo.textContent =
        `${info[2]} آیه • ${info[3]}`;


    ayahContainer.innerHTML = "";

    surahLoading.style.display = "block";


    try {

        const response =
            await fetch(
                `${API}/surah/${number}`
            );


        if (!response.ok) {
            throw new Error();
        }


        const result =
            await response.json();


        currentAyahs =
            result.data.ayahs;


        renderAyahs();


        if (ayahToOpen) {

            setTimeout(
                () => {

                    const target =
                        document.getElementById(
                            `ayah-${ayahToOpen}`
                        );

                    if (target) {

                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    }

                },
                400
            );

        }

    } catch (error) {

        ayahContainer.innerHTML = `

            <div class="no-results">

                <div>⚠️</div>

                <h3>
                    دریافت قرآن ناموفق بود
                </h3>

                <p>
                    اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.
                </p>

            </div>

        `;

    }


    surahLoading.style.display = "none";

}


/* =========================
   نمایش آیات
========================= */

function renderAyahs() {

    ayahContainer.innerHTML = "";


    currentAyahs.forEach(
        ayah => {

            const element =
                document.createElement("article");

            element.className = "ayah";

            element.id =
                `ayah-${ayah.numberInSurah}`;


            const saved =
                isBookmarked(
                    currentSurah,
                    ayah.numberInSurah
                );


            element.innerHTML = `

                <div class="ayah-top">

                    <span class="ayah-number">

                        ${persianNumber(
                            ayah.numberInSurah
                        )}

                    </span>


                    <div class="ayah-actions">

                        <button
                            class="ayah-action bookmark-btn
                            ${saved ? "active" : ""}"
                            data-ayah="${ayah.numberInSurah}"
                            title="نشانه‌گذاری">

                            ${saved ? "★" : "☆"}

                        </button>


                        <button
                            class="ayah-action play-btn"
                            data-ayah="${ayah.numberInSurah}"
                            title="پخش آیه">

                            ▶

                        </button>

                    </div>

                </div>


                <div class="ayah-text">

                    ${ayah.text}

                </div>


                <div
                    class="translation"
                    id="translation-${ayah.numberInSurah}">

                </div>

            `;


            ayahContainer.appendChild(element);

        }
    );


    attachAyahEvents();

}


/* =========================
   انتخاب مترجم
========================= */

translationSelect.addEventListener(
    "change",
    async () => {

        const edition =
            translationSelect.value;


        document
            .querySelectorAll(".translation")
            .forEach(
                element => {

                    element.innerHTML = "";

                }
            );


        if (!edition) {

            return;

        }


        showToast(
            "در حال دریافت ترجمه..."
        );


        try {

            const response =
                await fetch(
                    `${API}/surah/${currentSurah}/${edition}`
                );


            if (!response.ok) {
                throw new Error();
            }


            const result =
                await response.json();


            result.data.ayahs.forEach(
                translation => {

                    const box =
                        document.getElementById(
                            `translation-${translation.numberInSurah}`
                        );


                    if (box) {

                        box.textContent =
                            translation.text;

                    }

                }
            );


            showToast(
                "ترجمه نمایش داده شد ✓"
            );

        } catch {

            showToast(
                "ترجمه دریافت نشد."
            );

        }

    }
);


/* =========================
   رویدادهای آیه
========================= */

function attachAyahEvents() {

    document
        .querySelectorAll(".bookmark-btn")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const ayah =
                            Number(
                                button.dataset.ayah
                            );

                        toggleBookmark(
                            currentSurah,
                            ayah
                        );

                        renderAyahs();

                        renderBookmarks();

                    }
                );

            }
        );


    document
        .querySelectorAll(".play-btn")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const ayah =
                            currentAyahs.find(
                                item =>
                                    item.numberInSurah ===
                                    Number(
                                        button.dataset.ayah
                                    )
                            );


                        if (ayah) {

                            playAyah(ayah);

                            saveLastRead(
                                currentSurah,
                                ayah.numberInSurah
                            );

                        }

                    }
                );

            }
        );


    document
        .querySelectorAll(".ayah")
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target.closest(
                                "button"
                            )
                        ) {
                            return;
                        }


                        const number =
                            Number(
                                element.id
                                    .replace(
                                        "ayah-",
                                        ""
                                    )
                            );


                        saveLastRead(
                            currentSurah,
                            number
                        );

                    }
                );

            }
        );

}


/* =========================
   پخش آیه
========================= */

function playAyah(ayah) {

    stopAudio();


    const url =
        `${AUDIO}/${ayah.number}.mp3`;


    currentAudio =
        new Audio(url);


    currentAudio.play()
        .catch(
            () => {

                showToast(
                    "برای پخش صوت روی صفحه تعامل کنید."
                );

            }
        );


    showToast(
        `پخش آیه ${persianNumber(
            ayah.numberInSurah
        )}`
    );

}


/* =========================
   پخش کل سوره
========================= */

surahAudioButton.addEventListener(
    "click",
    () => {

        if (!currentSurah) {
            return;
        }


        stopAudio();


        const url =
            `https://cdn.islamic.network/quran/audio-surah/64/ar.alafasy/${currentSurah}.mp3`;


        currentAudio =
            new Audio(url);


        currentAudio.play()
            .catch(
                () => {}
            );


        showToast(
            "پخش سوره شروع شد 🎧"
        );

    }
);


/* =========================
   توقف صوت
========================= */

function stopAudio() {

    if (currentAudio) {

        currentAudio.pause();

        currentAudio.currentTime = 0;

        currentAudio = null;

    }

}


/* =========================
   نشانه‌گذاری
========================= */

function isBookmarked(surah, ayah) {

    return bookmarks.some(
        item =>
            item.surah === surah &&
            item.ayah === ayah
    );

}


function toggleBookmark(surah, ayah) {

    const index =
        bookmarks.findIndex(
            item =>
                item.surah === surah &&
                item.ayah === ayah
        );


    if (index >= 0) {

        bookmarks.splice(index, 1);

        showToast(
            "از نشان‌شده‌ها حذف شد"
        );

    } else {

        const verse =
            currentAyahs.find(
                item =>
                    item.numberInSurah === ayah
            );


        bookmarks.push({

            surah,
            ayah,

            text:
                verse
                    ? verse.text
                    : ""

        });


        showToast(
            "آیه ذخیره شد ★"
        );

    }


    localStorage.setItem(
        "quranBookmarks",
        JSON.stringify(bookmarks)
    );

}


/* =========================
   نمایش نشان‌شده‌ها
========================= */

function renderBookmarks() {

    bookmarkList.innerHTML = "";


    if (!bookmarks.length) {

        bookmarkList.innerHTML = `

            <div class="empty-bookmarks">

                🔖

                <br><br>

                هنوز آیه‌ای ذخیره نکرده‌اید.

            </div>

        `;

        return;

    }


    bookmarks.forEach(
        item => {

            const surah =
                surahs[item.surah - 1];


            const card =
                document.createElement("article");

            card.className =
                "bookmark-card";


            card.innerHTML = `

                <strong>

                    سوره ${surah[0]}
                    • آیه ${persianNumber(item.ayah)}

                </strong>

                <p>
                    ${item.text}
                </p>

            `;


            card.addEventListener(
                "click",
                () => {

                    openSurah(
                        item.surah,
                        item.ayah
                    );

                }
            );


            bookmarkList.appendChild(card);

        }
    );

}


/* =========================
   ذخیره آخرین آیه
========================= */

function saveLastRead(surah, ayah) {

    lastRead = {
        surah,
        ayah
    };


    localStorage.setItem(
        "lastRead",
        JSON.stringify(lastRead)
    );

}


/* =========================
   ادامه مطالعه
========================= */

function openContinueModal() {

    if (!lastRead) {

        continueText.textContent =
            "هنوز هیچ آیه‌ای مطالعه نشده است.";

        openContinue.style.display =
            "none";

    } else {

        const surah =
            surahs[lastRead.surah - 1];


        continueText.textContent =
            `آخرین مطالعه شما: سوره ${surah[0]}، آیه ${persianNumber(lastRead.ayah)}`;


        openContinue.style.display =
            "inline-block";

    }


    continueModal.classList.add("active");

}


continueButton.addEventListener(
    "click",
    openContinueModal
);


openContinue.addEventListener(
    "click",
    () => {

        if (!lastRead) {
            return;
        }


        continueModal.classList.remove(
            "active"
        );


        openSurah(
            lastRead.surah,
            lastRead.ayah
        );

    }
);


/* =========================
   آیه تصادفی
========================= */

randomButton.addEventListener(
    "click",
    async () => {

        const surah =
            Math.floor(
                Math.random() * 114
            ) + 1;


        const info =
            surahs[surah - 1];


        const ayah =
            Math.floor(
                Math.random() * info[2]
            ) + 1;


        openSurah(
            surah,
            ayah
        );

    }
);


/* =========================
   جستجوی آیه
========================= */

searchInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            searchInput.value.trim()
        ) {

            openSearchModal();

        }

    }
);


function openSearchModal() {

    searchModal.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";


    ayahSearchInput.value =
        searchInput.value.trim();


    searchResults.innerHTML = "";

}


ayahSearchButton.addEventListener(
    "click",
    searchAyahs
);


ayahSearchInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            searchAyahs();

        }

    }
);


async function searchAyahs() {

    const query =
        ayahSearchInput.value.trim();


    if (!query) {

        showToast(
            "عبارت جستجو را وارد کنید."
        );

        return;

    }


    searchResults.innerHTML = `

        <div class="loading">

            <div class="spinner"></div>

            در حال جستجو...

        </div>

    `;


    try {

        const response =
            await fetch(
                `${API}/search/${encodeURIComponent(query)}/all`
            );


        if (!response.ok) {
            throw new Error();
        }


        const result =
            await response.json();


        searchResults.innerHTML = "";


        if (
            !result.data ||
            !result.data.matches ||
            !result.data.matches.length
        ) {

            searchResults.innerHTML = `

                <div class="no-results">

                    چیزی پیدا نشد.

                </div>

            `;

            return;

        }


        result.data.matches
            .slice(0, 50)
            .forEach(
                match => {

                    const resultElement =
                        document.createElement(
                            "article"
                        );


                    resultElement.className =
                        "search-result";


                    resultElement.innerHTML = `

                        <small>

                            ${match.surah.name}
                            • آیه
                            ${persianNumber(
                                match.numberInSurah
                            )}

                        </small>

                        <p>
                            ${match.text}
                        </p>

                    `;


                    resultElement.addEventListener(
                        "click",
                        () => {

                            searchModal.classList.remove(
                                "active"
                            );


                            openSurah(
                                match.surah.number,
                                match.numberInSurah
                            );

                        }
                    );


                    searchResults.appendChild(
                        resultElement
                    );

                }
            );


    } catch {

        searchResults.innerHTML = `

            <div class="no-results">

                جستجو انجام نشد.
                اتصال اینترنت را بررسی کنید.

            </div>

        `;

    }

}


/* =========================
   حالت شب
========================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            "quranTheme"
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

        themeButton.textContent =
            "☀️";

    }

}


themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "quranTheme",
            dark
                ? "dark"
                : "light"
        );


        themeButton.textContent =
            dark
                ? "☀️"
                : "🌙";

    }
);


/* =========================
   منوی موبایل
========================= */

menuButton.addEventListener(
    "click",
    () => {

        nav.classList.toggle(
            "active"
        );

    }
);


nav.querySelectorAll("a")
    .forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    nav.classList.remove(
                        "active"
                    );

                }
            );

        }
    );


/* =========================
   بستن پنجره‌ها
========================= */

closeSurah.addEventListener(
    "click",
    () => {

        surahModal.classList.remove(
            "active"
        );

        document.body.style.overflow =
            "";

        stopAudio();

    }
);


closeSearch.addEventListener(
    "click",
    () => {

        searchModal.classList.remove(
            "active"
        );

        document.body.style.overflow =
            "";

    }
);


closeContinue.addEventListener(
    "click",
    () => {

        continueModal.classList.remove(
            "active"
        );

    }
);


[
    surahModal,
    searchModal,
    continueModal
].forEach(
    modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    modal.classList.remove(
                        "active"
                    );

                    document.body.style.overflow =
                        "";

                }

            }
        );

    }
);


/* =========================
   پیام
========================= */

let toastTimer;


function showToast(message) {

    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================
   شروع برنامه
========================= */

renderSurahs();

renderBookmarks();

loadTheme();
