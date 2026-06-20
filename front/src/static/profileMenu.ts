import type { MenuGroup, MenuContext } from '@/types/profileMenu.types'

// ==================== СТАТИЧЕСКОЕ МЕНЮ ====================
export const menuGroups: MenuGroup[] = [
  {
    title: 'Аккаунт',
    items: [
      {
        id: 'profile',
        label: 'Профиль',
        description: 'Управление личной информацией и аватаром',
        icon: 'user',
      },
      {
        id: 'notifications',
        label: 'Уведомления',
        description: 'Настройка оповещений и звуков',
        icon: 'bell',
        badge: 0,
      },
      {
        id: 'appearance',
        label: 'Внешний вид',
        description: 'Тема оформления, язык и шрифты',
        icon: 'palette',
      },
    ],
  },
  {
    title: 'История',
    items: [
      {
        id: 'history',
        label: 'История покупок',
        description: 'Просмотр истории ваших покупок',
        icon: 'history',
        badge: 0, // ✅ Реальное количество покупок
      },
      {
        id: 'promocodes',
        label: 'Промокоды',
        description: 'Ваши скидки и промокоды',
        icon: 'ticket',
        badge: 0, // ✅ Реальное количество промокодов
      },
    ],
  },
  {
    title: 'Администрирование',
    items: [
      {
        id: 'admin-users',
        label: 'Пользователи',
        description: 'Управление пользователями системы',
        icon: 'admin',
        badge: 0,
      },
      {
        id: 'admin-animals',
        label: 'Животные',
        description: 'Каталог животных зоопарка',
        icon: 'paw',
      },
      {
        id: 'admin-zones',
        label: 'Зоны',
        description: 'Управление зонами зоопарка',
        icon: 'map',
      },
      {
        id: 'admin-events',
        label: 'События',
        description: 'Мероприятия и активности',
        icon: 'calendar',
      },
      {
        id: 'admin-tickets',
        label: 'Билеты',
        description: 'Типы билетов и цены',
        icon: 'ticket',
      },
      {
        id: 'admin-bookings',
        label: 'Бронирования',
        description: 'Заказы посетителей',
        icon: 'clipboard',
        badge: 0,
      },
      {
        id: 'admin-gallery',
        label: 'Галерея',
        description: 'Фотоальбомы зоопарка',
        icon: 'images',
      },
      {
        id: 'admin-promocodes',
        label: 'Промокоды',
        description: 'Управление скидочными кодами',
        icon: 'percent',
        badge: 0,
      },
      {
        id: 'admin-ticker',
        label: 'Бегущая строка',
        description: 'Информационная строка',
        icon: 'ticker',
      },
    ],
  },
]

// ==================== ФУНКЦИЯ ДЛЯ СОЗДАНИЯ КОПИИ МЕНЮ ====================
export const createMenuGroups = (): MenuGroup[] => {
  // Глубокое клонирование чтобы не мутировать оригинал
  return JSON.parse(JSON.stringify(menuGroups))
}

// ==================== ОБНОВЛЕНИЕ БЕЙДЖЕЙ ====================
export const updateMenuBadges = (
  menuGroups: MenuGroup[],
  badges: Record<string, number>
): MenuGroup[] => {
  menuGroups.forEach((group) => {
    group.items.forEach((item) => {
      if (badges[item.id] !== undefined) {
        // Показываем бейдж только если значение > 0
        item.badge = badges[item.id] > 0 ? badges[item.id] : undefined
      }
    })
  })
  return menuGroups
}

// ==================== КОНТЕКСТЫ МЕНЮ ====================
export const menuContexts: Record<string, MenuContext> = {
  profile: {
    label: 'Мой профиль',
    description: 'Управляйте личной информацией и настройками аккаунта',
  },
  notifications: {
    label: 'Уведомления',
    description: 'Настройте, какие уведомления вы хотите получать',
  },
  appearance: {
    label: 'Внешний вид',
    description: 'Настройте тему оформления и язык интерфейса',
  },
  history: {
    label: 'История покупок',
    description: 'Просмотр истории ваших покупок',
  },
  promocodes: {
    label: 'Промокоды',
    description: 'Ваши активные скидки и промокоды',
  },
  'admin-users': {
    label: 'Управление пользователями',
    description: 'Просмотр, создание и редактирование пользователей',
  },
  'admin-animals': {
    label: 'Управление животными',
    description: 'Добавление, редактирование и удаление животных из каталога',
  },
  'admin-zones': {
    label: 'Управление зонами',
    description: 'Настройка зон зоопарка и их расположения на карте',
  },
  'admin-events': {
    label: 'Управление событиями',
    description: 'Создание и редактирование мероприятий',
  },
  'admin-tickets': {
    label: 'Управление билетами',
    description: 'Настройка типов билетов и их стоимости',
  },
  'admin-bookings': {
    label: 'Бронирования',
    description: 'Просмотр и управление заказами посетителей',
  },
  'admin-gallery': {
    label: 'Управление галереей',
    description: 'Добавление и редактирование фотографий',
  },
  'admin-promocodes': {
    label: 'Управление промокодами',
    description: 'Создание и настройка скидочных кодов',
  },
  'admin-ticker': {
    label: 'Бегущая строка',
    description: 'Управление информационной строкой на сайте',
  },
}
