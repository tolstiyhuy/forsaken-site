/* ============================================================
   FORSAKEN — interactions
   ============================================================ */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const MAP_IMG_VER = "?v=2";

  /* ---------- helpers ---------- */

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "ADMIN ONLY";
    if (price === 0) return "FREE";
    return price.toLocaleString("ru-RU") + " COINS";
  };

  const initialOf = (name) => name.replace(/[^a-zA-Zа-яА-Я0-9]/g, "").charAt(0).toUpperCase();

  const abilityType = (type) => {
    if (type === "passive") return "ПАССИВ";
    if (type === "ultimate") return "УЛЬТ";
    return "АКТИВ";
  };

  const cleanNumber = (n) => (n === null || n === undefined ? "—" : n.toLocaleString("ru-RU"));

  /* ---------- render: characters ---------- */

  const mediaHTML = (char) => {
    if (char.img) {
      return `<img class="char-card__img" src="${char.img}" alt="${char.name}" loading="lazy" decoding="async" draggable="false">`;
    }
    return `
      <div class="char-fallback" aria-hidden="true">
        <span class="char-fallback__letter">${initialOf(char.name)}</span>
        <span class="char-fallback__tag">RENDER MISSING</span>
      </div>`;
  };

  const charCardHTML = (char, i) => `
    <article class="char-card reveal" data-id="${char.id}" data-rarity="${char.rarity}" style="--accent:${char.accent}; --delay:${i * 60}ms" tabindex="0" role="button" aria-label="Открыть досье: ${char.name}">
      <div class="char-card__media">
        ${mediaHTML(char)}
        <div class="char-card__vignette"></div>
        <div class="char-card__scan"></div>
        <div class="char-card__top">
          <span class="rarity rarity--${char.rarity}">${char.rarityLabel}</span>
          <span class="char-card__price">${formatPrice(char.price)}</span>
        </div>
        <span class="char-card__file">${char.file}</span>
        <span class="char-card__index">${String(i + 1).padStart(2, "0")}</span>
      </div>
      <div class="char-card__body">
        <h3 class="char-card__name">${char.name}</h3>
        <p class="char-card__quote">${char.quote}</p>
        <div class="char-card__stats">
          <div><small>HP</small><b>${cleanNumber(char.hp)}</b></div>
          <div><small>SPEED</small><b>${char.speed}</b></div>
          <div><small>${char.role === "killer" ? "TERROR" : "ABIL"}</small><b>${char.role === "killer" ? char.terror : char.abilities.length}</b></div>
        </div>
        <div class="char-card__open">
          <span>Открыть досье</span>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>
        </div>
      </div>
    </article>`;

  const renderCharacters = () => {
    const kg = $("#killers-grid");
    const sg = $("#survivors-grid");
    if (kg) kg.innerHTML = SITE_DATA.killers.map(charCardHTML).join("");
    if (sg) sg.innerHTML = SITE_DATA.survivors.map(charCardHTML).join("");
  };

  /* ---------- render: maps ---------- */

  const mapCardHTML = (map, i) => `
    <article class="map-card reveal" data-id="${map.id}" style="--c1:${map.c1}; --c2:${map.c2}; --accent:${map.accent}; --delay:${i * 50}ms" tabindex="0" role="button" aria-label="Открыть досье локации: ${map.name}">
      <div class="map-card__art">
        <img class="map-card__photo" src="assets/maps/${map.id}.jpg${MAP_IMG_VER}" alt="" loading="lazy" decoding="async" onerror="this.remove()">
        <div class="map-card__grid"></div>
        <span class="map-card__glyph">${map.glyph}</span>
        <span class="map-card__cross map-card__cross--tl"></span>
        <span class="map-card__cross map-card__cross--br"></span>
        <div class="map-card__noise"></div>
      </div>
      <div class="map-card__top">
        <span class="map-card__tag ${map.tag === "DEV" ? "is-dev" : ""}">${map.tag}</span>
        <span class="map-card__num">${String(i + 1).padStart(2, "0")} / ${String(SITE_DATA.maps.length).padStart(2, "0")}</span>
      </div>
      <div class="map-card__body">
        <div class="map-card__ru">${map.ru}</div>
        <h3>${map.name}</h3>
        <p>${map.desc}</p>
        <div class="map-card__meta">
          <span>${map.type}</span>
          <span>${map.size || "MEDIUM"}</span>
          <span class="map-card__danger">ОПАСНОСТЬ ${"●".repeat(map.danger) || "—"}${"○".repeat(Math.max(0, 5 - map.danger))}</span>
        </div>
        <div class="map-card__open">
          <span>Открыть локацию</span>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>
        </div>
      </div>
    </article>`;

  const renderMaps = () => {
    const grid = $("#maps-grid");
    if (grid) grid.innerHTML = SITE_DATA.maps.map(mapCardHTML).join("");
  };

  const primeMapPhotos = () => {
    $$("#maps-grid .map-card__photo").forEach((img) => {
      if (img.complete && img.naturalWidth) return;
      img.loading = "eager";
      img.src = img.getAttribute("src");
    });
  };

  /* ---------- render: killer comparison ---------- */

  let compareSort = { key: null, dir: 1 };

  const compareRowHTML = (char, i) => `
    <tr class="compare__row" data-id="${char.id}" tabindex="0">
      <td class="compare__rank">${String(i + 1).padStart(2, "0")}</td>
      <td>
        <div class="compare__char">
          <span class="compare__dot" style="--accent:${char.accent}"></span>
          <span><b>${char.name}</b><small>${char.file}</small></span>
        </div>
      </td>
      <td>${cleanNumber(char.hp)}</td>
      <td>${char.speed}</td>
      <td>${char.terror}</td>
      <td>${char.abilities.length}</td>
      <td>${formatPrice(char.price)}</td>
    </tr>`;

  const renderCompare = () => {
    const body = $("#compare-body");
    if (!body) return;
    let list = SITE_DATA.killers.slice();
    if (compareSort.key) {
      const key = compareSort.key;
      list.sort((a, b) => {
        const av = key === "price" && a.price === null ? Infinity : a[key];
        const bv = key === "price" && b.price === null ? Infinity : b[key];
        if (typeof av === "string") return av.localeCompare(bv) * compareSort.dir;
        return (av - bv) * compareSort.dir;
      });
    }
    body.innerHTML = list.map(compareRowHTML).join("");
    $$("#killers-compare th[data-sort]").forEach((th) => {
      const on = th.dataset.sort === compareSort.key;
      th.classList.toggle("is-sorted", on);
      const arrow = $("span", th);
      if (arrow) arrow.textContent = on ? (compareSort.dir > 0 ? "↑" : "↓") : "";
    });
  };

  /* ---------- render: updates ---------- */

  let updateFilter = "all";

  const updateHTML = (entry) => `
    <article class="update" data-cats="${entry.cats.join(" ")}">
      <div class="update__side">
        <div class="update__version">${entry.v}</div>
        <div class="update__weight" aria-label="Масштаб патча ${entry.weight} из 5">
          ${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= entry.weight ? "is-on" : ""}"></i>`).join("")}
        </div>
      </div>
      <div class="update__main">
        <div class="update__head">
          <h3>${entry.title}</h3>
          ${entry.v === "1.0.23" ? '<span class="update__badge">CURRENT</span>' : ""}
        </div>
        <ul class="update__notes">${entry.notes.map((n) => `<li>${n}</li>`).join("")}</ul>
        <div class="update__tags">${entry.tags.map((t) => `<span>${t}</span>`).join("")}</div>
      </div>
    </article>`;

  const renderMilestones = () => {
    const wrap = $("#milestones");
    if (!wrap) return;
    wrap.innerHTML = SITE_DATA.milestones
      .map(
        (m, i) => `
        <article class="milestone reveal">
          <div class="milestone__top"><span>${String(i + 1).padStart(2, "0")}</span><b>${m.v}</b></div>
          <h4>${m.title}</h4>
          <p>${m.text}</p>
        </article>`
      )
      .join("");
  };

  const renderUpdates = () => {
    const list = $("#update-list");
    if (!list) return;
    list.innerHTML = SITE_DATA.devlog
      .filter((e) => updateFilter === "all" || e.cats.includes(updateFilter))
      .map(updateHTML)
      .join("");
    const counter = $("#update-count");
    if (counter) {
      const total = SITE_DATA.devlog.filter((e) => updateFilter === "all" || e.cats.includes(updateFilter)).length;
      counter.textContent = total;
    }
  };

  /* ---------- lore: источник данных ----------
     Единственный источник — lore/manifest.json (владелец: Chat 1).
     Ниже — fallback на хардкод: если fetch упал или JSON битый, сайт работает как раньше. */

  const LORE_FALLBACK_DOCS = {
    chronos: {
      file: "lore/chronos.md",
      cat: "characters",
      name: "Хронос",
      record: "LR-001",
      related: ["LR-000", "LR-011"],
      sub: "Он и есть та самая лишняя секунда.",
      fileLabel: "ЛОР-ДОСЬЕ // LR-001",
      meta: ["13 ГЛАВ", "≈ 25 МИН ЧТЕНИЯ", "СПОЙЛЕРЫ"],
      foot: "Долг всё ещё не закрыт.",
      tocFoot: "ХРОНОС · LR-001",
      download: "Chronos_lore_final.md",
      chapters: [
        { id: "mir", kicker: "ПРОЛОГ", title: "Мир на секундах", from: 1, to: 2 },
        { id: "obryad", kicker: "ГЛАВА 02", title: "Обряд на поле", from: 3, to: 8 },
        { id: "rozhdenie", kicker: "ГЛАВА 03", title: "Лишняя секунда", from: 9, to: 13 },
        { id: "zakon", kicker: "ГЛАВА 04", title: "Закон долга", from: 14, to: 23 },
        { id: "oblik", kicker: "ГЛАВА 05", title: "Человек с циферблатом", from: 24, to: 30 },
        { id: "ohota", kicker: "ГЛАВА 06", title: "Сверхурочные", from: 31, to: 41 },
        { id: "legendy", kicker: "ГЛАВА 07", title: "Что говорят выжившие", from: 42, to: 44 },
        { id: "twotime", kicker: "ГЛАВА 08", title: "Долг, который не закрыть", from: 45, to: 54 },
        { id: "spektr", kicker: "ГЛАВА 09", title: "Хозяин игр", from: 55, to: 56 },
        { id: "johndoe", kicker: "ГЛАВА 10", title: "Первый носитель", from: 57, to: 60 },
        { id: "chetvertye", kicker: "ГЛАВА 11", title: "Четыре единицы", from: 61, to: 66 },
        { id: "slasher", kicker: "ГЛАВА 12", title: "Те, кто платят вперёд", from: 67, to: 78 },
        { id: "tishina", kicker: "ЭПИЛОГ", title: "Тишина без тика", from: 79, to: 89 }
      ]
    },
    place: {
      file: "lore/place.md",
      cat: "place",
      name: "Место",
      record: "LR-000",
      related: ["LR-001", "LR-012"],
      sub: "Вечный ад — это не мир. Это счёт, который ведут.",
      fileLabel: "ЛОР-ДОСЬЕ // LR-000",
      meta: ["9 ГЛАВ", "≈ 18 МИН ЧТЕНИЯ", "СПОЙЛЕРЫ"],
      foot: "Счёт всё ещё открыт.",
      tocFoot: "МЕСТО · LR-000",
      download: "Place_lore_final.md"
    }
  };

  let currentLoreCat = "characters";
  let currentLoreDoc = null;

  let LORE_DOCS = LORE_FALLBACK_DOCS;
  let LORE_GATES = { place: { requires: "chronos" } };
  let LORE_ARCHIVE = [];
  let LORE_BY_RECORD = new Map();
  let LORE_RELATED = new Map();

  const LORE_READ_KEY = "forsaken-lore-read";
  const loreRead = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(LORE_READ_KEY) || "[]");
    if (Array.isArray(saved)) saved.forEach((key) => loreRead.add(key));
  } catch (err) {
    /* localStorage может быть недоступен */
  }

  const saveLoreRead = () => {
    try {
      localStorage.setItem(LORE_READ_KEY, JSON.stringify([...loreRead]));
    } catch (err) {
      /* игнорируем запрет на запись */
    }
  };

  const isLoreRead = (key) => loreRead.has(key);

  const isLoreDocUnlocked = (key) => {
    if (!key || !LORE_DOCS[key]) return false;
    const gate = LORE_GATES[key];
    if (!gate) return true;
    return loreRead.has(gate.requires);
  };

  const isLoreItemOpen = (item) => (item.doc ? isLoreDocUnlocked(item.doc) : false);

  const LORE_PAGE_KEY = "forsaken-lore-pages";
  let lorePages = {};
  try {
    const savedPages = JSON.parse(localStorage.getItem(LORE_PAGE_KEY) || "{}");
    if (savedPages && typeof savedPages === "object") lorePages = savedPages;
  } catch (err) {
    /* localStorage может быть недоступен */
  }

  const lorePageMax = (key) => (Number.isFinite(lorePages[key]) ? lorePages[key] : 0);

  const saveLorePages = () => {
    try {
      localStorage.setItem(LORE_PAGE_KEY, JSON.stringify(lorePages));
    } catch (err) {
      /* игнорируем запрет на запись */
    }
  };

  const unlockLorePage = (key, index) => {
    if (index <= lorePageMax(key)) return;
    lorePages[key] = index;
    saveLorePages();
  };

  /* F-10: «где я остановился». Живёт в том же хранилище под ключом __last —
     старый формат (число на запись) остаётся нетронутым. */
  const chapterTitleOf = (key, chapterId) => {
    const cached = loreCache[key];
    if (!cached || !chapterId) return null;
    const ch = cached.chapters.find((c) => c.id === chapterId);
    return ch ? ch.title : null;
  };

  const rememberLoreSpot = (key, chapterId) => {
    if (!key) return;
    lorePages.__last = {
      doc: key,
      chapter: chapterId || null,
      chapterTitle: chapterTitleOf(key, chapterId),
      at: Date.now()
    };
    saveLorePages();
  };

  const lastLoreSpot = () => {
    const spot = lorePages.__last;
    if (!spot || typeof spot !== "object" || !spot.doc || !LORE_DOCS[spot.doc]) return null;
    const doc = LORE_DOCS[spot.doc];
    return {
      doc: spot.doc,
      record: doc.record || spot.doc,
      name: doc.name,
      chapter: typeof spot.chapter === "string" ? spot.chapter : null,
      chapterTitle: typeof spot.chapterTitle === "string" ? spot.chapterTitle : null,
      at: Number(spot.at) || 0
    };
  };

  const loreView = { doc: null, index: 0, total: 0, atEnd: false, secondsLeft: 0 };
  let loreTimerId = null;

  const LORE_FALLBACK_ARCHIVE = [
    { id: "chronos", name: "Хронос", role: "KILLER", file: "LR-001", doc: "chronos", cat: "characters", open: true, teaser: "Лишняя секунда, которой не нашлось места." },
    { id: "twotime", name: "Two Time", role: "SURVIVOR", file: "LR-002", cat: "characters", teaser: "Культист, чья вера стоила Azure жизни." },
    { id: "johndoe", name: "John Doe", role: "KILLER", file: "LR-003", cat: "characters", teaser: "Первый носитель кода." },
    { id: "shedletsky", name: "Shedletsky", role: "SURVIVOR", file: "LR-004", cat: "characters", teaser: "Тот, кто протянул куриную ножку." },
    { id: "1x1x1x1", name: "1x1x1x1", role: "KILLER", file: "LR-005", cat: "characters", teaser: "Существо из четвёртого измерения." },
    { id: "slasher", name: "Slasher", role: "KILLER", file: "LR-006", cat: "characters", teaser: "Солдат, которого забрала книга." },
    { id: "j91nd", name: "J91nD", role: "SURVIVOR", file: "LR-007", cat: "characters", teaser: "Строитель, который платит вперёд." },
    { id: "doombringer", name: "DoomBringer", role: "KILLER", file: "LR-008", cat: "characters", teaser: "Молот, который не остановить." },
    { id: "walker", name: "Walker", role: "KILLER", file: "LR-009", cat: "characters", teaser: "Тот, кто собирает души." },
    { id: "adminjohndoe", name: "Admin John Doe", role: "KILLER", file: "LR-010", cat: "characters", teaser: "Истинный испорченный код." },
    { id: "place", name: "Место", role: "PLACE", file: "LR-000", doc: "place", cat: "place", open: true, img: "assets/maps/crossroads.jpg", teaser: "Вечный ад. То, из чего собраны все карты, и то, что собирает с них долг." },
    { id: "timeline", name: "Хронология", role: "ARCHIVE", file: "LR-011", cat: "other", teaser: "Одна ночь, поле и всё, что случилось после." },
    { id: "rules", name: "Правила раунда", role: "ARCHIVE", file: "LR-012", cat: "other", teaser: "Свод законов места, записанный со слов выживших." },
    { id: "glossary", name: "Словарь архива", role: "ARCHIVE", file: "LR-013", cat: "other", teaser: "Секунда, долг, шов, квитанция. Как это называть." }
  ];

  /* связи на случай, когда manifest.json недоступен */
  const LORE_FALLBACK_RELATED = {
    "LR-001": ["LR-000", "LR-011"],
    "LR-000": ["LR-001", "LR-012"],
    "LR-002": ["LR-001", "LR-005"],
    "LR-003": ["LR-010", "LR-001"],
    "LR-004": ["LR-012"],
    "LR-005": ["LR-001"],
    "LR-006": ["LR-004", "LR-012"],
    "LR-007": ["LR-000"],
    "LR-008": ["LR-006"],
    "LR-009": ["LR-000", "LR-013"],
    "LR-010": ["LR-003", "LR-001"],
    "LR-011": ["LR-001", "LR-000"],
    "LR-012": ["LR-000", "LR-011"],
    "LR-013": ["LR-000"]
  };

  const LORE_CATS = ["characters", "place", "other"];

  const buildLoreRelated = (archive) => {
    const edges = new Map();
    const addEdge = (from, to) => {
      if (!from || !to || from === to) return;
      if (!edges.has(from)) edges.set(from, new Set());
      edges.get(from).add(to);
      if (!edges.has(to)) edges.set(to, new Set());
      edges.get(to).add(from);
    };
    archive.forEach((entry) => {
      const from = entry.record || entry.file;
      (entry.related || []).forEach((rec) => addEdge(from, String(rec).toUpperCase()));
    });
    const out = new Map();
    edges.forEach((set, key) => {
      out.set(
        key,
        [...set].sort((a, b) => a.localeCompare(b, "ru", { numeric: true }))
      );
    });
    return out;
  };

  const applyLoreSource = ({ docs, gates, archive, byRecord }) => {
    LORE_DOCS = docs;
    LORE_GATES = gates;
    LORE_ARCHIVE = archive;
    LORE_BY_RECORD = new Map(byRecord);
    LORE_RELATED = buildLoreRelated(archive);
  };

  const loreFallbackSource = () => {
    const archive = LORE_FALLBACK_ARCHIVE.map((item) => ({
      ...item,
      record: item.file,
      related: LORE_FALLBACK_RELATED[item.file] || []
    }));
    const byRecord = new Map();
    archive.forEach((item) => {
      if (item.record) byRecord.set(String(item.record).toUpperCase(), item);
    });
    return {
      docs: LORE_FALLBACK_DOCS,
      gates: { place: { requires: "chronos" } },
      archive,
      byRecord
    };
  };

  /* manifest.json → те же структуры, что и хардкод. Один источник для доски и читалки. */
  const loreFromManifest = (manifest) => {
    const list = Array.isArray(manifest && manifest.docs) ? manifest.docs : [];
    if (!list.length) throw new Error("manifest без записей");

    const docs = {};
    const gates = {};
    const archive = [];
    const byRecord = new Map();
    const gateSeeds = [];

    list.forEach((raw) => {
      if (!raw || !raw.id) return;
      const record = String(raw.record || "").toUpperCase();
      const ready = raw.status === "ready" && !!raw.file;
      const cat = LORE_CATS.includes(raw.cat) ? raw.cat : "characters";
      const role = raw.role || (cat === "place" ? "PLACE" : cat === "other" ? "ARCHIVE" : "KILLER");

      const entry = {
        id: raw.id,
        name: raw.name || raw.id,
        role,
        file: record || raw.id,
        record: record || raw.id,
        cat,
        teaser: raw.teaser || raw.sub || "",
        img: raw.img || null,
        related: Array.isArray(raw.related) ? raw.related.map((r) => String(r).toUpperCase()) : []
      };

      if (ready) {
        entry.doc = raw.id;
        docs[raw.id] = {
          file: raw.file,
          cat,
          name: entry.name,
          record: entry.record,
          sub: raw.sub || "",
          fileLabel: raw.fileLabel || `ЛОР-ДОСЬЕ // ${entry.record}`,
          meta: Array.isArray(raw.meta) && raw.meta.length ? raw.meta : ["ДОСЬЕ АРХИВА", "СПОЙЛЕРЫ"],
          foot: raw.foot || "Запись архива.",
          tocFoot: raw.tocFoot || `${entry.name.toUpperCase()} · ${entry.record}`,
          download: raw.download || String(raw.file).split("/").pop(),
          related: entry.related,
          mode: raw.mode === "markers" ? "markers" : "ranges",
          chapters:
            raw.mode === "markers" || raw.chapters === "auto"
              ? null
              : Array.isArray(raw.chapters)
                ? raw.chapters
                : null,
          planned: false
        };
        if (raw.requires) gateSeeds.push({ id: raw.id, requires: raw.requires });
      }

      archive.push(entry);
      if (entry.record) byRecord.set(entry.record, entry);
    });

    if (!Object.keys(docs).length) throw new Error("manifest без готовых досье");
    if (!archive.length) throw new Error("manifest без записей архива");

    /* гейты ставим вторым проходом: requires может ссылаться на запись ниже по списку */
    gateSeeds.forEach((seed) => {
      if (seed.requires !== seed.id && docs[seed.requires]) {
        gates[seed.id] = { requires: seed.requires };
      }
    });

    return { docs, gates, archive, byRecord };
  };

  /* F-01: загрузка манифеста с таймаутом и fallback. Никогда не роняет сайт. */
  const loadLoreSource = () => {
    const useFallback = () => {
      applyLoreSource(loreFallbackSource());
    };

    if (typeof fetch !== "function") {
      useFallback();
      return Promise.resolve();
    }

    const ctrl = typeof AbortController === "function" ? new AbortController() : null;
    const timer = setTimeout(() => {
      if (ctrl) ctrl.abort();
    }, 6000);

    return fetch("lore/manifest.json", { cache: "no-cache", signal: ctrl ? ctrl.signal : undefined })
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((json) => {
        applyLoreSource(loreFromManifest(json));
      })
      .catch(() => {
        useFallback();
      })
      .then(() => {
        clearTimeout(timer);
      });
  };

  /* F-04: «См. также» — из manifest.related, двусторонне */
  const LORE_RELATED_NODE_ID = "fx-related";

  const ensureRelatedNode = () => {
    let node = $("#" + LORE_RELATED_NODE_ID);
    if (node) return node;
    const content = $("#lore-content");
    if (!content) return null;
    node = document.createElement("div");
    node.className = "fx-related";
    node.id = LORE_RELATED_NODE_ID;
    node.hidden = true;
    content.insertAdjacentElement("afterend", node);
    return node;
  };

  const paintLoreRelated = (key) => {
    const node = ensureRelatedNode();
    if (!node) return;
    const doc = LORE_DOCS[key];
    const record = doc && doc.record;
    const allRecords = (record && LORE_RELATED.get(record)) || [];
    const records = allRecords.slice(0, 8);
    if (!records.length) {
      node.hidden = true;
      node.innerHTML = "";
      return;
    }

    node.hidden = false;
    node.innerHTML = `
      <span class="fx-related__title">См. также</span>
      <div class="fx-related__chips">
        ${records
          .map((rec) => {
            const known = LORE_BY_RECORD.get(rec);
            const pending = !known || !known.doc;
            const name = known ? known.name : "Запись архива";
            return `<a class="fx-chip${pending ? " is-pending" : ""}" href="#/lore/${rec}" data-fx-record="${rec}"><b>${rec}</b><span>${name}</span></a>`;
          })
          .join("")}
        ${
          allRecords.length > records.length
            ? `<a class="fx-chip is-pending" href="#/tab/lore" data-tab="lore"><b>+${allRecords.length - records.length}</b><span>ещё в архиве</span></a>`
            : ""
        }
      </div>`;
  };

  const escapeHTML = (text) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* F-03: любой LR-### в тексте становится ссылкой на досье */
  const linkifyLoreRecords = (html) =>
    html.replace(/LR-\d{3}/g, (record) => {
      const known = LORE_BY_RECORD.get(record);
      const pending = !known || !known.doc;
      return `<a class="fx-lore-link${pending ? " fx-lore-link--pending" : ""}" href="#/lore/${record}" data-fx-record="${record}">${record}</a>`;
    });

  const inlineLore = (text) => linkifyLoreRecords(escapeHTML(text).replace(/\*([^*]+)\*/g, "<em>$1</em>"));

  const parseLoreText = (text, doc) => {
    if (doc.chapters) {
      const paras = text.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);
      return doc.chapters.map((ch) => ({
        ...ch,
        paras: paras.slice(ch.from, ch.to + 1)
      }));
    }

    const parts = text.split(/\r?\n?<!--\s*ch\s+([^>]+?)\s*-->\r?\n?/g);
    const chapters = [];
    for (let i = 1; i < parts.length; i += 2) {
      const [id, kicker, title] = parts[i].split("|").map((s) => s.trim());
      const paras = parts[i + 1]
        .split(/\r?\n\s*\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      chapters.push({ id, kicker, title, paras });
    }
    return chapters;
  };

  const loreChaptersHTML = (chapters) =>
    chapters
      .map((ch, i) => {
        const body = ch.paras.map((p) => `<p>${inlineLore(p)}</p>`).join("");
        return `
            <section class="lore-chapter" id="lore-ch-${ch.id}" data-chapter="${ch.id}">
              <header class="lore-chapter__head">
                <span class="lore-chapter__num">${String(i + 1).padStart(2, "0")}</span>
                <div>
                  <span class="lore-chapter__kicker">${ch.kicker}</span>
                  <h3>${ch.title}</h3>
                </div>
              </header>
              <div class="lore-chapter__text">${body}</div>
            </section>`;
      })
      .join("");

  const loreLoadingHTML = `<div class="lore-loading"><i></i><span>ЗАГРУЗКА АРХИВА...</span></div>`;

  const loreFileHTML = (item) => {
    const char = [...SITE_DATA.killers, ...SITE_DATA.survivors].find((c) => c.id === item.id);
    const img = item.img || (char && char.img);
    const art = img
      ? `<img src="${img}" alt="${item.name}" loading="lazy" decoding="async" draggable="false">`
      : `<span class="lore-file__letter">${initialOf(item.name)}</span>`;

    const open = isLoreItemOpen(item);
    const gate = !open && item.doc ? LORE_GATES[item.doc] : null;
    const read = item.doc && isLoreRead(item.doc);
    const state = open
      ? `<span class="lore-file__state">${read ? "ПРОЧИТАНО" : "ОТКРЫТО"}</span>`
      : `<span class="lore-file__state lore-file__state--locked"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>ЗАСЕКРЕЧЕНО</span>`;
    const stateText = open
      ? "Читать досье →"
      : gate
        ? `Откроется после «${LORE_DOCS[gate.requires].name}»`
        : "ЛОР ГОТОВИТСЯ";
    const attrs = open
      ? `data-lore-open="${item.doc || item.id}" tabindex="0" role="button" aria-label="Читать досье: ${item.name}"`
      : gate
        ? `data-lore-gate="${item.doc}" tabindex="0" role="button" aria-label="Досье закрыто. Сначала прочитай ${LORE_DOCS[gate.requires].name}"`
        : `aria-disabled="true"`;
    const cls = open ? "is-open" : gate ? "is-locked is-gated" : "is-locked";

    return `
      <article class="lore-file ${cls} reveal" ${attrs}>
        <div class="lore-file__art">
          ${art}
          <span class="lore-file__shade"></span>
          ${state}
          <span class="lore-file__file">${item.file}</span>
        </div>
        <div class="lore-file__body">
          <span class="lore-file__role">${item.role}</span>
          <h4>${item.name}</h4>
          <p>${item.teaser}</p>
          <span class="lore-file__more">${stateText}</span>
        </div>
      </article>`;
  };

  const renderLoreArchive = () => {
    const grid = $("#lore-archive");
    if (!grid) return;
    grid.innerHTML = LORE_ARCHIVE.filter((item) => item.cat === currentLoreCat)
      .map(loreFileHTML)
      .join("");
    observeReveals();
  };

  const setLoreCat = (cat, { loadDoc = false } = {}) => {
    if (!["characters", "place", "other"].includes(cat)) cat = "characters";
    currentLoreCat = cat;

    $$("#lore-cats [data-lore-cat]").forEach((btn) => {
      const on = btn.dataset.loreCat === cat;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    $$("[data-lore-only]").forEach((el) => {
      el.hidden = el.dataset.loreOnly !== cat;
    });

    const reader = $(".lore-reader");
    if (reader) reader.hidden = cat === "other";

    renderLoreArchive();

    if (loadDoc && cat !== "other") renderLoreDoc(cat === "place" ? "place" : "chronos");
  };

  let loreToastTimer = null;
  const showLoreToast = (text) => {
    const toast = $("#lore-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(loreToastTimer);
    loreToastTimer = setTimeout(() => toast.classList.remove("is-visible"), 4600);
  };

  const loreDocKeyFor = (idOrRecord) => {
    const raw = String(idOrRecord || "").trim();
    if (!raw) return null;
    if (LORE_DOCS[raw]) return raw;
    const entry = LORE_BY_RECORD.get(raw.toUpperCase());
    return entry && entry.doc ? entry.doc : null;
  };

  const openLoreRecord = (record) => {
    const rec = String(record || "").toUpperCase();
    const entry = LORE_BY_RECORD.get(rec);
    if (entry && entry.doc) {
      requestLoreDoc(entry.doc);
      return;
    }
    if (entry) showLoreToast(`ДОСЬЕ «${entry.name.toUpperCase()}» ЕЩЁ НЕ РАССЕКРЕЧЕНО`);
    else showLoreToast(`ЗАПИСЬ ${rec} В АРХИВЕ НЕ НАЙДЕНА`);
  };

  const updateLorePlaceFeature = () => {
    const feature = document.querySelector('[data-lore-only="place"].lore-feature');
    if (!feature) return;
    const open = isLoreDocUnlocked("place");
    const read = isLoreRead("place");

    feature.classList.toggle("is-locked", !open);

    const stamp = $("#lore-place-stamp");
    if (stamp) stamp.textContent = read ? "ПРОЧИТАНО" : open ? "ДОСЬЕ ОТКРЫТО" : "ДОСЬЕ ЗАСЕКРЕЧЕНО";

    const status = $("#lore-place-status");
    if (status) {
      status.innerHTML = `<i></i> ${read ? "АРХИВ ПРОЧИТАН" : open ? "АРХИВ РАССЕКРЕЧЕН" : "ДОСТУП ЗАКРЫТ"}`;
    }

    const locked = $("#lore-place-locked");
    if (locked) locked.hidden = open;

    const gate = $("#lore-place-gate");
    if (gate) gate.hidden = open;

    const download = $("#lore-place-download");
    if (download) download.hidden = !open;

    const chronosStamp = $("#lore-chronos-stamp");
    if (chronosStamp) chronosStamp.textContent = isLoreRead("chronos") ? "ПРОЧИТАНО" : "ДОСЬЕ ОТКРЫТО";
  };

  const loreProgressStats = () => {
    const read = [...loreRead].filter((key) => !!LORE_DOCS[key]).length;
    const total = LORE_ARCHIVE.length || Object.keys(LORE_DOCS).length;
    const unlocked = Object.keys(LORE_DOCS).filter(isLoreDocUnlocked).length;
    return { read, total, unlocked };
  };

  const updateLoreAccess = () => {
    renderLoreArchive();
    updateLorePlaceFeature();
    const meta = $("#lore-meta-open");
    if (meta) {
      const count = Object.keys(LORE_DOCS).filter(isLoreDocUnlocked).length;
      meta.textContent = String(count).padStart(2, "0");
    }
    const stats = loreProgressStats();
    const headNode = $("#fx-lore-progress");
    if (headNode) {
      headNode.innerHTML = `<b>${stats.read}</b> / ${stats.total} восстановлено`;
      headNode.setAttribute("aria-label", `Восстановлено ${stats.read} из ${stats.total} записей архива`);
    }
    document.dispatchEvent(new CustomEvent("fx:progress", { detail: stats }));
  };

  const scrollToLoreReader = () => {
    const article = $("#lore-article");
    if (!article) return;
    const top = window.scrollY + article.getBoundingClientRect().top - 92;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  let loreProgressBound = false;

  const updateLoreProgress = () => {
    const bar = $("#lore-progress");
    const label = $("#lore-progress-label");
    if (!bar || !label) return;

    if (!loreView.doc || !loreView.total) {
      bar.style.width = "0%";
      label.textContent = "00 / 00";
      return;
    }

    const pct = Math.round(((loreView.index + 1) / loreView.total) * 100);
    bar.style.width = pct + "%";
    label.textContent = `${String(loreView.index + 1).padStart(2, "0")} / ${String(loreView.total).padStart(2, "0")}`;

    const max = isLoreRead(loreView.doc) ? loreView.total - 1 : lorePageMax(loreView.doc);
    $$("#lore-toc-links a").forEach((a, i) => {
      a.classList.toggle("is-active", i === loreView.index);
      a.classList.toggle("is-locked", i > max);
    });
  };

  const initLoreProgress = () => {
    if (loreProgressBound) return;
    loreProgressBound = true;
    const onViewportChange = () => {
      updateLoreProgress();
      checkLoreChapterEnd();
    };
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange);
    updateLoreProgress();
  };

  const loreCache = {};

  const loreChapterSeconds = (chapter) => {
    const words = chapter.paras.join(" ").trim().split(/\s+/).filter(Boolean).length;
    return Math.min(35, Math.max(8, Math.round(words / 4)));
  };

  const checkLoreChapterEnd = () => {
    if (!loreView.doc) return;
    const el = document.querySelector("#lore-content .lore-chapter:not([hidden])");
    if (!el) return;
    if (el.getBoundingClientRect().bottom <= window.innerHeight - 60 && !loreView.atEnd) {
      loreView.atEnd = true;
      updateLorePager();
    }
  };

  const updateLorePager = () => {
    const next = $("#lore-next");
    const prev = $("#lore-prev");
    const num = $("#lore-page-num");
    const totalEl = $("#lore-page-total");
    const hint = $("#lore-pager-hint");
    if (!next || !prev || !num || !totalEl || !loreView.doc) return;

    const last = loreView.index === loreView.total - 1;
    const read = isLoreRead(loreView.doc);

    next.textContent = last ? (read ? "Досье прочитано" : "Завершить досье") : "Далее →";
    next.disabled = (last && read) || loreView.secondsLeft > 0 || !loreView.atEnd;
    prev.disabled = loreView.index === 0;
    num.textContent = String(loreView.index + 1).padStart(2, "0");
    totalEl.textContent = String(loreView.total).padStart(2, "0");

    if (last && read) {
      hint.hidden = true;
      return;
    }
    if (!loreView.atEnd) {
      hint.hidden = false;
      hint.textContent = "Дочитай главу до конца — дальше пока не пускает.";
    } else if (loreView.secondsLeft > 0) {
      hint.hidden = false;
      hint.textContent = `Ещё ${loreView.secondsLeft} с. Архив не любит спешки.`;
    } else {
      hint.hidden = true;
    }
  };

  const startLoreChapterTimer = (key, index) => {
    clearInterval(loreTimerId);
    loreTimerId = null;
    const chapter = loreCache[key]?.chapters[index];
    const already = isLoreRead(key) || index < lorePageMax(key);
    const seconds = already || !chapter ? 0 : loreChapterSeconds(chapter);
    const readyAt = Date.now() + seconds * 1000;

    const tick = () => {
      loreView.secondsLeft = Math.max(0, Math.ceil((readyAt - Date.now()) / 1000));
      updateLorePager();
      if (loreView.secondsLeft === 0 && loreTimerId) {
        clearInterval(loreTimerId);
        loreTimerId = null;
      }
    };

    tick();
    if (seconds > 0) loreTimerId = setInterval(tick, 1000);
  };

  const showLoreChapter = (key, index, { scroll = false } = {}) => {
    const cached = loreCache[key];
    if (!cached) return;
    const total = cached.chapters.length;
    const max = isLoreRead(key) ? total - 1 : Math.min(lorePageMax(key), total - 1);
    const target = Math.max(0, Math.min(index, max));

    $$("#lore-content .lore-chapter").forEach((el, i) => {
      el.hidden = i !== target;
    });

    loreView.doc = key;
    loreView.index = target;
    loreView.total = total;
    loreView.atEnd = false;
    loreView.secondsLeft = 0;

    startLoreChapterTimer(key, target);
    updateLoreProgress();
    updateLorePager();
    syncLoreHash(key, cached.chapters[target] && cached.chapters[target].id);
    rememberLoreSpot(key, cached.chapters[target] && cached.chapters[target].id);

    requestAnimationFrame(() => {
      checkLoreChapterEnd();
      if (scroll) scrollToLoreReader();
    });
  };

  const paintLoreChrome = (doc) => {
    const fileEl = $("#lore-article-file");
    if (fileEl) fileEl.textContent = doc.fileLabel;
    const titleEl = $("#lore-article-title");
    if (titleEl) titleEl.textContent = doc.name;
    const subEl = $("#lore-article-sub");
    if (subEl) subEl.textContent = doc.sub;
    const metaEl = $("#lore-article-meta");
    if (metaEl) metaEl.innerHTML = doc.meta.map((m) => `<span>${m}</span>`).join("");
    const footEl = $("#lore-article-foot");
    if (footEl) footEl.textContent = doc.foot;
    const tocFoot = $("#lore-toc-foot");
    if (tocFoot) tocFoot.textContent = doc.tocFoot;
    const dl = $("#lore-download");
    if (dl) {
      dl.hidden = false;
      dl.href = doc.file;
      dl.download = doc.download;
    }
  };

  const markLoreRead = (key) => {
    if (!key || loreRead.has(key) || !loreCache[key]) return;
    loreRead.add(key);
    lorePages[key] = loreCache[key].chapters.length - 1;
    saveLoreRead();
    saveLorePages();
    updateLoreAccess();

    const unlocked = Object.keys(LORE_GATES).filter(
      (gateKey) => LORE_GATES[gateKey].requires === key && isLoreDocUnlocked(gateKey)
    );
    if (unlocked.length) {
      showLoreToast(`АРХИВ РАССЕКРЕТИЛ ДОСЬЕ «${LORE_DOCS[unlocked[0]].name.toUpperCase()}» · РАЗДЕЛ «МЕСТО»`);
    } else {
      showLoreToast(`ДОСЬЕ «${LORE_DOCS[key].name.toUpperCase()}» ПРОЧИТАНО`);
    }
  };

  const renderLoreGate = (key) => {
    const doc = LORE_DOCS[key];
    const gate = LORE_GATES[key];
    const req = gate && LORE_DOCS[gate.requires];
    const content = $("#lore-content");
    if (!content) return;

    const dl = $("#lore-download");
    if (dl) dl.hidden = true;

    const toc = $("#lore-toc-links");
    if (toc) toc.innerHTML = `<span class="lore-toc__empty">СОДЕРЖАНИЕ ЗАСЕКРЕЧЕНО</span>`;

    clearInterval(loreTimerId);
    loreTimerId = null;
    loreView.doc = null;
    loreView.index = 0;
    loreView.total = 0;
    loreView.atEnd = false;
    loreView.secondsLeft = 0;

    const pager = $("#lore-pager");
    if (pager) pager.hidden = true;
    const hint = $("#lore-pager-hint");
    if (hint) hint.hidden = true;

    const bar = $("#lore-progress");
    if (bar) bar.style.width = "0%";
    const label = $("#lore-progress-label");
    if (label) label.textContent = "00 / 00";
    const foot = $("#lore-article-foot");
    if (foot) foot.textContent = "Запись закрыта до прочтения предыдущего досье.";

    paintLoreRelated(null);

    content.innerHTML = `
      <div class="lore-gate">
        <span class="lore-gate__lock"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>
        <span class="lore-gate__kicker">ДОСТУП ОГРАНИЧЕН</span>
        <h3>Досье «${doc.name}» засекречено</h3>
        <p>Архив открывает записи по очереди. Сначала прочитай досье «${req ? req.name : "предыдущая запись"}» до конца — тогда следующая запись станет доступна.</p>
        ${req ? `<button class="btn btn--primary" type="button" data-lore-read="${gate.requires}"><span>Читать «${req.name}»</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg></button>` : ""}
      </div>`;
  };

  const requestLoreDoc = (key, { chapter = null } = {}) => {
    const doc = LORE_DOCS[key];
    if (!doc) {
      showLoreToast("ЭТО ДОСЬЕ ЕЩЁ НЕ РАССЕКРЕЧЕНО");
      return;
    }

    if (!isLoreDocUnlocked(key)) {
      const gate = LORE_GATES[key];
      const req = gate && LORE_DOCS[gate.requires];
      showLoreToast(`ДОСЬЕ ЗАКРЫТО · Сначала прочитай «${req ? req.name : "предыдущую запись"}» до конца`);
      if (req) {
        setLoreCat(req.cat, { loadDoc: true });
        scrollToLoreReader();
      }
      return;
    }

    renderLoreDoc(key, { chapter });
    scrollToLoreReader();
  };

  const renderLoreDoc = (key, { scroll = false, chapter = null, silent = false } = {}) => {
    const doc = LORE_DOCS[key];
    const content = $("#lore-content");
    if (!doc || !content) return;

    if (doc.cat && doc.cat !== currentLoreCat) setLoreCat(doc.cat);

    paintLoreChrome(doc);
    if (!silent) syncLoreHash(key, chapter);

    if (!isLoreDocUnlocked(key)) {
      currentLoreDoc = null;
      renderLoreGate(key);
      return;
    }

    const paint = () => {
      const cached = loreCache[key];
      if (!cached) return;
      content.innerHTML = cached.html;
      const max = isLoreRead(key) ? cached.chapters.length - 1 : lorePageMax(key);
      const toc = $("#lore-toc-links");
      if (toc) {
        toc.innerHTML = cached.chapters
          .map(
            (ch, i) =>
              `<a href="#lore-ch-${ch.id}" data-lore-chapter="${ch.id}" class="${i > max ? "is-locked" : ""}"><span>${String(i + 1).padStart(2, "0")}</span>${ch.title}</a>`
          )
          .join("");
      }
      const pager = $("#lore-pager");
      if (pager) pager.hidden = false;

      const wanted = chapter ? cached.chapters.findIndex((ch) => ch.id === chapter) : -1;
      const start = wanted >= 0 ? wanted : isLoreRead(key) ? 0 : lorePageMax(key);
      showLoreChapter(key, start, { scroll });
      paintLoreRelated(key);
      document.dispatchEvent(new CustomEvent("fx:doc", { detail: { key, record: doc.record || key, total: cached.chapters.length } }));
    };

    if (loreCache[key]) {
      if (currentLoreDoc === key && !chapter) {
        paintLoreRelated(key);
        if (scroll) scrollToLoreReader();
        return;
      }
      currentLoreDoc = key;
      paint();
      return;
    }

    currentLoreDoc = key;
    content.innerHTML = loreLoadingHTML;
    /* cache: "no-cache" — файлы лора правятся часто, браузер иначе отдаёт
       устаревшую копию по эвристике свежести (без ревалидации) */
    fetch(doc.file, { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then((text) => {
        const chapters = parseLoreText(text, doc);
        if (!chapters.length || chapters.some((ch) => !ch.paras.length)) throw new Error("empty lore");
        loreCache[key] = { chapters, html: loreChaptersHTML(chapters) };
        if (currentLoreDoc === key) paint();
      })
      .catch(() => {
        if (currentLoreDoc !== key) return;
        currentLoreDoc = null;
        content.innerHTML = `
          <div class="lore-error">
            <b>Архив не загрузился.</b>
            <p>Текст доступен по прямой ссылке: <a href="${doc.file}" download="${doc.download}">${doc.download}</a></p>
            <p><button class="btn btn--ghost btn--small" type="button" data-fx-retry="${key}">Попробовать снова</button></p>
          </div>`;
      });
  };

  const initLore = () => {
    const content = $("#lore-content");
    if (!content) return;

    /* F-06: прогресс восстановления архива в шапке раздела «Лор» */
    const headMeta = $("#tab-lore .page-head__meta");
    if (headMeta && !$("#fx-lore-progress")) {
      const node = document.createElement("span");
      node.id = "fx-lore-progress";
      node.className = "fx-progress-inline";
      node.setAttribute("role", "status");
      headMeta.appendChild(node);
    }

    setLoreCat("characters");
    updateLoreAccess();
    initLoreProgress();
    if (LORE_DOCS.chronos) renderLoreDoc("chronos", { silent: true });

    $("#lore-cats")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-lore-cat]");
      if (!btn) return;
      setLoreCat(btn.dataset.loreCat, { loadDoc: btn.dataset.loreCat !== "other" });
    });

    $("#tab-lore")?.addEventListener("click", (e) => {
      const read = e.target.closest("[data-lore-read]");
      if (!read) return;
      e.preventDefault();
      requestLoreDoc(read.dataset.loreRead);
    });

    $("#lore-top")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));

    const toc = $("#lore-toc-links");
    toc?.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-lore-chapter]");
      if (!link || !currentLoreDoc) return;
      e.preventDefault();
      const cached = loreCache[currentLoreDoc];
      if (!cached) return;
      const index = cached.chapters.findIndex((ch) => ch.id === link.dataset.loreChapter);
      if (index < 0) return;
      const max = isLoreRead(currentLoreDoc) ? cached.chapters.length - 1 : lorePageMax(currentLoreDoc);
      if (index > max) {
        showLoreToast("ГЛАВА ЕЩЁ ЗАКРЫТА · Дочитай текущую");
        return;
      }
      showLoreChapter(currentLoreDoc, index, { scroll: true });
    });

    $("#lore-next")?.addEventListener("click", () => {
      const next = $("#lore-next");
      if (!loreView.doc || !next || next.disabled) return;
      const key = loreView.doc;
      if (loreView.index >= loreView.total - 1) {
        markLoreRead(key);
        updateLorePager();
        return;
      }
      unlockLorePage(key, loreView.index + 1);
      showLoreChapter(key, loreView.index + 1, { scroll: true });
    });

    $("#lore-prev")?.addEventListener("click", () => {
      if (!loreView.doc || loreView.index === 0) return;
      showLoreChapter(loreView.doc, loreView.index - 1, { scroll: true });
    });

    const archive = $("#lore-archive");
    const openCard = (card) => {
      if (card.dataset.loreOpen) requestLoreDoc(card.dataset.loreOpen);
      else if (card.dataset.loreGate) requestLoreDoc(card.dataset.loreGate);
    };

    archive?.addEventListener("click", (e) => {
      const card = e.target.closest("[data-lore-open], [data-lore-gate]");
      if (card) openCard(card);
    });
    archive?.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest("[data-lore-open], [data-lore-gate]");
      if (!card) return;
      e.preventDefault();
      openCard(card);
    });

    /* F-03 / F-04: клик по LR-### и по чипам «См. также» открывает досье */
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-fx-record]");
      if (!link) return;
      e.preventDefault();
      openLoreRecord(link.dataset.fxRecord);
    });

    /* F-18: повторная попытка загрузки упавшего досье */
    content.addEventListener("click", (e) => {
      const retry = e.target.closest("[data-fx-retry]");
      if (!retry) return;
      e.preventDefault();
      const key = retry.dataset.fxRetry;
      delete loreCache[key];
      renderLoreDoc(key, { chapter: null });
    });
  };

  /* ---------- reveal ---------- */

  let revealObserver;
  const initReveal = () => {
    if (reduced) {
      $$(".reveal").forEach((el) => el.classList.add("is-in"));
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observeReveals();
  };

  const observeReveals = () => {
    if (!revealObserver) return;
    $$(".reveal:not(.is-in)").forEach((el) => revealObserver.observe(el));
  };

  /* fallback for environments where IntersectionObserver is throttled */
  const revealVisible = () => {
    if (reduced) return;
    $$(".reveal:not(.is-in)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight - 30) el.classList.add("is-in");
    });
  };

  const initRevealFallback = () => {
    let raf = null;
    window.addEventListener(
      "scroll",
      () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          revealVisible();
          raf = null;
        });
      },
      { passive: true }
    );
    setTimeout(revealVisible, 900);
  };

  /* ---------- tabs ---------- */

  const TITLES = {
    home: "FORSAKEN — Roblox Horror",
    killers: "Убийцы — FORSAKEN",
    survivors: "Выжившие — FORSAKEN",
    maps: "Карты — FORSAKEN",
    items: "Предметы — FORSAKEN",
    mechanics: "Механики — FORSAKEN",
    lore: "Лор — FORSAKEN",
    updates: "Патчи — FORSAKEN"
  };

  let currentTab = "home";

  /* F-02: один парсер на все формы хэша.
     Новый канон: #/tab/maps · #/killer/chronos · #/survivor/twotime · #/map/crossroads · #/lore/LR-005
     Старый формат (#killers/chronos) читается ради ссылок в index.html и закладок. */
  const ROUTE_TABS = {
    killers: "killers",
    killer: "killers",
    survivors: "survivors",
    survivor: "survivors",
    maps: "maps",
    map: "maps",
    items: "items",
    mechanics: "mechanics",
    updates: "updates",
    lore: "lore",
    home: "home"
  };

  const parseRoute = (hash) => {
    const raw = String(hash || "").replace(/^#/, "").replace(/^\/+/, "");
    if (!raw) return { kind: "tab", tab: "home" };
    const parts = raw.split("/").filter(Boolean).map((part) => {
      try {
        return decodeURIComponent(part);
      } catch (err) {
        return part;
      }
    });
    const head = (parts[0] || "").toLowerCase();
    const rest = parts.slice(1);

    if (head === "tab") {
      const tab = (rest[0] || "home").toLowerCase();
      return { kind: "tab", tab: TITLES[tab] ? tab : "home" };
    }
    if (head === "lore") {
      return { kind: "lore", id: rest[0] || null, chapter: rest[1] || null };
    }
    if (head === "killer" || head === "killers") {
      return { kind: "char", role: "killers", id: rest[0] || null };
    }
    if (head === "survivor" || head === "survivors") {
      return { kind: "char", role: "survivors", id: rest[0] || null };
    }
    if (head === "map" || head === "maps") {
      return { kind: "map", id: rest[0] || null };
    }
    if (TITLES[head]) return { kind: "tab", tab: head };
    return { kind: "tab", tab: "home" };
  };

  const tabHash = (tab) => `#/tab/${TITLES[tab] ? tab : "home"}`;

  const charHash = (char) => `#/${char.role === "killer" ? "killer" : "survivor"}/${encodeURIComponent(char.id)}`;

  const mapHash = (map) => `#/map/${encodeURIComponent(map.id)}`;

  const loreHash = (key, chapter) => {
    const doc = LORE_DOCS[key];
    const record = doc && (doc.record || key);
    if (!record) return tabHash("lore");
    return `#/lore/${encodeURIComponent(record)}${chapter ? "/" + encodeURIComponent(chapter) : ""}`;
  };

  const writeHash = (hash) => {
    if (!hash || location.hash === hash) return;
    try {
      history.replaceState(null, "", hash);
    } catch (err) {
      location.hash = hash;
    }
  };

  const syncLoreHash = (key, chapter) => {
    if (currentTab !== "lore") return;
    writeHash(loreHash(key, chapter));
  };

  const setTab = (tab, { updateHash = true, scroll = true } = {}) => {
    if (!TITLES[tab]) tab = "home";
    currentTab = tab;

    $$(".nav__link").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tab));

    $$(".tab-panel").forEach((panel) => {
      const active = panel.dataset.panel === tab;
      panel.classList.toggle("is-active", active);
      if (active) {
        panel.classList.remove("panel-enter");
        // force reflow for restarting animation
        void panel.offsetWidth;
        panel.classList.add("panel-enter");
      }
    });

    document.title = TITLES[tab];
    if (updateHash) writeHash(tabHash(tab));
    if (scroll) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    closeMenu();
    observeReveals();
    requestAnimationFrame(revealVisible);
    if (tab === "lore") requestAnimationFrame(updateLoreProgress);
    if (tab === "maps") primeMapPhotos();
    document.dispatchEvent(new CustomEvent("fx:tab", { detail: { tab } }));
  };

  const applyRoute = (route, { initial = false } = {}) => {
    if (!route) return;

    if (route.kind === "lore") {
      const key = loreDocKeyFor(route.id);
      setTab("lore", { updateHash: false, scroll: !initial });
      if (key) {
        renderLoreDoc(key, { scroll: !initial, chapter: route.chapter });
        if (initial) {
          setTimeout(() => {
            if (isLoreDocUnlocked(key)) scrollToLoreReader();
          }, 120);
        }
      } else if (route.id) {
        showLoreToast(`ЗАПИСЬ ${String(route.id).toUpperCase()} В АРХИВЕ НЕ НАЙДЕНА`);
      }
      return;
    }

    if (route.kind === "char") {
      const char = [...SITE_DATA.killers, ...SITE_DATA.survivors].find((c) => c.id === route.id);
      if (!char) {
        setTab(route.role, { updateHash: false, scroll: !initial });
        return;
      }
      setTab(route.role, { updateHash: false, scroll: false });
      const open = () => openModal(char);
      if (initial) setTimeout(open, 260);
      else open();
      return;
    }

    if (route.kind === "map") {
      const map = SITE_DATA.maps.find((m) => m.id === route.id);
      setTab("maps", { updateHash: false, scroll: false });
      if (!map) return;
      const open = () => openMap(map);
      if (initial) setTimeout(open, 260);
      else open();
      return;
    }

    setTab(route.tab, { updateHash: false, scroll: !initial });
    if (initial) writeHash(tabHash(route.tab));
  };

  /* ---------- filters ---------- */

  const initFilters = () => {
    const bar = $("#killer-filters");
    if (!bar) return;
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      $$(".chip", bar).forEach((c) => c.classList.toggle("is-active", c === btn));
      const filter = btn.dataset.filter;
      let visible = 0;
      $$("#killers-grid .char-card").forEach((card) => {
        const match = filter === "all" || card.dataset.rarity === filter;
        card.classList.toggle("is-filtered-out", !match);
        if (match) visible++;
      });
      const counter = $("#killer-count");
      if (counter) counter.textContent = visible;
    });
  };

  const initUpdateFilters = () => {
    const bar = $("#update-filters");
    if (!bar) return;
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      $$(".chip", bar).forEach((c) => c.classList.toggle("is-active", c === btn));
      updateFilter = btn.dataset.filter;
      renderUpdates();
    });
  };

  const initSort = () => {
    const table = $("#killers-compare");
    if (!table) return;
    table.addEventListener("click", (e) => {
      const th = e.target.closest("th[data-sort]");
      if (!th) return;
      const key = th.dataset.sort;
      if (compareSort.key === key) compareSort.dir *= -1;
      else compareSort = { key, dir: 1 };
      renderCompare();
    });
  };

  /* ---------- modal ---------- */

  const modal = $("#char-modal");
  let lastFocused = null;

  const statBar = (label, value, max, display) => {
    const pct = value === null || value === undefined ? 0 : Math.min(100, Math.round((value / max) * 100));
    return `
      <div class="modal-stat">
        <div class="modal-stat__head"><span>${label}</span><b>${display}</b></div>
        <div class="modal-stat__bar"><i style="width:${pct}%"></i></div>
      </div>`;
  };

  /* ---------- toasts & share (F-02) ---------- */

  let fxToastTimer = null;
  const showToast = (text) => {
    let node = $("#fx-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "fx-toast";
      node.className = "fx-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.appendChild(node);
    }
    node.textContent = text;
    node.classList.add("is-visible");
    clearTimeout(fxToastTimer);
    fxToastTimer = setTimeout(() => node.classList.remove("is-visible"), 2800);
  };

  const absoluteUrl = (hash) => location.href.split("#")[0] + hash;

  const copyText = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (err) {
        ok = false;
      }
      area.remove();
      if (ok) resolve();
      else reject(new Error("copy failed"));
    });
  };

  const shareLink = (hash) => {
    const url = absoluteUrl(hash);
    copyText(url)
      .then(() => showToast("ССЫЛКА СКОПИРОВАНА"))
      .catch(() => showToast("НЕ УДАЛОСЬ СКОПИРОВАТЬ · " + url));
  };

  const COPY_ICON = `<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="5" width="9" height="9" rx="1.5"/><path d="M6 2h6a2 2 0 0 1 2 2v6"/></svg>`;
  const DOC_ICON = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h7l3 3v9H3z"/><path d="M6 7h4M6 10h4"/></svg>`;

  const openModal = (char) => {
    if (!modal) return;
    lastFocused = document.activeElement;

    const media = $(".modal__media", modal);
    const img = $("#modal-img", modal);
    const bg = $("#modal-bg", modal);

    media.style.setProperty("--accent", char.accent);
    media.dataset.letter = initialOf(char.name);
    media.classList.toggle("is-fallback", !char.img);

    if (char.img) {
      img.src = char.img;
      img.alt = char.name;
      img.style.display = "";
      bg.style.backgroundImage = `url("${char.img}")`;
    } else {
      img.removeAttribute("src");
      img.style.display = "none";
      bg.style.backgroundImage = "none";
    }

    $("#modal-file", modal).textContent = char.file;
    $("#modal-name", modal).textContent = char.name;

    const rarity = $("#modal-rarity", modal);
    rarity.textContent = char.rarityLabel;
    rarity.className = "rarity rarity--" + char.rarity;

    $("#modal-price", modal).textContent = formatPrice(char.price);
    $("#modal-quote", modal).textContent = "“" + char.quote + "”";
    $("#modal-desc", modal).textContent = char.desc;

    $("#modal-stats", modal).innerHTML = [
      statBar("ЗДОРОВЬЕ", char.hp, char.role === "killer" ? 2000 : 120, cleanNumber(char.hp)),
      statBar("СКОРОСТЬ", char.speed, 21, char.speed),
      statBar("TERROR RADIUS", char.terror, 60, char.terror === null ? "—" : char.terror)
    ].join("");

    const difficulty = char.difficulty || 3;
    $("#modal-difficulty", modal).innerHTML = [1, 2, 3, 4, 5]
      .map((n) => `<i class="${n <= difficulty ? "is-on" : ""}"></i>`)
      .join("");
    $("#modal-tags", modal).innerHTML = (char.tags || [])
      .map((tag) => `<span class="profile-tag">${tag}</span>`)
      .join("");
    $("#modal-strengths", modal).innerHTML = (char.strengths || [])
      .map((s) => `<li>${s}</li>`)
      .join("");
    $("#modal-weaknesses", modal).innerHTML = (char.weaknesses || [])
      .map((s) => `<li>${s}</li>`)
      .join("");

    const tip = $("#modal-tip", modal);
    const tipText = $("p", tip);
    if (char.tip) {
      tip.hidden = false;
      tipText.textContent = char.tip;
    } else {
      tip.hidden = true;
    }

    $("#modal-abilities", modal).innerHTML = char.abilities
      .map(
        (a, i) => `
        <div class="ability">
          <span class="ability__num">${String(i + 1).padStart(2, "0")}</span>
          <div class="ability__content">
            <div class="ability__head">
              <h4>${a.name}</h4>
              <span class="ability__type ability__type--${a.type}">${abilityType(a.type)}</span>
              <span class="ability__cd">${a.cd}</span>
            </div>
            <p>${a.desc}</p>
          </div>
        </div>`
      )
      .join("");

    $("#modal-credits", modal).innerHTML = `
      <span>SEASON 01</span><i>•</i><span>PATCH 1.0.23</span><i>•</i><span>${char.role === "killer" ? "KILLER DOSSIER" : "SURVIVOR FILE"}</span>`;

    paintCharActions(char);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    writeHash(charHash(char));
    setTimeout(() => $(".modal__close", modal)?.focus(), 60);
  };

  /* F-11 + F-02: из модалки — в лор-досье и «скопировать ссылку» */
  const paintCharActions = (char) => {
    const anchor = $("#modal-desc", modal);
    if (!anchor) return;
    let row = $("#fx-char-actions", modal);
    if (!row) {
      row = document.createElement("div");
      row.className = "fx-actions";
      row.id = "fx-char-actions";
      anchor.insertAdjacentElement("afterend", row);
    }
    const entry = LORE_ARCHIVE.find((item) => item.id === char.id);
    const docKey = entry && entry.doc ? entry.doc : null;
    row.innerHTML = `
      <button class="fx-action" type="button" data-fx-copy="${charHash(char)}">${COPY_ICON}<span>Скопировать ссылку</span></button>
      ${docKey ? `<a class="fx-action" href="${loreHash(docKey)}" data-fx-goto-lore="${docKey}">${DOC_ICON}<span>Лор-досье ${entry.record || ""}</span></a>` : ""}
    `;
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (!mapModal || !mapModal.classList.contains("is-open")) document.body.classList.remove("modal-open");
    writeHash(tabHash(currentTab));
    if (lastFocused) lastFocused.focus();
  };

  /* ---------- map modal ---------- */

  const mapModal = $("#map-modal");
  let mapLastFocused = null;

  const mapStat = (label, value, pct) => `
    <div class="modal-stat">
      <div class="modal-stat__head"><span>${label}</span><b>${value}</b></div>
      <div class="modal-stat__bar"><i style="width:${pct}%"></i></div>
    </div>`;

  const openMap = (map) => {
    if (!mapModal) return;
    mapLastFocused = document.activeElement;
    const index = SITE_DATA.maps.findIndex((m) => m.id === map.id);
    const art = $("#map-modal-art", mapModal);

    art.style.setProperty("--c1", map.c1);
    art.style.setProperty("--c2", map.c2);
    art.style.setProperty("--accent", map.accent);
    $("#map-modal-glyph", mapModal).textContent = map.glyph;
    $("#map-modal-coord", mapModal).textContent = String(index + 1).padStart(2, "0");

    const photo = $("#map-modal-photo", mapModal);
    if (photo) {
      photo.hidden = false;
      photo.alt = `Локация ${map.name}`;
      photo.onerror = () => { photo.hidden = true; };
      photo.src = `assets/maps/${map.id}.jpg${MAP_IMG_VER}`;
    }

    const tag = $("#map-modal-tag", mapModal);
    tag.textContent = map.tag === "DEV" ? "В РАЗРАБОТКЕ" : "В РОТАЦИИ";
    tag.className = "rarity " + (map.tag === "DEV" ? "rarity--admin" : "rarity--common");

    $("#map-modal-num", mapModal).textContent = `${String(index + 1).padStart(2, "0")} / ${String(SITE_DATA.maps.length).padStart(2, "0")}`;
    $("#map-modal-name", mapModal).textContent = map.name;
    $("#map-modal-ru", mapModal).textContent = map.ru;
    $("#map-modal-desc", mapModal).textContent = map.desc;

    const sizePct = map.size === "LARGE" ? 100 : map.size === "SMALL" ? 40 : 70;
    $("#map-modal-stats", mapModal).innerHTML = [
      mapStat("РАЗМЕР", map.size || "MEDIUM", sizePct),
      mapStat("ТИП", map.type, 70),
      mapStat("ОПАСНОСТЬ", `${map.danger} / 5`, map.danger * 20)
    ].join("");

    $("#map-modal-features", mapModal).innerHTML = (map.features || [])
      .map((f) => `<li>${f}</li>`)
      .join("");

    const tip = $("#map-modal-tip", mapModal);
    if (map.tip) {
      tip.hidden = false;
      $("p", tip).textContent = map.tip;
    } else {
      tip.hidden = true;
    }

    $("#map-modal-credits", mapModal).innerHTML = `
      <span>${map.players || "4 выживших"}</span><i>•</i><span>SEASON 01</span><i>•</i><span>LOCATION FILE</span>`;

    paintMapActions(map);

    mapModal.classList.add("is-open");
    mapModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    writeHash(mapHash(map));
    setTimeout(() => $(".modal__close", mapModal)?.focus(), 60);
  };

  /* F-02: «скопировать ссылку» для локации */
  const paintMapActions = (map) => {
    const anchor = $("#map-modal-desc", mapModal);
    if (!anchor) return;
    let row = $("#fx-map-actions", mapModal);
    if (!row) {
      row = document.createElement("div");
      row.className = "fx-actions";
      row.id = "fx-map-actions";
      anchor.insertAdjacentElement("afterend", row);
    }
    row.innerHTML = `<button class="fx-action" type="button" data-fx-copy="${mapHash(map)}">${COPY_ICON}<span>Скопировать ссылку</span></button>`;
  };

  const closeMap = () => {
    if (!mapModal) return;
    mapModal.classList.remove("is-open");
    mapModal.setAttribute("aria-hidden", "true");
    if (!modal || !modal.classList.contains("is-open")) document.body.classList.remove("modal-open");
    writeHash(tabHash("maps"));
    if (mapLastFocused) mapLastFocused.focus();
  };

  const initModal = () => {
    if (!modal) return;

    document.addEventListener("click", (e) => {
      const copyBtn = e.target.closest("[data-fx-copy]");
      if (copyBtn) {
        e.preventDefault();
        shareLink(copyBtn.dataset.fxCopy);
        return;
      }
      const loreGo = e.target.closest("[data-fx-goto-lore]");
      if (loreGo) {
        e.preventDefault();
        const key = loreGo.dataset.fxGotoLore;
        if (modal && modal.classList.contains("is-open")) closeModal();
        applyRoute({ kind: "lore", id: key, chapter: null });
        return;
      }
      const card = e.target.closest(".char-card, .compare__row");
      if (card) {
        const char = [...SITE_DATA.killers, ...SITE_DATA.survivors].find((c) => c.id === card.dataset.id);
        if (char) openModal(char);
        return;
      }
      const mapCard = e.target.closest(".map-card");
      if (mapCard) {
        const map = SITE_DATA.maps.find((m) => m.id === mapCard.dataset.id);
        if (map) openMap(map);
        return;
      }
      if (e.target.closest("[data-close]")) closeModal();
      if (e.target.closest("[data-close-map]")) closeMap();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (modal && modal.classList.contains("is-open")) closeModal();
        if (mapModal && mapModal.classList.contains("is-open")) closeMap();
      }
      const target = e.target;
      if ((e.key === "Enter" || e.key === " ") && (target.classList.contains("char-card") || target.classList.contains("map-card") || target.classList.contains("compare__row"))) {
        e.preventDefault();
        target.click();
      }
    });
  };

  /* ---------- mobile menu ---------- */

  const burger = $("#burger");
  const nav = $("#nav");

  const closeMenu = () => {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  const initMenu = () => {
    if (!burger || !nav) return;
    burger.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });
  };

  /* ---------- header state ---------- */

  const initHeader = () => {
    const header = $("#site-header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  };

  /* ---------- cursor glow ---------- */

  const initCursor = () => {
    if (!finePointer || reduced) return;
    const glow = $("#cursor-glow");
    if (!glow) return;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;

    window.addEventListener("pointermove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      glow.classList.add("is-visible");
    });

    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  /* ---------- scroll progress ---------- */

  const initScrollProgress = () => {
    const bar = $("#scroll-progress-bar");
    if (!bar) return;
    let raf = null;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      raf = null;
    };
    window.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }, { passive: true });
    update();
  };

  /* ---------- hero parallax ---------- */

  const initParallax = () => {
    if (!finePointer || reduced) return;
    const hero = $(".hero");
    const img = $("#hero-img");
    if (!hero || !img) return;
    let raf = null;

    hero.addEventListener("pointermove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = `translate3d(${dx * -22}px, ${dy * -16}px, 0) scale(1.04)`;
        raf = null;
      });
    });

    hero.addEventListener("pointerleave", () => {
      img.style.transform = "";
    });

    // 3D tilt для карточек — делегирование, мгновенный трекинг без задержки CSS
    const TILT_SEL = ".char-card, .map-card, .live-stat, .feature, .role-card";
    let tiltEl = null;

    const resetTilt = () => {
      if (!tiltEl) return;
      tiltEl.classList.remove("is-tilting");
      tiltEl.style.transform = "";
      tiltEl = null;
    };

    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest?.(TILT_SEL);
      if (card !== tiltEl) {
        if (tiltEl) {
          tiltEl.classList.remove("is-tilting");
          tiltEl.style.transform = "";
        }
        tiltEl = card;
        if (card) card.classList.add("is-tilting");
      }
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      card.style.setProperty("--x", `${x * 100}%`);
      card.style.setProperty("--y", `${y * 100}%`);

      const tiltX = (0.5 - y) * 18;
      const tiltY = (x - 0.5) * 18;
      card.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(8px) scale(1.02)`;
    }, { passive: true });

    document.addEventListener("pointerout", (e) => {
      if (!tiltEl) return;
      if (e.relatedTarget && tiltEl.contains(e.relatedTarget)) return;
      if (e.target.closest?.(TILT_SEL) === tiltEl) resetTilt();
    }, true);

    window.addEventListener("blur", resetTilt);
  };

  /* ---------- ambient sound ---------- */

  const initSound = () => {
    const btn = $("#sound-toggle");
    if (!btn) return;

    let ctx = null;
    let master = null;
    let playing = false;

    const build = () => {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 420;
      filter.Q.value = 0.8;
      filter.connect(master);

      [55, 82.41, 110, 164.81].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 ? "sine" : "triangle";
        osc.frequency.value = freq;
        osc.detune.value = i * 4 - 6;
        const g = ctx.createGain();
        g.gain.value = 0.22 / (i + 1);
        osc.connect(g).connect(filter);
        osc.start();

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.017;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.09;
        lfo.connect(lfoGain).connect(g.gain);
        lfo.start();
      });

      return true;
    };

    const setPlaying = (on) => {
      playing = on;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", String(on));
      $(".sound-toggle__label", btn).textContent = on ? "sound on" : "sound off";
      if (master) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(on ? 0.12 : 0, ctx.currentTime, on ? 0.8 : 0.3);
      }
    };

    btn.addEventListener("click", async () => {
      if (!ctx && !build()) return;
      if (ctx.state === "suspended") await ctx.resume();
      setPlaying(!playing);
    });

    window.addEventListener("beforeunload", () => ctx?.close());
  };

  /* ---------- preloader ---------- */

  const initPreloader = () => {
    const pre = $("#preloader");
    const pct = $("#loader-pct");
    if (!pre) return;

    let value = 0;
    let done = false;

    const tick = setInterval(() => {
      value = Math.min(92, value + Math.random() * 9 + 3);
      if (pct) pct.textContent = String(Math.floor(value)).padStart(2, "0");
    }, 110);

    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(tick);
      if (pct) pct.textContent = "100";
      setTimeout(() => {
        pre.classList.add("is-done");
        document.body.classList.remove("is-loading");
        observeReveals();
        setTimeout(() => pre.remove(), 900);
      }, 320);
    };

    window.addEventListener("load", finish);
    setTimeout(finish, 2600);
  };

  /* ---------- navigation wiring ---------- */

  const initTabs = () => {
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-tab]");
      if (!trigger) return;
      if (trigger.tagName === "A" && trigger.getAttribute("href") === "#") return;
      e.preventDefault();
      setTab(trigger.dataset.tab);
    });

    window.addEventListener("hashchange", () => {
      applyRoute(parseRoute(location.hash));
    });
  };

  /* ---------- boot ---------- */

  const animateCounters = () => {
    const counters = $$(".live-stat__value[data-target]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.animated) return;
        entry.target.dataset.animated = "true";
        const target = parseInt(entry.target.dataset.target);
        const duration = 1400;
        const start = performance.now();
        
        const animate = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          entry.target.textContent = Math.round(target * eased).toLocaleString("ru-RU");
          if (t < 1) requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
      });
    }, { threshold: 0.5 });
    
    counters.forEach((counter) => observer.observe(counter));
  };

  const boot = () => {
    renderCharacters();
    renderMaps();
    renderCompare();
    renderMilestones();
    renderUpdates();
    initLore();
    initPreloader();
    initReveal();
    initRevealFallback();
    initTabs();
    initFilters();
    initUpdateFilters();
    initSort();
    initModal();
    initMenu();
    initHeader();
    initCursor();
    initParallax();
    initSound();
    initScrollProgress();
    animateCounters();

    applyRoute(parseRoute(location.hash), { initial: true });
    if (window.FX) window.FX.ready = true;
    document.dispatchEvent(new CustomEvent("fx:ready"));
  };

  /* F-01: сначала манифест лора, потом всё остальное. Fallback внутри. */
  const start = () => loadLoreSource().then(boot, boot);

  /* Единственная глобальная точка для новых модулей (js/features.js и далее). */
  window.FX = {
    version: "1.0.0",
    tab: (tab) => setTab(tab),
    go: (hash) => applyRoute(parseRoute(hash)),
    openDoc: (idOrRecord, opts) => {
      const key = loreDocKeyFor(idOrRecord);
      if (key) requestLoreDoc(key, opts || {});
      else openLoreRecord(idOrRecord);
    },
    openChar: (id) => {
      const char = [...SITE_DATA.killers, ...SITE_DATA.survivors].find((c) => c.id === id);
      if (char) openModal(char);
    },
    openMap: (id) => {
      const map = SITE_DATA.maps.find((m) => m.id === id);
      if (map) openMap(map);
    },
    docs: () => Object.values(LORE_DOCS),
    archive: () => LORE_ARCHIVE.slice(),
    byRecord: (record) => LORE_BY_RECORD.get(String(record || "").toUpperCase()) || null,
    docKeyFor: loreDocKeyFor,
    openChapter: (chapterId) => {
      if (!loreView.doc) return false;
      const cached = loreCache[loreView.doc];
      if (!cached) return false;
      const index = cached.chapters.findIndex((ch) => ch.id === chapterId);
      if (index < 0) return false;
      showLoreChapter(loreView.doc, index);
      return true;
    },
    relatedOf: (idOrRecord) => {
      const key = loreDocKeyFor(idOrRecord);
      const doc = key && LORE_DOCS[key];
      const record = doc ? doc.record : String(idOrRecord || "").toUpperCase();
      const records = LORE_RELATED.get(record) || [];
      return records.map((rec) => LORE_BY_RECORD.get(rec)).filter(Boolean);
    },
    progress: loreProgressStats,
    maxChapter: () => {
      if (!loreView.doc) return -1;
      const cached = loreCache[loreView.doc];
      if (!cached) return -1;
      return isLoreRead(loreView.doc)
        ? cached.chapters.length - 1
        : Math.min(lorePageMax(loreView.doc), cached.chapters.length - 1);
    },
    lastSpot: lastLoreSpot,
    hash: { tab: tabHash, char: charHash, map: mapHash, lore: loreHash },
    toast: showToast,
    copyLink: shareLink,
    currentTab: () => currentTab,
    currentDoc: () => currentLoreDoc,
    reduceMotion: reduced,
    ready: false
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
