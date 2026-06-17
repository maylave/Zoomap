import type { MenuGroup, MenuContext } from '@/types/profileMenu.types'

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
        badge: 3,
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
      },
      {
        id: 'promocodes',
        label: 'Промокоды',
        description: 'Ваши скидки и промокоды',
        icon: 'ticket',
        badge: 3,
      },
    ],
  },
  {
    title: 'Администрирование',
    items: [
      {
        id: 'admin',
        label: 'Пользователи',
        description: 'Управление пользователями системы',
        icon: 'admin',
        badge: 156,
      },
    ],
  },
]

export const menuContexts: Record<string, MenuContext> = {
  profile: {
    label: 'Мой профиль',
    description: 'Управляйте личной информацией и настройками аккаунта',
  },
  notifications: {
    label: 'Уведомления',
    description: 'Настройте, какие уведомления вы хотите получать',
  },
  appearance: { label: 'Внешний вид', description: 'Настройте тему оформления и язык интерфейса' },
  history: { label: 'История покупок', description: 'Просмотр истории ваших покупок' },
  promocodes: { label: 'Промокоды', description: 'Ваши активные скидки и промокоды' },
  admin: {
    label: 'Управление пользователями',
    description: 'Просмотр, создание и редактирование пользователей',
  },
}
