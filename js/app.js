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
      return `<img class="char-card__img" src="${char.img}" alt="${char.name}" loading="lazy" draggable="false">`;
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

  /* ---------- lore ---------- */

  const LORE_ARCHIVE = [
    { id: "chronos", name: "Хронос", role: "KILLER", file: "LR-001", open: true, teaser: "Лишняя секунда, которой не нашлось места." },
    { id: "twotime", name: "Two Time", role: "SURVIVOR", file: "LR-002", teaser: "Культист, чья вера стоила Azure жизни." },
    { id: "johndoe", name: "John Doe", role: "KILLER", file: "LR-003", teaser: "Первый носитель кода." },
    { id: "shedletsky", name: "Shedletsky", role: "SURVIVOR", file: "LR-004", teaser: "Тот, кто протянул куриную ножку." },
    { id: "1x1x1x1", name: "1x1x1x1", role: "KILLER", file: "LR-005", teaser: "Существо из четвёртого измерения." },
    { id: "slasher", name: "Slasher", role: "KILLER", file: "LR-006", teaser: "Солдат, которого забрала книга." },
    { id: "j91nd", name: "J91nD", role: "SURVIVOR", file: "LR-007", teaser: "Строитель, который платит вперёд." },
    { id: "doombringer", name: "DoomBringer", role: "KILLER", file: "LR-008", teaser: "Молот, который не остановить." },
    { id: "walker", name: "Walker", role: "KILLER", file: "LR-009", teaser: "Тот, кто собирает души." },
    { id: "adminjohndoe", name: "Admin John Doe", role: "KILLER", file: "LR-010", teaser: "Истинный испорченный код." }
  ];

  const LORE_CHAPTERS = [
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
  ];

  const escapeHTML = (text) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inlineLore = (text) => escapeHTML(text).replace(/\*([^*]+)\*/g, "<em>$1</em>");

  const loreFileHTML = (item) => {
    const char = [...SITE_DATA.killers, ...SITE_DATA.survivors].find((c) => c.id === item.id);
    const img = char && char.img;
    const art = img
      ? `<img src="${img}" alt="${item.name}" loading="lazy" draggable="false">`
      : `<span class="lore-file__letter">${initialOf(item.name)}</span>`;
    const lock = item.open
      ? `<span class="lore-file__state">ОТКРЫТО</span>`
      : `<span class="lore-file__state lore-file__state--locked"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>ЗАСЕКРЕЧЕНО</span>`;
    return `
      <article class="lore-file ${item.open ? "is-open" : "is-locked"} reveal" ${item.open ? `data-lore-open tabindex="0" role="button" aria-label="Читать досье: ${item.name}"` : `aria-disabled="true"`}>
        <div class="lore-file__art">
          ${art}
          <span class="lore-file__shade"></span>
          ${lock}
          <span class="lore-file__file">${item.file}</span>
        </div>
        <div class="lore-file__body">
          <span class="lore-file__role">${item.role}</span>
          <h4>${item.name}</h4>
          <p>${item.teaser}</p>
          ${item.open ? `<span class="lore-file__more">Читать досье →</span>` : `<span class="lore-file__more">ЛОР ГОТОВИТСЯ</span>`}
        </div>
      </article>`;
  };

  const renderLoreArchive = () => {
    const grid = $("#lore-archive");
    if (!grid) return;
    grid.innerHTML = LORE_ARCHIVE.map(loreFileHTML).join("");
  };

  const scrollToLoreReader = () => {
    const article = $("#lore-article");
    if (!article) return;
    const top = window.scrollY + article.getBoundingClientRect().top - 92;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  let loreProgressBound = false;

  const updateLoreProgress = () => {
    const article = $("#lore-article");
    const bar = $("#lore-progress");
    const label = $("#lore-progress-label");
    if (!article || !bar || !label || !article.offsetHeight) return;

    const start = window.scrollY + article.getBoundingClientRect().top;
    const span = Math.max(1, article.offsetHeight - window.innerHeight * 0.35);
    const raw = (window.scrollY + window.innerHeight * 0.3 - start) / span;
    const pct = Math.max(0, Math.min(100, Math.round(raw * 100)));
    bar.style.width = pct + "%";
    label.textContent = pct + "%";

    const marker = window.scrollY + 150;
    let active = null;
    $$(".lore-chapter", article).forEach((ch) => {
      if (ch.getBoundingClientRect().top + window.scrollY <= marker) active = ch;
    });
    $$("#lore-toc-links a").forEach((a) => {
      a.classList.toggle("is-active", !!active && a.dataset.loreChapter === active.dataset.chapter);
    });
  };

  const initLoreProgress = () => {
    if (loreProgressBound) return;
    loreProgressBound = true;
    window.addEventListener("scroll", updateLoreProgress, { passive: true });
    window.addEventListener("resize", updateLoreProgress);
    updateLoreProgress();
  };

  const initLore = () => {
    const content = $("#lore-content");
    if (!content) return;
    renderLoreArchive();

    fetch("lore/chronos.md")
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then((text) => {
        const paras = text.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);
        if (paras.length < 2) throw new Error("empty lore");
        content.innerHTML = LORE_CHAPTERS.map((ch, i) => {
          const body = paras
            .slice(ch.from, ch.to + 1)
            .map((p) => `<p>${inlineLore(p)}</p>`)
            .join("");
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
        }).join("");

        const toc = $("#lore-toc-links");
        if (toc) {
          toc.innerHTML = LORE_CHAPTERS.map(
            (ch, i) => `<a href="#lore-ch-${ch.id}" data-lore-chapter="${ch.id}"><span>${String(i + 1).padStart(2, "0")}</span>${ch.title}</a>`
          ).join("");
          toc.addEventListener("click", (e) => {
            const link = e.target.closest("a[data-lore-chapter]");
            if (!link) return;
            e.preventDefault();
            const target = document.getElementById("lore-ch-" + link.dataset.loreChapter);
            if (!target) return;
            const top = window.scrollY + target.getBoundingClientRect().top - 96;
            window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
          });
        }

        initLoreProgress();
        requestAnimationFrame(updateLoreProgress);
      })
      .catch(() => {
        content.innerHTML = `
          <div class="lore-error">
            <b>Архив не загрузился.</b>
            <p>Текст доступен по прямой ссылке: <a href="lore/chronos.md" download>Chronos_lore_final.md</a></p>
          </div>`;
      });

    $("#lore-read")?.addEventListener("click", scrollToLoreReader);
    $("#lore-top")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));

    const archive = $("#lore-archive");
    archive?.addEventListener("click", (e) => {
      if (e.target.closest("[data-lore-open]")) scrollToLoreReader();
    });
    archive?.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.closest("[data-lore-open]")) {
        e.preventDefault();
        scrollToLoreReader();
      }
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

  const readHash = () => {
    const raw = location.hash.replace(/^#/, "");
    const [tab, id] = raw.split("/");
    return {
      tab: TITLES[tab] ? tab : "home",
      id: id || null
    };
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
    if (updateHash) history.replaceState(null, "", "#" + tab);
    if (scroll) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    closeMenu();
    observeReveals();
    requestAnimationFrame(revealVisible);
    if (tab === "lore") requestAnimationFrame(updateLoreProgress);
    if (tab === "maps") primeMapPhotos();
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

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const roleTab = char.role === "killer" ? "killers" : "survivors";
    history.replaceState(null, "", `#${roleTab}/${char.id}`);
    setTimeout(() => $(".modal__close", modal)?.focus(), 60);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (!mapModal || !mapModal.classList.contains("is-open")) document.body.classList.remove("modal-open");
    history.replaceState(null, "", "#" + currentTab);
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

    mapModal.classList.add("is-open");
    mapModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    history.replaceState(null, "", `#maps/${map.id}`);
    setTimeout(() => $(".modal__close", mapModal)?.focus(), 60);
  };

  const closeMap = () => {
    if (!mapModal) return;
    mapModal.classList.remove("is-open");
    mapModal.setAttribute("aria-hidden", "true");
    if (!modal || !modal.classList.contains("is-open")) document.body.classList.remove("modal-open");
    history.replaceState(null, "", "#maps");
    if (mapLastFocused) mapLastFocused.focus();
  };

  const initModal = () => {
    if (!modal) return;

    document.addEventListener("click", (e) => {
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
      const { tab, id } = readHash();
      if (tab !== currentTab) setTab(tab, { updateHash: false });
      if (id && tab === "maps") {
        const map = SITE_DATA.maps.find((m) => m.id === id);
        if (map) openMap(map);
      } else if (id && tab === "lore") {
        if (id === "chronos") scrollToLoreReader();
      } else if (id) {
        const char = [...SITE_DATA.killers, ...SITE_DATA.survivors].find((c) => c.id === id);
        if (char) openModal(char);
      }
    });
  };

  /* ---------- boot ---------- */

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

    const { tab, id } = readHash();
    setTab(tab, { updateHash: false, scroll: false });

    if (id) {
      if (tab === "maps") {
        const map = SITE_DATA.maps.find((m) => m.id === id);
        if (map) setTimeout(() => openMap(map), 300);
      } else if (tab === "lore") {
        if (id === "chronos") setTimeout(scrollToLoreReader, 300);
      } else {
        const char = [...SITE_DATA.killers, ...SITE_DATA.survivors].find((c) => c.id === id);
        if (char) setTimeout(() => openModal(char), 300);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
