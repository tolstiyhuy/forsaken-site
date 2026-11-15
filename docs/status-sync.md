# Как обновить вики статусов

Вики статус-эффектов — **статический снимок** из Roblox Studio. GitHub Pages раздаёт только файлы, поэтому страница не может сама спросить игру «что изменилось». Обновление всегда идёт в два шага: выгрузить данные из Studio, затем закоммитить результат.

## Почему нельзя «просто подключить» игру к сайту

- Studio — локальный редактор. Наружу он не отдаёт данные, к нему подключается только ассистент через MCP на твоей машине.
- Публичный Roblox API по этому месту (`universeId 10767100494`) возвращает заглушку без названия и со нулями: игра закрыта от чтения, поэтому «живых» цифр он не даёт.
- Значит, любая плашка вида «серверы онлайн» без реального источника — выдумка. На сайте таких нет.

## Шаг 1. Выгрузить данные из Studio

1. Открой проект в Studio (place `100668519081940`).
2. Попроси ассистента с доступом к Studio перечитать папку:

   ```
   ReplicatedStorage.Shared.Combat.StatusEffects
   ```

   Проверить количество и имена можно так:

   ```lua
   local folder = game.ReplicatedStorage.Shared.Combat.StatusEffects
   local out = {}
   for _, module in ipairs(folder:GetChildren()) do
       local ok, value = pcall(require, module)
       table.insert(out, {
           name = module.Name,
           ok = ok,
           description = ok and value.Description or tostring(value),
           duration = ok and value.Duration or nil,
           maxLevel = ok and value.MaxLevel or nil,
           stackable = ok and value.Stackable or nil,
           hidden = ok and value.Hidden or nil,
           color = ok and value.TooltipColor or nil,
       })
   end
   return out
   ```

3. Перенеси поля в `docs/status-data.json` (`effects`), сохраняя порядок как в игре.

## Шаг 2. Обновить файлы сайта

1. `js/status-data.js` — массив `window.STATUS_WIKI`: по одной записи на эффект, русский текст в `desc` и `mechanics`.
2. `js/status-data.js` — `window.STATUS_WIKI_META`: обнови `checked` (дата сверки).
3. Если число эффектов изменилось — поправь счётчики в `index.html` (`page-head__meta` и текст секции).
4. Подними `?v=` у `js/status-wiki.js`, `js/status-data.js` и `css/status-wiki.css` в `index.html`, иначе браузеры покажут старый кэш.
5. Прогони проверки:

   ```powershell
   node --check js/status-data.js
   node --check js/status-wiki.js
   python -m http.server 5173 --bind 127.0.0.1
   ```

   Открой `http://127.0.0.1:5173/index.html#/tab/mechanics` и убедись, что количество карточек совпадает с числом эффектов в папке.

## Что проверять в первую очередь

- Появились новые ModuleScript — их нет на сайте, пока не добавишь записи.
- Изменились `Duration`, `MaxLevel`, `Stackable`, `TooltipColor` — старые карточки будут врать.
- Поменялся русский текст — сверяй с `desc_en`, но не копируй машинный перевод дословно.
