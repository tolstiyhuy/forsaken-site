# Контракт: вики статус-эффектов (вкладка «Механики»)

Единый договор для трёх агентов. Читать до начала работы. Файлы **не пересекаются**: один файл — один владелец.

## 0. Цель

Добавить на вкладку «Механики» вики со всеми **41 статус-эффектом** игры: поиск, фильтры (баффы / дебаффы), сетка карточек, модалка с деталями. Названия — латиницей как в игре, описания — на русском.

Источник данных: `docs/status-data.json` (выгружен из `game.ReplicatedStorage.Shared.Combat.StatusEffects` в Studio, place 100668519081940).

## 1. Карта владения

| Путь | Владелец |
|---|---|
| `js/status-data.js` | **Агент A (данные)** |
| `css/status-wiki.css` | **Агент B (стили)** |
| `js/status-wiki.js` | **Агент C (рендер)** |
| `index.html`, `docs/**`, `js/statuses.js` | оркестратор (менять нельзя) |
| всё остальное (`css/style.css`, `css/v2.css`, `js/data.js`, `js/app.js`, `js/features.js` и т.д.) | **не трогать никому** |

**Запрещено:** править чужие файлы, добавлять глобальные переменные (кроме указанных ниже), использовать сборщики и внешние библиотеки.

## 2. Формат данных — `js/status-data.js` (Агент A)

Файл создаёт глобальные переменные `window.STATUS_WIKI_META` (источник и дата сверки) и `window.STATUS_WIKI`:

```js
window.STATUS_WIKI = [
  {
    id: "speed",              // slug: латиница, нижний регистр
    name: "Speed",            // как в игре
    ru: "Скорость",           // короткое русское название (2–3 слова)
    type: "buff",             // "buff" | "debuff"
    duration: 10,             // число секунд, либо null
    durationLabel: "10 сек",  // готовая русская подпись: "10 сек", "∞", "зависит от удара"
    maxLevel: 10,             // 1..10
    stackable: false,         // складывается ли по уровням
    hidden: false,            // true для скрытых из UI (Timelapsed, ParadoxHit)
    color: "rgb(0,200,255)",  // игровой TooltipColor — акцент карточки
    desc: "Ветер бьёт в лицо. ...",   // русский перевод desc_en, 1–2 предложения
    mechanics: "..."          // русское описание сути из поля mechanics
  }
]
```

Правила:
- Ровно **41 запись**, порядок — как в `docs/status-data.json`.
- `desc` — живой русский текст (перевод `desc_en`), не калька; стиль — как на сайте FORSAKEN (второе лицо, «ты»).
- `type`: `"buff"` для BUFF, `"debuff"` для DEBUFF (в источнике поле `favored`).
- Особые случаи `duration`: `"бессрочно"` → `null` + `durationLabel: "∞"`; `"аргумент statusDuration"` → `null` + `durationLabel: "зависит от удара"`; число (например `1.5`) → подпись `"1.5 сек"`.
- Ничего не выдумывать: только данные из `docs/status-data.json`.
- Скрытые эффекты (`hidden: true`) на сайте не исчезают: они помечены бейджем «СКРЫТ» и доступны через фильтр «Скрытые».
- Рендер показывает строку `.sw-source` из `window.STATUS_WIKI_META` — источник и дату сверки. Меняешь данные — обнови и дату.

## 3. Разметка — `js/status-wiki.js` (Агент C)

- Только IIFE, без глобальных переменных.
- Читает `window.STATUS_WIKI`; если его нет — не падать, показать понятное сообщение об ошибке.
- Рендерит всё **внутрь** узла `#status-wiki` (он уже есть в `index.html`, изначально пустой). **Исключение — модалка:** узел `.sw-modal` создаётся порталом в `document.body`, потому что `#status-wiki` живёт внутри `section.tab-panel`, у которой остаётся `transform` от анимации входа, а трансформированный предок ломает `position: fixed`.
- Функции: поиск по `name`+`ru` (без регистра), фильтры-чипы `все / баффы / дебаффы / скрытые`, счётчик «показано X из 41», карточки, клик/E/Enter → модалка с деталями, Esc/клик по фону — закрыть, фокус-трап и `aria-*`.
- Не ломать остальной сайт: не навешивать обработчики на документ шире, чем нужно, работать только под `#status-wiki`.
- Учитывать `prefers-reduced-motion` (проверять `matchMedia`).

Рендер **обязан** использовать ровно эти классы (их стилизует Агент B):

```
.sw-toolbar .sw-search .sw-filters .sw-chip(.is-active) .sw-count
.sw-grid
.sw-card .sw-card--buff .sw-card--debuff .sw-card--hidden
.sw-card__top .sw-card__name .sw-card__ru .sw-card__badges
.sw-badge .sw-badge--level .sw-badge--stack .sw-badge--hidden
.sw-card__desc .sw-card__meta .sw-stat
.sw-empty
.sw-modal .sw-modal__card .sw-modal__close .sw-modal__body
.sw-modal__title .sw-modal__desc .sw-modal__stats .sw-modal__mech
.sw-modal--open .sw-hidden (утилита скрытия)
```

Корневой узел `#status-wiki` уже имеет класс `.sw` и атрибут `style="--sw-color: ..."` не нужен — цвет карточки задавать inline на `.sw-card` через `style="--sw-color:<color>"`.

## 4. Стили — `css/status-wiki.css` (Агент B)

- Только классы с префиксом `sw-`. Чужие классы не переопределять.
- `.sw-modal` живёт в `document.body` вне `.sw`, поэтому обязан сам объявлять токены `--sw-*` (не наследовать их от `.sw`) и не использовать селекторы-потомки вида `.sw .sw-modal …`.
- Опереться на существующие токены темы: посмотреть `css/v2.css` и `css/style.css` (переменные вида `--*`, тёмная и светлая «рассекреченный архив» тема, `[data-theme]`/media-запросы). Не хардкодить цвета, где есть переменная.
- Учесть адаптив: 360px, 768px, 1440px. Сетка карточек — `auto-fill/minmax`.
- Учесть `prefers-reduced-motion`, состояния `:hover/:focus-visible`, `.is-active` у чипа.
- Эстетика — как у остального сайта: «архив/досье», тонкие рамки, скан-линии, акцент из `--sw-color`.

## 5. Подключение (делает оркестратор)

В `index.html` в блоке `SHARED-HEAD:C` добавляется `<link rel="stylesheet" href="css/status-wiki.css?v=10">`, в блоке `SHARED-SCRIPTS:C` — `<script src="js/status-data.js?v=10"></script>` и `<script src="js/status-wiki.js?v=10"></script>`, а на вкладке «Механики» — пустой `<div class="sw" id="status-wiki" data-state="ready"></div>`.

## 6. Готовность

- [x] 41 карточка, все кликаются
- [x] Поиск и фильтры работают, счётчик верен
- [x] Пустой результат → понятный `.sw-empty`
- [x] Ошибки загрузки показывают понятное сообщение
- [x] Адаптивные стили (360 / 768 / 1440 px)
- [x] Светлая и тёмная тема читаемы
- [x] Доступность: клавиатура, фокус, `aria-*`, `prefers-reduced-motion`
- [x] Источник проверен в Roblox Studio: `ReplicatedStorage.Shared.Combat.StatusEffects` (41 ModuleScript)

Заметка: данные статичны и обновляются при следующем экспорте из Studio; сайт на GitHub Pages не подключается к Studio автоматически.
