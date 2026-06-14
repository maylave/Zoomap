export type IconName =
  | 'lion'
  | 'moon'
  | 'elephant'
  | 'arrowRight'
  | 'arrowLeft'
  | 'arrowDown'
  | 'arrowUP'

export interface EventItem {
  day: string
  month: string
  icon: IconName

  category: string
  title: string
  description: string
  price: string
  priceLabel: string
  button: string
  dateBg: string
  categoryColor: string
}
