/* ============================================================
   FORSAKEN — фичи архива (Chat 3)
   F-06 прогресс · F-08 command palette · F-09 поиск в лоре
   F-10 «продолжить чтение» · F-15 персист фильтров
   Разметку строим сами: index.html не трогаем.
   Зависимость — window.FX из js/app.js.
   ============================================================ */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const FX = () => window.FX || null;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onReady = (fn) => {
    if (window.FX && window.FX.ready) fn();
    else document.addEventListener("fx:ready", fn, { once: true });
  };

  const escapeHTML = (text) =>
    String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const escapeRe = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const norm = (text) => String(text || "").toLowerCase().replace(/ё/g, "е");

  const pad = (n) => String(n).padStart(2, "0");

  /* ============================================================
     F-06 + F-10: блок архива на главной
     ============================================================ */

  const homePanel = () => {
    const tab = $("#tab-home");
    if (!tab || $("#fx-home-archive")) return $("#fx-home-archive");

    const section = document.createElement("section");
    section.className = "section fx-home-archive";
    section.id = "fx-home-archive";
    section.innerHTML = `
      <div class="container">
        <div class="fx-panel reveal is-in">
          <div class="fx-panel__head">
            <span class="fx-panel__kicker">АРХИВ · ВОССТАНОВЛЕНИЕ</span>
            <b class="fx-panel__count" id="fx-home-count">0 / 0</b>
          </div>
          <div class="fx-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="fx-home-bar"><i></i></div>
          <p class="fx-panel__hint" id="fx-home-hint">Записи открываются по очереди: дочитай досье — архив рассекретит следующее.</p>
          <div class="fx-panel__actions" id="fx-home-actions"></div>
        </div>
      </div>`;

    const anchor = $(".section--stats", tab);
    if (anchor) anchor.insertAdjacentElement("beforebegin", section);
    else tab.appendChild(section);
    return section;
  };

  const paintHomePanel = () => {
    const fx = FX();
    if (!fx) return;
    homePanel();
    const stats = fx.progress();
    const count = $("#fx-home-count");
    const bar = $("#fx-home-bar");
    const fill = bar && bar.querySelector("i");
    const hint = $("#fx-home-hint");
    const actions = $("#fx-home-actions");
    if (!count || !bar || !fill || !actions) return;

    const pct = stats.total ? Math.round((stats.read / stats.total) * 100) : 0;
    count.textContent = `${pad(stats.read)} / ${pad(stats.total)}`;
    fill.style.width = pct + "%";
    bar.setAttribute("aria-valuenow", String(pct));
    bar.setAttribute("aria-valuetext", `Восстановлено ${stats.read} из ${stats.total}`);

    const spot = fx.lastSpot();
    if (spot) {
      if (hint) {
        hint.textContent = spot.chapterTitle
          ? `Последняя запись: ${spot.name} · глава «${spot.chapterTitle}».`
          : `Последняя запись: ${spot.name}.`;
      }
      actions.innerHTML = `
        <a class="btn btn--primary btn--small" href="${fx.hash.lore(spot.doc, spot.chapter)}" data-fx-continue>
          <span>Продолжить чтение</span>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>
        </a>
        <a class="fx-link-quiet" href="${fx.hash.tab("lore")}" data-tab="lore">Весь архив</a>`;
    } else {
      if (hint) hint.textContent = "Архив ещё не открывали. Начни с досье «Хронос» — оно доступно сразу.";
      actions.innerHTML = `
        <a class="btn btn--primary btn--small" href="${fx.hash.lore("chronos")}">
          <span>Начать с «Хронос»</span>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>
        </a>
        <a class="fx-link-quiet" href="${fx.hash.tab("lore")}" data-tab="lore">Весь архив</a>`;
    }
  };

  /* ============================================================
     F-08: command palette (Ctrl/Cmd + K)
     ============================================================ */

  const site = () => (typeof SITE_DATA !== "undefined" && SITE_DATA ? SITE_DATA : {});

  const paletteData = () => {
    const fx = FX();
    if (!fx) return [];
    const items = [];

    (site().killers || []).forEach((char) => {
      items.push({
        id: `char-${char.id}`,
        kind: "CHAR",
        title: char.name,
        sub: `УБИЙЦА · ${char.file}`,
        haystack: norm(`${char.name} ${char.file} убийца killer ${char.rarityLabel} ${char.quote}`),
        run: () => fx.openChar(char.id)
      });
    });

    (site().survivors || []).forEach((char) => {
      items.push({
        id: `char-${char.id}`,
        kind: "CHAR",
        title: char.name,
        sub: `ВЫЖИВШИЙ · ${char.file}`,
        haystack: norm(`${char.name} ${char.file} выживший survivor ${char.quote}`),
        run: () => fx.openChar(char.id)
      });
    });

    (site().maps || []).forEach((map) => {
      items.push({
        id: `map-${map.id}`,
        kind: "MAP",
        title: map.name,
        sub: `ЛОКАЦИЯ · ${map.ru}`,
        haystack: norm(`${map.name} ${map.ru} карта локация map ${map.type}`),
        run: () => fx.openMap(map.id)
      });
    });

    fx.archive().forEach((entry) => {
      const open = !!entry.doc;
      items.push({
        id: `lore-${entry.id}`,
        kind: "LORE",
        title: `${entry.record} · ${entry.name}`,
        sub: open ? "ДОСЬЕ АРХИВА" : "ЛОР ГОТОВИТСЯ",
        haystack: norm(`${entry.record} ${entry.name} лор досье архив ${entry.teaser}`),
        run: () => {
          /* сначала раздел «Лор»: openDoc сам таб не переключает */
          fx.tab("lore");
          fx.openDoc(entry.record);
        }
      });
    });

    (site().devlog || []).forEach((patch) => {
      items.push({
        id: `patch-${patch.v}`,
        kind: "PATCH",
        title: `${patch.v} · ${patch.title}`,
        sub: "ЖУРНАЛ ПАТЧЕЙ",
        haystack: norm(`${patch.v} ${patch.title} патч сборка ${patch.tags.join(" ")} ${patch.notes.join(" ")}`),
        run: () => {
          fx.tab("updates");
          requestAnimationFrame(() => {
            const row = $$("#update-list .update").find(
              (el) => el.querySelector(".update__version") && el.querySelector(".update__version").textContent === patch.v
            );
            if (row) {
              row.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
              row.classList.add("fx-flash");
              setTimeout(() => row.classList.remove("fx-flash"), 1600);
            }
          });
        }
      });
    });

    $$("#tab-mechanics .mech").forEach((mech) => {
      const title = $("h3", mech);
      if (!title) return;
      items.push({
        id: `mech-${title.textContent}`,
        kind: "GUIDE",
        title: title.textContent,
        sub: "МЕХАНИКА",
        haystack: norm(`${title.textContent} механика гайд mechanics ${mech.textContent}`),
        run: () => {
          fx.tab("mechanics");
          requestAnimationFrame(() => {
            mech.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
            mech.classList.add("fx-flash");
            setTimeout(() => mech.classList.remove("fx-flash"), 1600);
          });
        }
      });
    });

    return items;
  };

  const PALETTE_LIMIT = 9;

  const initPalette = () => {
    let items = [];
    let filtered = [];
    let cursor = 0;
    let isOpen = false;
    let lastFocused = null;

    const root = document.createElement("div");
    root.className = "fx-palette";
    root.id = "fx-palette";
    root.hidden = true;
    root.innerHTML = `
      <div class="fx-palette__backdrop" data-fx-palette-close></div>
      <div class="fx-palette__card" role="dialog" aria-modal="true" aria-label="Быстрый поиск по архиву">
        <div class="fx-palette__search">
          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5 18 18"/></svg>
          <input id="fx-palette-input" class="fx-palette__input" type="text" role="combobox"
                 aria-expanded="true" aria-controls="fx-palette-list" aria-autocomplete="list"
                 autocomplete="off" spellcheck="false" placeholder="Убийца, карта, досье, патч, механика…">
          <kbd class="fx-palette__esc">ESC</kbd>
        </div>
        <div class="fx-palette__list" id="fx-palette-list" role="listbox" aria-label="Результаты поиска"></div>
        <div class="fx-palette__foot"><span><kbd>↑</kbd><kbd>↓</kbd> выбор</span><span><kbd>↵</kbd> открыть</span><span>CTRL/⌘ + K</span></div>
      </div>`;
    document.body.appendChild(root);

    const input = $("#fx-palette-input", root);
    const list = $("#fx-palette-list", root);

    const paint = () => {
      if (!filtered.length) {
        list.innerHTML = `<div class="fx-palette__empty" role="presentation">Ничего не найдено. Попробуй «Хронос», «LR-005» или «Walker».</div>`;
        input.removeAttribute("aria-activedescendant");
        return;
      }
      list.innerHTML = filtered
        .map(
          (item, i) => `
          <button class="fx-palette__item${i === cursor ? " is-active" : ""}" type="button" role="option"
                  id="fx-palette-item-${i}" aria-selected="${i === cursor ? "true" : "false"}" data-fx-palette-index="${i}">
            <span class="fx-palette__kind">${item.kind}</span>
            <span class="fx-palette__text"><b>${escapeHTML(item.title)}</b><small>${escapeHTML(item.sub)}</small></span>
          </button>`
        )
        .join("");
      const active = $("#fx-palette-item-" + cursor, list);
      if (active) {
        input.setAttribute("aria-activedescendant", active.id);
        active.scrollIntoView({ block: "nearest" });
      }
    };

    const filter = () => {
      const query = norm(input.value);
      filtered = !query
        ? items.slice(0, PALETTE_LIMIT)
        : items.filter((item) => item.haystack.includes(query)).slice(0, PALETTE_LIMIT);
      cursor = 0;
      paint();
    };

    const open = () => {
      if (isOpen) return;
      items = paletteData();
      isOpen = true;
      lastFocused = document.activeElement;
      root.hidden = false;
      requestAnimationFrame(() => root.classList.add("is-open"));
      document.body.classList.add("fx-palette-open");
      input.value = "";
      filter();
      input.focus();
    };

    const close = () => {
      if (!isOpen) return;
      isOpen = false;
      root.classList.remove("is-open");
      document.body.classList.remove("fx-palette-open");
      root.hidden = true;
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    };

    const choose = (index) => {
      const item = filtered[index];
      if (!item) return;
      close();
      item.run();
    };

    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-fx-palette-close]")) {
        close();
        return;
      }
      const item = e.target.closest("[data-fx-palette-index]");
      if (item) choose(Number(item.dataset.fxPaletteIndex));
    });

    input.addEventListener("input", filter);

    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!filtered.length) return;
        cursor = (cursor + 1) % filtered.length;
        paint();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!filtered.length) return;
        cursor = (cursor - 1 + filtered.length) % filtered.length;
        paint();
      } else if (e.key === "Enter") {
        e.preventDefault();
        choose(cursor);
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    });

    document.addEventListener("keydown", (e) => {
      const key = (e.key || "").toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "k") {
        e.preventDefault();
        if (isOpen) close();
        else open();
        return;
      }
      if (e.key === "Escape" && isOpen) close();
    });

    return { open, close };
  };

  /* ============================================================
     F-09: поиск внутри читалки
     ============================================================ */

  const MARK_CLASS = "fx-hl";

  const clearMarks = () => {
    const content = $("#lore-content");
    if (!content) return;
    $$(`mark.${MARK_CLASS}`, content).forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  };

  const highlightIn = (root, query) => {
    if (!query) return [];
    const needle = norm(query);
    if (!needle) return [];
    const marks = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentNode;
        if (parent && parent.closest("mark") ) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const targets = [];
    let node = walker.nextNode();
    while (node) {
      targets.push(node);
      node = walker.nextNode();
    }

    targets.forEach((textNode) => {
      const value = textNode.nodeValue;
      const hay = norm(value);
      let from = 0;
      let index = hay.indexOf(needle, from);
      if (index < 0) return;
      const frag = document.createDocumentFragment();
      let consumed = 0;
      while (index >= 0) {
        if (index > consumed) frag.appendChild(document.createTextNode(value.slice(consumed, index)));
        const mark = document.createElement("mark");
        mark.className = MARK_CLASS;
        mark.textContent = value.slice(index, index + needle.length);
        frag.appendChild(mark);
        marks.push(mark);
        consumed = index + needle.length;
        index = hay.indexOf(needle, consumed);
      }
      if (consumed < value.length) frag.appendChild(document.createTextNode(value.slice(consumed)));
      textNode.parentNode.replaceChild(frag, textNode);
    });

    return marks;
  };

  const initLoreSearch = () => {
    const article = $("#lore-article");
    const head = article && $(".lore-article__head", article);
    if (!head || $("#fx-lore-search")) return;

    const bar = document.createElement("div");
    bar.className = "fx-lore-search";
    bar.id = "fx-lore-search";
    bar.innerHTML = `
      <label class="fx-lore-search__field">
        <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5 18 18"/></svg>
        <input id="fx-lore-search-input" type="search" placeholder="Поиск по досье…" autocomplete="off" spellcheck="false" aria-label="Поиск по тексту досье">
      </label>
      <span class="fx-lore-search__count" id="fx-lore-search-count" role="status" aria-live="polite"></span>
      <div class="fx-lore-search__nav">
        <button class="fx-lore-search__btn" type="button" id="fx-lore-search-prev" aria-label="Предыдущее совпадение">↑</button>
        <button class="fx-lore-search__btn" type="button" id="fx-lore-search-next" aria-label="Следующее совпадение">↓</button>
        <button class="fx-lore-search__btn" type="button" id="fx-lore-search-reset" aria-label="Сбросить поиск">✕</button>
      </div>`;
    head.insertAdjacentElement("afterend", bar);

    const input = $("#fx-lore-search-input");
    const count = $("#fx-lore-search-count");
    let marks = [];
    let current = -1;
    let timer = null;

    const focusMark = (index, { scroll = true } = {}) => {
      marks.forEach((mark) => mark.classList.remove("is-current"));
      if (!marks.length) {
        count.textContent = "";
        current = -1;
        return;
      }
      current = ((index % marks.length) + marks.length) % marks.length;
      const mark = marks[current];
      mark.classList.add("is-current");
      count.textContent = `${current + 1} / ${marks.length}`;

      /* если совпадение в скрытой главе — сначала открываем её */
      const chapterEl = mark.closest(".lore-chapter");
      const fx = FX();
      if (mark.hidden || (chapterEl && chapterEl.hidden && fx && chapterEl.dataset.chapter)) {
        fx.openChapter(chapterEl.dataset.chapter);
      }
      if (scroll) mark.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    };

    const reset = () => {
      clearMarks();
      marks = [];
      current = -1;
      count.textContent = "";
      input.value = "";
    };

    const run = () => {
      clearMarks();
      marks = [];
      const query = input.value.trim();
      if (!query) {
        count.textContent = "";
        current = -1;
        return;
      }
      const content = $("#lore-content");
      if (!content) return;
      /* ищем только в открытых главах: закрытые лежат в DOM скрытыми */
      const chapters = $$(".lore-chapter", content);
      const fx = FX();
      const max = fx && typeof fx.maxChapter === "function" ? fx.maxChapter() : chapters.length - 1;
      const scope = max >= 0 && max < chapters.length ? chapters.slice(0, max + 1) : chapters;
      scope.forEach((chapterEl) => {
        marks = marks.concat(highlightIn(chapterEl, query));
      });
      if (!marks.length) {
        count.textContent = "0 совпадений";
        return;
      }
      focusMark(0);
    };

    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(run, 160);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!marks.length) run();
        else focusMark(current + (e.shiftKey ? -1 : 1));
      } else if (e.key === "Escape") {
        e.preventDefault();
        reset();
      }
    });

    $("#fx-lore-search-prev").addEventListener("click", () => focusMark(current - 1));
    $("#fx-lore-search-next").addEventListener("click", () => focusMark(current + 1));
    $("#fx-lore-search-reset").addEventListener("click", reset);

    /* при смене досье/главы подсветка устаревает — снимаем, запрос оставляем */
    document.addEventListener("fx:doc", () => {
      clearMarks();
      marks = [];
      current = -1;
      count.textContent = "";
      if (input.value.trim()) setTimeout(run, 60);
    });

    const pager = $("#lore-next");
    if (pager) {
      pager.addEventListener("click", () => {
        if (!marks.length) return;
        setTimeout(run, 80);
      });
    }
  };

  /* ============================================================
     F-15: фильтры убийц и патчей переживают переходы
     ============================================================ */

  const FILTER_KEY = "forsaken-filters";

  const readFilters = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(FILTER_KEY) || "{}");
      return raw && typeof raw === "object" ? raw : {};
    } catch (err) {
      return {};
    }
  };

  const writeFilter = (scope, value) => {
    try {
      const all = readFilters();
      all[scope] = value;
      localStorage.setItem(FILTER_KEY, JSON.stringify(all));
    } catch (err) {
      /* приватный режим — просто не запоминаем */
    }
  };

  const restoreFilters = () => {
    const saved = readFilters();

    const killerBar = $("#killer-filters");
    if (killerBar && saved.killers) {
      const btn = $(`.chip[data-filter="${saved.killers}"]`, killerBar);
      if (btn && !btn.classList.contains("is-active")) btn.click();
    }

    const patchBar = $("#update-filters");
    if (patchBar && saved.patches) {
      const btn = $(`.chip[data-filter="${saved.patches}"]`, patchBar);
      if (btn && !btn.classList.contains("is-active")) btn.click();
    }
  };

  const initFilterPersistence = () => {
    const killerBar = $("#killer-filters");
    killerBar?.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (btn) writeFilter("killers", btn.dataset.filter);
    });

    const patchBar = $("#update-filters");
    patchBar?.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (btn) writeFilter("patches", btn.dataset.filter);
    });
  };

  /* ============================================================
     wiring
     ============================================================ */

  const init = () => {
    initPalette();
    initLoreSearch();
    paintHomePanel();
    initFilterPersistence();
    restoreFilters();

    document.addEventListener("fx:progress", paintHomePanel);
    document.addEventListener("fx:doc", () => {
      /* дома обновляем «продолжить чтение» только когда вкладка реально видна */
      if (FX() && FX().currentTab() === "home") paintHomePanel();
    });
    document.addEventListener("fx:tab", (e) => {
      if (e.detail && e.detail.tab === "home") paintHomePanel();
      if (e.detail && e.detail.tab === "lore") initLoreSearch();
    });

    paintHomePanel();
  };

  onReady(init);
})();

