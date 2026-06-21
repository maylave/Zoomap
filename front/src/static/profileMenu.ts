import type { MenuGroup, MenuItem } from '@/types/menu'

export const createMenuGroups = (
  userRole: 'user' | 'moderator' | 'admin' = 'user'
): MenuGroup[] => {
  const baseGroups: MenuGroup[] = [
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
          badge: 0,
        },
        {
          id: 'promocodes',
          label: 'Промокоды',
          description: 'Ваши скидки и промокоды',
          icon: 'ticket',
          badge: 0,
        },
      ],
    },
  ]

  // ✅ Админ-меню только для admin и moderator
  if (userRole === 'admin' || userRole === 'moderator') {
    baseGroups.push({
      title: 'Администрирование',
      items: [
        {
          id: 'adminUsers',
          label: 'Пользователи',
          description: 'Управление пользователями системы',
          icon: 'admin',
          badge: 0,
        },
        {
          id: 'adminAnimals',
          label: 'Животные',
          description: 'Каталог животных зоопарка',
          icon: 'paw',
        },
        {
          id: 'adminZones',
          label: 'Зоны',
          description: 'Управление зонами зоопарка',
          icon: 'map',
        },
        {
          id: 'adminEvents',
          label: 'События',
          description: 'Мероприятия и активности',
          icon: 'calendar',
        },
        {
          id: 'adminTickets',
          label: 'Билеты',
          description: 'Типы билетов и цены',
          icon: 'ticket',
        },
        {
          id: 'adminBookings',
          label: 'Бронирования',
          description: 'Заказы посетителей',
          icon: 'clipboard',
          badge: 0,
        },
        {
          id: 'adminGallery',
          label: 'Галерея',
          description: 'Фотоальбомы зоопарка',
          icon: 'images',
        },
        {
          id: 'adminPromocodes',
          label: 'Промокоды',
          description: 'Управление скидочными кодами',
          icon: 'percent',
          badge: 0,
        },
        {
          id: 'adminTicker',
          label: 'Бегущая строка',
          description: 'Информационная строка',
          icon: 'ticker',
        },
      ],
    })
  }

  return baseGroups
}

export const menuContexts: Record<string, { label: string; description: string }> = {
  profile: {
    label: 'Профиль',
    description: 'Управление личной информацией',
  },
  notifications: {
    label: 'Уведомления',
    description: 'Настройка оповещений',
  },
  appearance: {
    label: 'Внешний вид',
    description: 'Тема и язык',
  },
  history: {
    label: 'История покупок',
    description: 'Ваши заказы',
  },
  promocodes: {
    label: 'Промокоды',
    description: 'Ваши скидки',
  },
  adminUsers: {
    label: 'Управление пользователями',
    description: 'Просмотр, создание и редактирование пользователей',
  },
  adminAnimals: {
    label: 'Управление животными',
    description: 'Добавление, редактирование и удаление животных',
  },
  adminZones: {
    label: 'Управление зонами',
    description: 'Настройка зон зоопарка',
  },
  adminEvents: {
    label: 'Управление событиями',
    description: 'Создание и редактирование мероприятий',
  },
  adminTickets: {
    label: 'Управление билетами',
    description: 'Настройка типов билетов и цен',
  },
  adminBookings: {
    label: 'Бронирования',
    description: 'Просмотр и управление заказами',
  },
  adminGallery: {
    label: 'Управление галереей',
    description: 'Добавление и редактирование фотографий',
  },
  adminPromocodes: {
    label: 'Управление промокодами',
    description: 'Создание и настройка скидочных кодов',
  },
  adminTicker: {
    label: 'Бегущая строка',
    description: 'Управление информационной строкой',
  },
}
