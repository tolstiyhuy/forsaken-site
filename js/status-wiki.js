/* ==========================================================================
   FORSAKEN — вики статус-эффектов: рендер (вкладка «Механики»).
   Монтируется в уже существующий пустой узел #status-wiki (.sw).
   Данные: window.STATUS_WIKI из js/status-data.js (подключён раньше).
   Стили: css/status-wiki.css. Классы — строго по контракту §3.
   Ничего наружу не экспортирует, глобальных переменных не создаёт.
   ========================================================================== */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- prefer-reduced-motion ---------- */

  const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = mqReduced.matches;
  const onReducedChange = (e) => {
    reducedMotion = e.matches;
  };
  if (typeof mqReduced.addEventListener === "function") mqReduced.addEventListener("change", onReducedChange);
  else if (typeof mqReduced.addListener === "function") mqReduced.addListener(onReducedChange);

  /* ---------- константы ---------- */

  const CHIPS = [
    { id: "all", label: "Все" },
    { id: "buff", label: "Баффы" },
    { id: "debuff", label: "Дебаффы" },
    { id: "hidden", label: "Скрытые" }
  ];

  const DESC_LIMIT = 190;

  /* ---------- helpers ---------- */

  const escapeHTML = (text) =>
    String(text === null || text === undefined ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const norm = (text) =>
    String(text === null || text === undefined ? "" : text)
      .toLowerCase()
      .replace(/ё/g, "е")
      .trim();

  const pad2 = (n) => String(n).padStart(2, "0");

  const shortText = (text, limit) => {
    const value = String(text === null || text === undefined ? "" : text).trim();
    if (value.length <= limit) return value;
    const cut = value.slice(0, limit);
    const space = cut.lastIndexOf(" ");
    return (space > limit * 0.6 ? cut.slice(0, space) : cut).replace(/[.,;:—-]$/, "") + "…";
  };

  const safeColor = (value) => {
    const color = String(value === null || value === undefined ? "" : value).trim();
    return /^[#a-zA-Z0-9(),.%\s-]{3,48}$/.test(color) ? color : "#8a8f98";
  };

  const typeOf = (raw) => {
    const direct = norm(raw.type);
    if (direct === "buff") return "buff";
    if (direct === "debuff") return "debuff";
    return norm(raw.favored) === "buff" ? "buff" : "debuff";
  };

  const durationOf = (raw) => {
    if (raw.durationLabel) return String(raw.durationLabel);
    if (typeof raw.duration === "number" && isFinite(raw.duration)) return `${raw.duration} сек`;
    if (raw.duration === null || raw.duration === undefined) return "∞";
    return String(raw.duration);
  };

  const levelOf = (raw) => {
    const value = Number(raw.maxLevel);
    if (!isFinite(value)) return 1;
    return Math.max(1, Math.min(99, Math.round(value)));
  };

  const normalizeEntry = (raw, index) => {
    const name = String(raw && raw.name ? raw.name : "").trim() || `ЭФФЕКТ ${pad2(index + 1)}`;
    const ru = String(raw && raw.ru ? raw.ru : "").trim() || "Без названия";
    return {
      num: pad2(index + 1),
      name,
      ru,
      type: typeOf(raw || {}),
      durationLabel: durationOf(raw || {}),
      maxLevel: levelOf(raw || {}),
      stackable: !!(raw && raw.stackable),
      hidden: !!(raw && raw.hidden),
      color: safeColor(raw && raw.color),
      desc: String((raw && (raw.desc || raw.desc_en)) || "").trim(),
      mechanics: String((raw && raw.mechanics) || "").trim(),
      haystack: norm(`${name} ${ru}`)
    };
  };

  /* ---------- разметка ---------- */

  const noticeHTML = (title, hint) => `
    <div class="sw-empty" role="alert">
      <b>${escapeHTML(title)}</b>
      <span>${escapeHTML(hint)}</span>
    </div>`;

  const toolbarHTML = () => `
    <div class="sw-toolbar">
      <label class="sw-search">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5 18 18"/></svg>
        <input type="search" placeholder="Поиск: Speed, замедление…" aria-label="Поиск по статус-эффектам"
               autocomplete="off" spellcheck="false">
      </label>
      <div class="sw-filters" role="group" aria-label="Фильтр по типу эффекта">
        ${CHIPS.map(
          (chip, i) => `<button class="sw-chip${i === 0 ? " is-active" : ""}" type="button"
            data-sw-filter="${chip.id}" aria-pressed="${i === 0 ? "true" : "false"}">${chip.label}</button>`
        ).join("")}
      </div>
      <span class="sw-count" role="status" aria-live="polite">ПОКАЗАНО 0 / 0</span>
    </div>`;

  const modalHTML = () => `
    <div class="sw-modal sw-hidden" role="dialog" aria-modal="true"
         aria-labelledby="sw-modal-title" aria-hidden="true" style="display:none">
      <div class="sw-modal__card">
        <button class="sw-modal__close" type="button" aria-label="Закрыть карточку"><span aria-hidden="true">✕</span></button>
        <div class="sw-modal__body">
          <h3 class="sw-modal__title" id="sw-modal-title"></h3>
          <p class="sw-modal__desc"></p>
          <div class="sw-modal__stats"></div>
          <p class="sw-modal__mech"></p>
        </div>
      </div>
    </div>`;

  const statHTML = (label, value) =>
    `<span class="sw-stat"><span>${escapeHTML(label)}</span><b>${escapeHTML(value)}</b></span>`;

  /* русское склонение: 1 эффект, 2–4 эффекта, 5+ эффектов */
  const plural = (n, one, few, many) => {
    const mod100 = n % 100;
    const mod10 = n % 10;
    if (mod100 >= 11 && mod100 <= 14) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
  };

  /* строка источника: данные — статический снимок из Studio, поэтому
     честно показываем, откуда они и когда сверялись */
  const sourceHTML = () => {
    const meta = window.STATUS_WIKI_META;
    if (!meta || typeof meta !== "object") return "";
    const parts = [];
    if (meta.source) parts.push(escapeHTML(meta.source));
    if (meta.checked) parts.push(`сверено ${escapeHTML(meta.checked)}`);
    const count = Array.isArray(window.STATUS_WIKI) ? window.STATUS_WIKI.length : 0;
    if (count) parts.push(`${count} ${plural(count, "эффект", "эффекта", "эффектов")}`);
    if (!parts.length) return "";

    return `
    <p class="sw-source" title="${escapeHTML(meta.note || "")}">
      <span class="sw-source__label">ИСТОЧНИК</span>
      <span class="sw-source__value">${parts.join(" · ")}</span>
      ${meta.guide ? `<a class="sw-source__link" href="${escapeHTML(meta.guide)}">как обновить ↗</a>` : ""}
    </p>`;
  };

  const cardHTML = (entry, index) => {
    const mods = ["sw-card", entry.type === "buff" ? "sw-card--buff" : "sw-card--debuff"];
    if (entry.hidden) mods.push("sw-card--hidden");

    const badges = [`<span class="sw-badge sw-badge--level">УР. ${entry.maxLevel}</span>`];
    if (entry.stackable) badges.push(`<span class="sw-badge sw-badge--stack">СТАК</span>`);
    if (entry.hidden) badges.push(`<span class="sw-badge sw-badge--hidden">СКРЫТ</span>`);

    return `
      <article class="${mods.join(" ")}" data-sw-index="${index}" tabindex="0" role="button"
               style="--sw-color:${entry.color}"
               aria-label="Открыть карточку эффекта: ${escapeHTML(entry.name)} — ${escapeHTML(entry.ru)}">
        <div class="sw-card__top">
          <span aria-hidden="true">${entry.num}</span>
          <span class="sw-card__name">${escapeHTML(entry.name)}</span>
          <span class="sw-card__ru">${escapeHTML(entry.ru)}</span>
        </div>
        <div class="sw-card__badges">${badges.join("")}</div>
        <p class="sw-card__desc">${escapeHTML(shortText(entry.desc, DESC_LIMIT) || "Описание в источнике отсутствует.")}</p>
        <div class="sw-card__meta">
          ${statHTML("Длительность", entry.durationLabel)}
          ${statHTML("Макс. уровень", entry.maxLevel)}
          ${statHTML("Складывается", entry.stackable ? "да" : "нет")}
        </div>
      </article>`;
  };

  /* ---------- монтирование ---------- */

  const mount = () => {
    const root = document.getElementById("status-wiki");
    if (!root) return;

    const raw = window.STATUS_WIKI;
    if (!Array.isArray(raw) || !raw.length) {
      root.dataset.state = "error";
      root.innerHTML = noticeHTML(
        "ДАННЫЕ СТАТУСОВ НЕ ЗАГРУЖЕНЫ",
        "Скрипт js/status-data.js не передал window.STATUS_WIKI. Проверь порядок подключения: status-data.js должен идти до status-wiki.js, затем обнови страницу."
      );
      return;
    }

    const entries = raw.map(normalizeEntry);
    const state = { filter: "all", query: "" };

    root.dataset.state = "ready";
    root.innerHTML = toolbarHTML() + sourceHTML() + `<div class="sw-grid"></div><p class="sw-empty" hidden></p>`;

    const input = $(".sw-search input", root);
    const filters = $(".sw-filters", root);
    const count = $(".sw-count", root);
    const grid = $(".sw-grid", root);
    const empty = $(".sw-empty", root);

    /* ---------- портал модалки ----------
       #status-wiki лежит внутри section.tab-panel, у которой после анимации
       входа остаётся transform — трансформированный предок становится
       containing block для position: fixed, и оверлей перестаёт накрывать
       окно. Поэтому модалку строим отдельно и монтируем прямо в body. */
    $$(".sw-modal", document.body).forEach((node) => node.remove());
    const modalHolder = document.createElement("div");
    modalHolder.innerHTML = modalHTML();
    const modal = modalHolder.firstElementChild;
    if (document.body && modal) document.body.appendChild(modal);

    const modalTitle = $(".sw-modal__title", modal);
    const modalDesc = $(".sw-modal__desc", modal);
    const modalStats = $(".sw-modal__stats", modal);
    const modalMech = $(".sw-modal__mech", modal);
    const closeBtn = $(".sw-modal__close", modal);
    const modalCard = $(".sw-modal__card", modal);

    let isOpen = false;
    let lastCard = null;
    let scrollLock = null;
    let focusTimer = null;

    /* ---------- фильтрация и рендер ---------- */

    const matches = (entry) => {
      if (state.filter === "buff" && entry.type !== "buff") return false;
      if (state.filter === "debuff" && entry.type !== "debuff") return false;
      if (state.filter === "hidden" && !entry.hidden) return false;
      if (state.query && entry.haystack.indexOf(state.query) < 0) return false;
      return true;
    };

    const apply = () => {
      const pairs = [];
      entries.forEach((entry, i) => {
        if (matches(entry)) pairs.push({ entry, i });
      });

      grid.innerHTML = pairs.map((pair) => cardHTML(pair.entry, pair.i)).join("");
      const shown = pairs.length;
      grid.hidden = shown === 0;
      empty.hidden = shown > 0;
      count.textContent = `ПОКАЗАНО ${shown} / ${entries.length}`;

      if (!shown) {
        const query = input.value.trim();
        if (query) {
          empty.textContent = `По запросу «${query}» ничего не найдено. Измени запрос или сбрось фильтр.`;
        } else if (state.filter !== "all") {
          empty.textContent = "В этом фильтре пока пусто. Выбери другой фильтр или сбрось его на «Все».";
        } else {
          empty.textContent = "Список статусов пуст.";
        }
      }
    };

    /* ---------- блокировка прокрутки ---------- */

    const lockScroll = () => {
      if (scrollLock) return;
      const html = document.documentElement;
      const body = document.body;
      scrollLock = {
        html: html.style.overflow,
        body: body ? body.style.overflow : ""
      };
      html.style.overflow = "hidden";
      if (body) body.style.overflow = "hidden";
    };

    const unlockScroll = () => {
      if (!scrollLock) return;
      document.documentElement.style.overflow = scrollLock.html;
      if (document.body) document.body.style.overflow = scrollLock.body;
      scrollLock = null;
    };

    /* ---------- модалка ---------- */

    const onDocKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        closeModal();
        return;
      }
      /* в модалке один фокусируемый узел — Tab не выпускаем из неё */
      if (e.key === "Tab") {
        e.preventDefault();
        if (closeBtn) closeBtn.focus({ preventScroll: true });
      }
    };

    /* фокус в модалку: пока CSS переводит visibility из hidden, кнопка ещё
       не фокусируема — поэтому пробуем несколько раз за время перехода
       (при prefers-reduced-motion перехода нет и фокус берётся сразу) */
    const focusClose = () => {
      if (!isOpen || !closeBtn) return true;
      const active = document.activeElement;
      if (active === closeBtn || (active && modal.contains(active))) return true;
      closeBtn.focus({ preventScroll: true });
      return document.activeElement === closeBtn;
    };

    const nudgeFocus = () => {
      clearTimeout(focusTimer);
      const steps = [0, 70, 170, 340];
      let i = 0;
      const attempt = () => {
        if (!isOpen) return;
        if (focusClose()) return;
        i += 1;
        if (i >= steps.length) return;
        focusTimer = setTimeout(attempt, steps[i] - steps[i - 1] + 10);
      };
      attempt();
    };

    const fillModal = (entry) => {
      modalTitle.innerHTML = `<b>${escapeHTML(entry.name)}</b><span>${escapeHTML(entry.ru)}</span>`;
      modalDesc.textContent = entry.desc || "Описание в источнике отсутствует.";
      modalStats.innerHTML = [
        statHTML("Длительность", entry.durationLabel),
        statHTML("Макс. уровень", entry.maxLevel),
        statHTML("Складывается", entry.stackable ? "да" : "нет"),
        statHTML("Тип", entry.type === "buff" ? "БАФФ" : "ДЕБАФФ")
      ].join("");
      modalMech.textContent = entry.mechanics || "Механика в источнике не описана.";
      if (modalCard && entry.color) modalCard.style.setProperty("--sw-color", entry.color);
    };

    const openModal = (index, card) => {
      const entry = entries[index];
      if (!entry || isOpen) return;

      isOpen = true;
      lastCard = card || null;
      fillModal(entry);

      /* конечное состояние ставим синхронно — модалка не должна остаться
         невидимой, если переход/кадр не отработал; форс-reflow даёт CSS
         возможность анимировать opacity/visibility, а не перескакивать */
      modal.style.display = "";
      modal.classList.remove("sw-hidden");
      modal.setAttribute("aria-hidden", "false");
      lockScroll();
      document.addEventListener("keydown", onDocKey);

      if (!reducedMotion) void modal.offsetWidth;
      modal.classList.add("sw-modal--open");

      nudgeFocus();
    };

    const closeModal = () => {
      if (!isOpen) return;
      isOpen = false;

      clearTimeout(focusTimer);
      focusTimer = null;
      modal.classList.remove("sw-modal--open");
      modal.classList.add("sw-hidden");
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
      document.removeEventListener("keydown", onDocKey);
      unlockScroll();

      if (lastCard && document.contains(lastCard) && typeof lastCard.focus === "function") {
        lastCard.focus({ preventScroll: true });
      }
      lastCard = null;
    };

    /* ---------- события ---------- */

    filters.addEventListener("click", (e) => {
      const chip = e.target.closest(".sw-chip");
      if (!chip || !filters.contains(chip)) return;
      state.filter = chip.dataset.swFilter || "all";
      $$(".sw-chip", filters).forEach((item) => {
        const on = item === chip;
        item.classList.toggle("is-active", on);
        item.setAttribute("aria-pressed", on ? "true" : "false");
      });
      apply();
    });

    input.addEventListener("input", () => {
      state.query = norm(input.value);
      apply();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" && e.key !== "Esc") return;
      if (!input.value) return;
      e.preventDefault();
      input.value = "";
      state.query = "";
      apply();
    });

    grid.addEventListener("keydown", (e) => {
      const card = e.target.closest ? e.target.closest(".sw-card") : null;
      if (!card || !grid.contains(card)) return;
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        openModal(Number(card.dataset.swIndex), card);
      }
    });

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".sw-card");
      if (!card || !grid.contains(card)) return;
      openModal(Number(card.dataset.swIndex), card);
    });

    /* модалка живёт в body: клики слушаем на её собственном корне */
    modal.addEventListener("click", (e) => {
      if (e.target.closest(".sw-modal__close")) {
        e.preventDefault();
        closeModal();
        return;
      }
      /* клик по фону: цель — сам слой .sw-modal, не карточка внутри */
      if (e.target === modal) closeModal();
    });

    apply();
  };

  /* ---------- запуск ---------- */

  const boot = () => {
    try {
      mount();
    } catch (err) {
      const root = document.getElementById("status-wiki");
      if (root) {
        root.dataset.state = "error";
        root.innerHTML = noticeHTML(
          "ДАННЫЕ СТАТУСОВ НЕ ЗАГРУЖЕНЫ",
          "Вики статусов не смогла построиться. Проверь, что js/status-data.js подключён до js/status-wiki.js, и обнови страницу."
        );
      }
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
