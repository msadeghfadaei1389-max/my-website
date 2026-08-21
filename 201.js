const API = "https://api.alquran.cloud/v1";

const surahSelect =
    document.getElementById("surahSelect");

const reciterSelect =
    document.getElementById("reciterSelect");

const translationSelect =
    document.getElementById("translationSelect");

const ayahContainer =
    document.getElementById("ayahContainer");

const surahName =
    document.getElementById("surahName");

const surahInfo =
    document.getElementById("surahInfo");

const audioPlayer =
    document.getElementById("audioPlayer");

const playerTitle =
    document.getElementById("playerTitle");

const playerStatus =
    document.getElementById("playerStatus");

const playSurahBtn =
    document.getElementById("playSurahBtn");

const prevBtn =
    document.getElementById("prevBtn");

const nextBtn =
    document.getElementById("nextBtn");

const stopBtn =
    document.getElementById("stopBtn");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const darkModeBtn =
    document.getElementById("darkModeBtn");


let currentSurah = null;

let currentAyahs = [];

let currentIndex = 0;

let playingSurah = false;


/* -------------------------
   دریافت لیست سوره‌ها
------------------------- */

async function loadSurahs() {

    try {

        const response =
            await fetch(`${API}/surah`);

        const result =
            await response.json();

        surahSelect.innerHTML =
            '<option value="">انتخاب سوره</option>';

        result.data.forEach(surah => {

            const option =
                document.createElement("option");

            option.value =
                surah.number;

            option.textContent =
                `${surah.number}. ${surah.name} — ${surah.englishName}`;

            surahSelect.appendChild(option);
        });

    } catch (error) {

        surahSelect.innerHTML =
            '<option>خطا در دریافت سوره‌ها</option>';

        console.error(error);
    }
}


/* -------------------------
   دریافت سوره
------------------------- */

async function loadSurah() {

    const number =
        surahSelect.value;

    if (!number) return;

    stopAudio();

    ayahContainer.innerHTML =
        `<div class="loading">
            در حال دریافت آیات...
        </div>`;

    try {

        const translation =
            translationSelect.value;

        const url =
            `${API}/surah/${number}/editions/quran-uthmani,${translation}`;

        const response =
            await fetch(url);

        const result =
            await response.json();

        const arabic =
            result.data[0];

        const translated =
            result.data[1];

        currentSurah =
            arabic;

        currentAyahs =
            arabic.ayahs.map(
                (ayah, index) => ({

                    number:
                        ayah.number,

                    numberInSurah:
                        ayah.numberInSurah,

                    text:
                        ayah.text,

                    translation:
                        translated.ayahs[index].text
                })
            );

        currentIndex = 0;

        renderSurah();

        saveLastSurah();

    } catch (error) {

        ayahContainer.innerHTML =
            `<div class="loading">
                دریافت اطلاعات با خطا مواجه شد.
            </div>`;

        console.error(error);
    }
}


/* -------------------------
   نمایش آیات
------------------------- */

function renderSurah() {

    surahName.textContent =
        currentSurah.name;

    surahInfo.textContent =
        `${currentSurah.englishName} | ${currentSurah.numberOfAyahs} آیه`;

    ayahContainer.innerHTML = "";

    currentAyahs.forEach(
        (ayah, index) => {

            const article =
                document.createElement("article");

            article.className =
                "ayah";

            article.id =
                `ayah-${index}`;

            article.innerHTML = `

                <span class="ayah-number">
                    ${ayah.numberInSurah}
                </span>

                <div class="arabic">
                    ${ayah.text}
                </div>

                <div class="translation">
                    ${ayah.translation}
                </div>

                <div class="ayah-actions">

                    <button
                        onclick="playAyah(${index})">
                        ▶ پخش
                    </button>

                    <button
                        onclick="bookmarkAyah(${index})">
                        ⭐ نشان‌گذاری
                    </button>

                </div>
            `;

            ayahContainer.appendChild(article);
        }
    );
}


/* -------------------------
   پخش یک آیه
------------------------- */

function playAyah(index) {

    if (
        !currentSurah ||
        !currentAyahs[index]
    ) return;

    currentIndex = index;

    playingSurah = false;

    playCurrentAyah();
}


/* -------------------------
   پخش آیه فعلی
------------------------- */

function playCurrentAyah() {

    const ayah =
        currentAyahs[currentIndex];

    if (!ayah) return;

    const reciter =
        reciterSelect.value;

    /*
      شماره عمومی آیه در کل قرآن
      از API دریافت شده است.
    */

    const audioUrl =
        `https://cdn.islamic.network/quran/audio/128/${reciter}/${ayah.number}.mp3`;

    audioPlayer.src =
        audioUrl;

    playerTitle.textContent =
        `آیه ${ayah.numberInSurah}`;

    playerStatus.textContent =
        `قاری: ${getReciterName()}`;

    highlightAyah();

    audioPlayer.play()
        .catch(error => {
            console.log(
                "پخش صوت نیاز به لمس کاربر دارد.",
                error
            );
        });
}


/* -------------------------
   پخش کل سوره
------------------------- */

function playWholeSurah() {

    if (!currentAyahs.length) {

        alert("ابتدا یک سوره انتخاب کنید.");

        return;
    }

    playingSurah = true;

    currentIndex = 0;

    playCurrentAyah();

    playSurahBtn.textContent =
        "🔊 در حال پخش سوره";
}


/* -------------------------
   رفتن به آیه بعد
------------------------- */

function nextAyah() {

    if (
        currentIndex <
        currentAyahs.length - 1
    ) {

        currentIndex++;

        playCurrentAyah();

        return;
    }

    playingSurah = false;

    playSurahBtn.textContent =
        "▶ پخش کل سوره";

    playerStatus.textContent =
        "سوره به پایان رسید.";
}


/* -------------------------
   آیه قبلی
------------------------- */

function previousAyah() {

    if (currentIndex > 0) {

        currentIndex--;

        playCurrentAyah();
    }
}


/* -------------------------
   بعد از پایان صوت
------------------------- */

audioPlayer.addEventListener(
    "ended",
    () => {

        if (playingSurah) {

            nextAyah();

        } else {

            playerStatus.textContent =
                "پخش آیه تمام شد.";
        }
    }
);


/* -------------------------
   توقف
------------------------- */

function stopAudio() {

    audioPlayer.pause();

    audioPlayer.currentTime = 0;

    playingSurah = false;

    playSurahBtn.textContent =
        "▶ پخش کل سوره";

    playerStatus.textContent =
        "پخش متوقف شد.";
}


/* -------------------------
   هایلایت آیه
------------------------- */

function highlightAyah() {

    document
        .querySelectorAll(".ayah")
        .forEach(element => {

            element.classList.remove(
                "active"
            );
        });

    const active =
        document.getElementById(
            `ayah-${currentIndex}`
        );

    if (!active) return;

    active.classList.add("active");

    active.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* -------------------------
   نام قاری
------------------------- */

function getReciterName() {

    return reciterSelect
        .options[
            reciterSelect.selectedIndex
        ]
        .textContent
        .trim();
}


/* -------------------------
   تغییر قاری
------------------------- */

reciterSelect.addEventListener(
    "change",
    () => {

        if (!currentAyahs.length)
            return;

        if (!audioPlayer.paused) {

            playCurrentAyah();
        }
    }
);


/* -------------------------
   تغییر ترجمه
------------------------- */

translationSelect.addEventListener(
    "change",
    () => {

        if (surahSelect.value) {

            loadSurah();
        }
    }
);


/* -------------------------
   انتخاب سوره
------------------------- */

surahSelect.addEventListener(
    "change",
    loadSurah
);


/* -------------------------
   دکمه‌ها
------------------------- */

playSurahBtn.addEventListener(
    "click",
    playWholeSurah
);

nextBtn.addEventListener(
    "click",
    nextAyah
);

prevBtn.addEventListener(
    "click",
    previousAyah
);

stopBtn.addEventListener(
    "click",
    stopAudio
);


/* -------------------------
   جستجوی ساده
------------------------- */

function searchAyahs() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    if (!query) {

        renderSurah();

        return;
    }

    if (!currentAyahs.length)
        return;

    const results =
        currentAyahs.filter(
            ayah =>
                ayah.text
                    .toLowerCase()
                    .includes(query) ||
                ayah.translation
                    .toLowerCase()
                    .includes(query)
        );

    ayahContainer.innerHTML = "";

    if (!results.length) {

        ayahContainer.innerHTML =
            `<div class="loading">
                آیه‌ای پیدا نشد.
            </div>`;

        return;
    }

    results.forEach(ayah => {

        const originalIndex =
            currentAyahs.indexOf(ayah);

        const article =
            document.createElement("article");

        article.className =
            "ayah";

        article.innerHTML = `

            <span class="ayah-number">
                ${ayah.numberInSurah}
            </span>

            <div class="arabic">
                ${ayah.text}
            </div>

            <div class="translation">
                ${ayah.translation}
            </div>

            <div class="ayah-actions">

                <button
                    onclick="playAyah(${originalIndex})">
                    ▶ پخش
                </button>

            </div>
        `;

        ayahContainer.appendChild(article);
    });
}


searchBtn.addEventListener(
    "click",
    searchAyahs
);


searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchAyahs();
        }
    }
);


/* -------------------------
   نشان‌گذاری آیه
------------------------- */

function bookmarkAyah(index) {

    const bookmarks =
        JSON.parse(
            localStorage.getItem(
                "quranBookmarks"
            )
        ) || [];

    const exists =
        bookmarks.some(
            item =>
                item.surah === currentSurah.number &&
                item.ayah ===
                    currentAyahs[index]
                        .numberInSurah
        );

    if (exists) {

        alert("این آیه قبلاً نشان‌گذاری شده است.");

        return;
    }

    bookmarks.push({

        surah:
            currentSurah.number,

        surahName:
            currentSurah.name,

        ayah:
            currentAyahs[index]
                .numberInSurah

    });

    localStorage.setItem(
        "quranBookmarks",
        JSON.stringify(bookmarks)
    );

    alert("آیه نشان‌گذاری شد ⭐");
}


/* -------------------------
   ذخیره آخرین سوره
------------------------- */

function saveLastSurah() {

    localStorage.setItem(
        "lastSurah",
        surahSelect.value
    );
}


/* -------------------------
   حالت شب
------------------------- */

darkModeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );

        const isDark =
            document.body.classList.contains(
                "dark"
            );

        localStorage.setItem(
            "darkMode",
            isDark ? "1" : "0"
        );

        darkModeBtn.textContent =
            isDark ? "☀️" : "🌙";
    }
);


/* -------------------------
   شروع برنامه
------------------------- */

async function init() {

    if (
        localStorage.getItem(
            "darkMode"
        ) === "1"
    ) {

        document.body.classList.add(
            "dark"
        );

        darkModeBtn.textContent =
            "☀️";
    }

    await loadSurahs();

    const lastSurah =
        localStorage.getItem(
            "lastSurah"
        );

    if (lastSurah) {

        surahSelect.value =
            lastSurah;

        await loadSurah();
    }
}

init();
