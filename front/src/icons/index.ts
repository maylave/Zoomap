import { animalIcons } from './animal'
import { arrowIcons } from './icons'
import {profileIcons} from './profileIcons'
// Склеиваем объекты в один
export const allIcons = {
  ...animalIcons,
  ...arrowIcons,
  ...profileIcons

} as const

// Общий тип, который включает ВСЕ имена иконок из обоих файлов
export type IconName = keyof typeof allIcons