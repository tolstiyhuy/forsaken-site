/* ============================================================
   FORSAKEN — данные досье
   Собрано из текущей сборки проекта в Roblox Studio (v1.0.23)
   ============================================================ */

const SITE_DATA = {
  killers: [
    {
      id: "johndoe",
      name: "John Doe",
      file: "KD-001",
      role: "killer",
      rarity: "legendary",
      rarityLabel: "ЛЕГЕНДАРНЫЙ",
      price: 1200,
      hp: 1200,
      speed: 8,
      terror: 60,
      img: "assets/johndoe.png",
      accent: "#e01b24",
      quote: "You can't escape me.",
      desc: "Дефектный код первых дней Roblox. Он не охотится — он возвращается. Там, где ступает John Doe, воздух становится тяжёлым, а земля помнит каждый шаг.",
      abilities: [
        { name: "Natural Malevolence", type: "passive", cd: "PASSIVE", desc: "За убийцей остаётся след порчи. Выживший, коснувшийся его, получает Corrupted I на 10 секунд." },
        { name: "Unstoppable", type: "passive", cd: "PASSIVE", desc: "Во время Corrupt Energy и 404 Error оглушение длится не более 1.6 сек. Если способность прервана — Speed I на 10 секунд." },
        { name: "Slash", type: "active", cd: "2 сек", desc: "Базовый разрез: 28 урона. Замах 0.3 сек, дальность 6 студов. Быстрый и почти безжалостный." },
        { name: "Corrupt Energy", type: "active", cd: "18 сек", desc: "Выпускает 27 шипов порчи на 14 секунд. 12 урона за попадание, Speed I на 7 секунд. Не более 4 попаданий по одной цели." },
        { name: "Digital Footprint", type: "active", cd: "8 сек", desc: "Оставляет три цифровые ловушки на 165 секунд. Активация даёт убийце Speed I, жертве — Corrupted I и Slowness II на 10 секунд, а также раскрывает её ауру." },
        { name: "404 Error", type: "ultimate", cd: "45 сек", desc: "Реальность даёт сбой. Все живые выжившие раскрывают свои ауры на 10 секунд." }
      ]
    },
    {
      id: "1x1x1x1",
      name: "1x1x1x1",
      file: "KD-002",
      role: "killer",
      rarity: "legendary",
      rarityLabel: "ЛЕГЕНДАРНЫЙ",
      price: 1100,
      hp: 1100,
      speed: 8,
      terror: 60,
      img: "assets/1x1x1x1.png",
      accent: "#e01b24",
      quote: "You can't escape me.",
      desc: "Первая ошибка. Первый охотник. Никто не знает, сколько раз он уже был здесь — и был ли он вообще.",
      abilities: [
        { name: "Primary Attack", type: "active", cd: "—", desc: "Искажённый удар. Данные о полном наборе способностей повреждены — кит находится в разработке." }
      ]
    },
    {
      id: "slasher",
      name: "Slasher",
      file: "KD-003",
      role: "killer",
      rarity: "common",
      rarityLabel: "ОБЫЧНЫЙ",
      price: 0,
      hp: 1250,
      speed: 9,
      terror: 45,
      img: "assets/slasher.png",
      accent: "#ff4b3a",
      quote: "There is nothing left to feel.",
      desc: "Не остановка, не стратегия — чистая ярость. Slasher не прячется и не ждёт. Он идёт напрямик, и этого обычно достаточно.",
      abilities: [
        { name: "Slash", type: "active", cd: "2 сек", desc: "Широкий разрез мачете. Основной источник урона и главный аргумент в погоне." },
        { name: "Behead", type: "active", cd: "12 сек", desc: "Замах с плеча. Оглушает цель и оставляет её без возможности бежать." },
        { name: "Gashing Wound", type: "active", cd: "10 сек", desc: "Глубокая рана, вызывающая Bleeding. Выживший теряет HP, пока не остановит кровотечение." },
        { name: "Raging Pace", type: "ultimate", cd: "35 сек", desc: "Всплеск ярости: скорость резко возрастает, а звук собственного сердцебиения заглушает всё остальное." }
      ]
    },
    {
      id: "chronos",
      name: "Chronos",
      file: "KD-004",
      role: "killer",
      rarity: "common",
      rarityLabel: "ОБЫЧНЫЙ",
      price: 1409,
      hp: 1011,
      speed: 7.5,
      terror: 60,
      img: "assets/chronos.png",
      accent: "#3f8cff",
      quote: "Tick tock. Your time is running out.",
      desc: "Сущность, у которой вместо лица циферблат. Chronos не торопится — зачем, если время всё равно подчиняется ему?",
      abilities: [
        { name: "Time Shield", type: "active", cd: "20 сек", desc: "Оборачивает убийцу искажённым временем и блокирует следующий удар." },
        { name: "Paradox", type: "active", cd: "16 сек", desc: "Создаёт парадокс вокруг цели: пространство на миг перестаёт быть надёжным." },
        { name: "Overtime", type: "passive", cd: "PASSIVE", desc: "Чем дольше длится погоня, тем сильнее становится Chronos." },
        { name: "Accelerate", type: "active", cd: "14 сек", desc: "Разгоняет собственное время, сокращая дистанцию до жертвы." },
        { name: "Time Rewind", type: "active", cd: "30 сек", desc: "Откатывает позицию убийцы на несколько секунд назад. Побег сжимается в ловушку." },
        { name: "Time Stop", type: "ultimate", cd: "60 сек", desc: "Останавливает время для всех, кроме себя. Несколько секунд абсолютной тишины." }
      ]
    },
    {
      id: "adminjohndoe",
      name: "Admin John Doe",
      file: "KD-???",
      role: "killer",
      rarity: "admin",
      rarityLabel: "АДМИН",
      price: null,
      hp: 3182026,
      speed: 21,
      terror: 60,
      img: "assets/johndoe.png",
      accent: "#ff0033",
      quote: "The true corrupted code. Unstoppable.",
      desc: "Не персонаж, а предупреждение. Существует вне баланса, вне ротации и вне любых правил. Встретить его в обычном матче невозможно — пока он сам этого не захочет.",
      abilities: [
        { name: "Mr Doe", type: "passive", cd: "PASSIVE", desc: "Истинный код. Ограничения длительности и перезарядки на него не распространяются." },
        { name: "Kill Rush", type: "ultimate", cd: "—", desc: "Серия мгновенных казней. Не оставляет ни шанса, ни времени на реакцию." }
      ]
    },
    {
      id: "doombringer",
      name: "Doombringer",
      file: "KD-006",
      role: "killer",
      rarity: "common",
      rarityLabel: "ОБЫЧНЫЙ",
      price: 1800,
      hp: 1800,
      speed: 7.5,
      terror: 45,
      img: null,
      accent: "#ff7a2b",
      quote: "Your name is already on the list.",
      desc: "Гора брони и молот размером с дверь. Doombringer не догоняет — он оказывается там, где ты собирался быть.",
      abilities: [
        { name: "Immovable", type: "passive", cd: "PASSIVE", desc: "Сопротивление контролю и отбрасыванию. Сдвинуть его с места почти невозможно." },
        { name: "Ban List", type: "active", cd: "20 сек", desc: "Помечает выживших. Отмеченные цели видны сквозь стены и не могут спрятаться надолго." },
        { name: "Hammer Strike", type: "active", cd: "6 сек", desc: "Сокрушительный удар молотом. Пробивает укрытия и ломает построенные стены." },
        { name: "Hammer Jump", type: "active", cd: "12 сек", desc: "Прыжок с замахом. Приземление создаёт ударную волну." },
        { name: "Hammer Throw", type: "ultimate", cd: "40 сек", desc: "Бросок молота по прямой. Всё, что окажется на линии, перестаёт иметь значение." }
      ]
    },
    {
      id: "walker",
      name: "Walker",
      file: "KD-007",
      role: "killer",
      rarity: "common",
      rarityLabel: "ОБЫЧНЫЙ",
      price: 800,
      hp: 400,
      speed: 10,
      terror: 30,
      img: null,
      accent: "#a45cff",
      quote: "Every step takes something from you.",
      desc: "Он не спешит. Ему не нужно. Walker собирает души — медленно, методично, одну за другой, пока вокруг не останется никого.",
      abilities: [
        { name: "Vampirism", type: "passive", cd: "PASSIVE", desc: "Лечится от нанесённого урона. Чем дольше бой, тем сложнее его убить." },
        { name: "Soul Harvest", type: "active", cd: "—", desc: "Собирает души с раненых и павших. Каждая душа — ресурс для следующих способностей." },
        { name: "Soul Economy", type: "passive", cd: "PASSIVE", desc: "Тратит души на усиления. Голодный Walker слаб, сытый — почти неостановим." },
        { name: "Bleeding", type: "active", cd: "8 сек", desc: "Оставляет кровоточащую рану. Цель теряет HP и оставляет след." },
        { name: "Dread Aura", type: "passive", cd: "PASSIVE", desc: "Аура ужаса давит на выживших рядом, замедляя их действия." },
        { name: "Shadowraze", type: "active", cd: "14 сек", desc: "Волна тьмы по земле. Пробивает укрытия и вынуждает двигаться." },
        { name: "Soul Requiem", type: "ultimate", cd: "50 сек", desc: "Реквием по всем собранным душам. Временное усиление, за которое придётся заплатить." }
      ]
    }
  ],

  survivors: [
    {
      id: "shedletsky",
      name: "Shedletsky",
      file: "SV-001",
      role: "survivor",
      rarity: "common",
      rarityLabel: "ОБЫЧНЫЙ",
      price: 0,
      hp: 100,
      speed: 12,
      terror: null,
      img: null,
      accent: "#f8d96d",
      quote: "BLAME SOSALKEN!",
      desc: "Живая легенда Roblox и владелец Linked Sword. Shedletsky дрался с богами, банами и собственной репутацией — и всё ещё здесь.",
      abilities: [
        { name: "Slash", type: "active", cd: "—", desc: "Удар Linked Sword. Единственный способ дать сдачи — и иногда этого достаточно, чтобы выиграть секунду." },
        { name: "Fried Chicken", type: "active", cd: "45 сек", desc: "Жареная курица. Восстанавливает силы и даёт кратковременный прилив скорости. Не спрашивай, откуда она." }
      ]
    },
    {
      id: "twotime",
      name: "Two Time",
      file: "SV-002",
      role: "survivor",
      rarity: "common",
      rarityLabel: "ОБЫЧНЫЙ",
      price: 500,
      hp: 80,
      speed: 12,
      terror: null,
      img: "assets/twotime.png",
      accent: "#a45cff",
      quote: "Shadows die twice.",
      desc: "Хрупкий культист с кинжалом и одной очень странной идеей: смерть — это не конец, а просто ещё один ритуал.",
      abilities: [
        { name: "Oblation", type: "passive", cd: "PASSIVE", desc: "Собирает кровь с убийцы: 3 единицы спереди, 4.5 в спину. Восемь единиц открывают вторую жизнь." },
        { name: "Sacrificial Dagger", type: "active", cd: "30 сек", desc: "Ритуальный кинжал: 10 урона спереди, 20 в спину. Быстрый, тихий, опасный." },
        { name: "Crouch", type: "active", cd: "45 сек", desc: "Приседает, получая Invisibility III и Undetectable I. Минимальная перезарядка — 35 секунд." },
        { name: "Ritual", type: "active", cd: "—", desc: "Ставит точку ритуала. Если смерть всё-таки случится, он вернётся здесь — но со здоровьем вдвое меньше." }
      ]
    },
    {
      id: "j91nd",
      name: "J91nD",
      file: "SV-003",
      role: "survivor",
      rarity: "common",
      rarityLabel: "ОБЫЧНЫЙ",
      price: 501,
      hp: 75,
      speed: 12,
      terror: null,
      img: "assets/j91nd.png",
      accent: "#d98a6a",
      quote: "Build. Block. Survive.",
      desc: "Самый методичный из выживших. Пока другие бегут, J91nD строит стену. Иногда это единственное, что имеет значение.",
      abilities: [
        { name: "Structural Resolve", type: "passive", cd: "PASSIVE", desc: "Стойкость конструкции: построенные им укрепления живут дольше и выдерживают больше ударов." },
        { name: "Wallbreaker", type: "passive", cd: "PASSIVE", desc: "Знает слабые места любых конструкций — своих и чужих." },
        { name: "Brick Wall", type: "active", cd: "E", desc: "Возводит кирпичную стену. Перекрывает линию зрения и покупает драгоценные секунды." },
        { name: "Patch Up", type: "active", cd: "T", desc: "Латает стену или себя. Медленно, зато надёжно." },
        { name: "Detonate", type: "ultimate", cd: "R", desc: "Подрывает собственные постройки, создавая обломки и зону контроля." },
        { name: "Bastion Flag", type: "ultimate", cd: "Q", desc: "Ставит знамя Бастиона. Внутри зоны союзники получают усиление, а враг — нет." }
      ]
    }
  ],

  maps: [
    {
      id: "bloodfell",
      name: "Bloodfell Manor",
      ru: "Кровавое поместье",
      tag: "В РОТАЦИИ",
      type: "Закрытая",
      danger: 5,
      desc: "Готический особняк с длинными коридорами и слишком большим количеством дверей. Здесь эхо приходит раньше шагов.",
      c1: "#3a0d12", c2: "#080506", accent: "#c2212e", glyph: "B"
    },
    {
      id: "beachhouse",
      name: "Beach House Paradise",
      ru: "Райский пляж",
      tag: "В РОТАЦИИ",
      type: "Открытая",
      danger: 3,
      desc: "Солнце, вода и идеальный горизонт. Рай, который давно перестал быть раем, но всё ещё умеет выглядеть как открытка.",
      c1: "#0c3b45", c2: "#061014", accent: "#43d6c5", glyph: "P"
    },
    {
      id: "c00lcarnival",
      name: "C00lCarnival",
      ru: "Карнавал",
      tag: "В РОТАЦИИ",
      type: "Смешанная",
      danger: 4,
      desc: "Огни, музыка и зеркала. Слишком много зеркал. На карнавале легко потеряться — и почти невозможно понять, что ты уже не один.",
      c1: "#3b0d45", c2: "#0a0610", accent: "#ff3ea5", glyph: "C"
    },
    {
      id: "blucarnaval",
      name: "BluCarnival",
      ru: "Блюкарнавал",
      tag: "В РОТАЦИИ",
      type: "Смешанная",
      danger: 4,
      desc: "Синяя копия карнавала, где всё почти на своих местах. Почти. Вывеска горит, карусели крутятся, но посетителей больше нет.",
      c1: "#102a55", c2: "#040812", accent: "#5b9dff", glyph: "B"
    },
    {
      id: "area51",
      name: "Area 51",
      ru: "Зона 51",
      tag: "В РОТАЦИИ",
      type: "Закрытая",
      danger: 4,
      desc: "Секретный объект, который перестал отвечать на запросы. В лабораториях всё ещё горит свет — и это худшая новость.",
      c1: "#123a12", c2: "#050b05", accent: "#7bff5c", glyph: "A"
    },
    {
      id: "brandonworks",
      name: "BrandonWorks",
      ru: "Завод Брэндона",
      tag: "В РОТАЦИИ",
      type: "Закрытая",
      danger: 3,
      desc: "Заброшенное производство, ржавые лестницы и гул, который не прекращается даже когда машины выключены.",
      c1: "#3a240d", c2: "#0b0805", accent: "#ff8a2b", glyph: "W"
    },
    {
      id: "cakefactory",
      name: "Cake Factory",
      ru: "Кондитерская фабрика",
      tag: "В РОТАЦИИ",
      type: "Закрытая",
      danger: 2,
      desc: "Приторно-розовые цеха и конвейеры, которые всё ещё работают. Сладкий запах не скрывает, что здесь готовили вовсе не торты.",
      c1: "#3a0d2a", c2: "#0d0509", accent: "#ff7ab8", glyph: "K"
    },
    {
      id: "crossroads",
      name: "Crossroads",
      ru: "Перекрёсток",
      tag: "В РОТАЦИИ",
      type: "Открытая",
      danger: 3,
      desc: "Туман, дорога и знак, на котором стёрты все направления. Куда бы ты ни пошёл — вернёшься туда же.",
      c1: "#3a2c0d", c2: "#0b0905", accent: "#ffce6b", glyph: "X"
    },
    {
      id: "battlegrounds",
      name: "Classic Battlegrounds",
      ru: "Классические поля",
      tag: "В РОТАЦИИ",
      type: "Открытая",
      danger: 2,
      desc: "Знакомые декорации старой школы Roblox. Ностальгия длится ровно до первого удара — дальше всё по-настоящему.",
      c1: "#0d2240", c2: "#050a12", accent: "#5b9dff", glyph: "G"
    },
    {
      id: "testmap",
      name: "Testmap",
      ru: "Полигон",
      tag: "DEV",
      type: "Тестовая",
      danger: 0,
      desc: "Служебная локация для проверки механик. Здесь рождаются баги, баланс и самые странные истории разработчиков.",
      c1: "#232328", c2: "#0a0a0c", accent: "#9a9aa5", glyph: "T"
    }
  ]
};
