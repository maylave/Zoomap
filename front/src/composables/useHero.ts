// composables/useHero.ts
import { computed, reactive, ref, type Ref, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface HeroReturn {
  isEditModalOpen: Ref<boolean>
  isModalOpen: Ref<boolean>
  selectedAnimalId: Ref<string | null>
  heroRef: Ref<HTMLElement | null>
  cardRef: Ref<HTMLElement | null>
  cursor: { x: number; y: number }
  satellite1: { x: number; y: number }
  satellite2: { x: number; y: number }
  rotate: { x: number; y: number }
  cardMouse: { x: number; y: number }
  cardStyle: ComputedRef<{ transform: string }>
  badgeText: Ref<string>
  titleLine1: Ref<string>
  titleLine2: Ref<string>
  titleLine3: Ref<string>
  description: Ref<string>
  buttonText1: Ref<string>
  buttonText2: Ref<string>
  cardBadge: Ref<string>
  animalName: Ref<string>
  animalInfo: Ref<string>
  statsAnimals: Ref<string>
  statsContinents: Ref<string>
  editFields: ComputedRef<any[]>
  handleEditSave: (values: Record<string, any>) => void
  handleGlobalMouseMove: (e: MouseEvent) => void
  handleCardMouseMove: (e: MouseEvent) => void
  handleCardMouseLeave: () => void
  openAnimalModal: (id: string) => void
  closeAnimalModal: () => void
  goToMap: () => void
  openEditModal: () => void
  closeEditModal: () => void
  toggleEditMode: () => void
}

export const useHero = (): HeroReturn => {
  const authStore = useAuthStore()
  const router = useRouter()

  const isEditModalOpen = ref(false)
  const isModalOpen = ref(false)
  const selectedAnimalId = ref<string | null>(null)

  const heroRef = ref<HTMLElement | null>(null)
  const cursor = reactive({ x: 0, y: 0 })
  const satellite1 = reactive({ x: 0, y: 0 })
  const satellite2 = reactive({ x: 0, y: 0 })

  const badgeText = ref('Открыто каждый день')
  const titleLine1 = ref('Мир дикой')
  const titleLine2 = ref('природы')
  const titleLine3 = ref('у твоих ног')
  const description = ref(
    'ZooVerse — живое путешествие по пяти континентам без перелётов. Более 3 000 животных, интерактивные зоны и незабываемые впечатления для всей семьи.'
  )
  const buttonText1 = ref('Познакомиться с животными')
  const buttonText2 = ref('Интерактивная карта')
  const cardBadge = ref('Звезда сезона')
  const animalName = ref('Симба')
  const animalInfo = ref('Африканский лев · Зона Саванна')
  const statsAnimals = ref('3000+')
  const statsContinents = ref('5')

  const editFields = computed(() => [
    { key: 'badgeText', label: 'Бейдж статуса', type: 'text' as const, value: badgeText },
    { key: 'titleLine1', label: 'Заголовок (строка 1)', type: 'text' as const, value: titleLine1 },
    { key: 'titleLine2', label: 'Заголовок (строка 2)', type: 'text' as const, value: titleLine2 },
    { key: 'titleLine3', label: 'Заголовок (строка 3)', type: 'text' as const, value: titleLine3 },
    { key: 'description', label: 'Описание', type: 'textarea' as const, value: description },
    { key: 'buttonText1', label: 'Текст первой кнопки', type: 'text' as const, value: buttonText1 },
    { key: 'buttonText2', label: 'Текст второй кнопки', type: 'text' as const, value: buttonText2 },
    { key: 'cardBadge', label: 'Бейдж на карточке', type: 'text' as const, value: cardBadge },
    { key: 'animalName', label: 'Имя животного', type: 'text' as const, value: animalName },
    { key: 'animalInfo', label: 'Информация о животном', type: 'text' as const, value: animalInfo },
    {
      key: 'statsAnimals',
      label: 'Статистика: животные',
      type: 'text' as const,
      value: statsAnimals,
    },
    {
      key: 'statsContinents',
      label: 'Статистика: континенты',
      type: 'text' as const,
      value: statsContinents,
    },
  ])

  const handleEditSave = (values: Record<string, any>) => {
    if (values.badgeText !== undefined) badgeText.value = values.badgeText
    if (values.titleLine1 !== undefined) titleLine1.value = values.titleLine1
    if (values.titleLine2 !== undefined) titleLine2.value = values.titleLine2
    if (values.titleLine3 !== undefined) titleLine3.value = values.titleLine3
    if (values.description !== undefined) description.value = values.description
    if (values.buttonText1 !== undefined) buttonText1.value = values.buttonText1
    if (values.buttonText2 !== undefined) buttonText2.value = values.buttonText2
    if (values.cardBadge !== undefined) cardBadge.value = values.cardBadge
    if (values.animalName !== undefined) animalName.value = values.animalName
    if (values.animalInfo !== undefined) animalInfo.value = values.animalInfo
    if (values.statsAnimals !== undefined) statsAnimals.value = values.statsAnimals
    if (values.statsContinents !== undefined) statsContinents.value = values.statsContinents

    console.log('Сохранены изменения:', values)
  }

  // ✅ ИСПРАВЛЕНО: Прямые координаты для fixed + плавные спутники
  const handleGlobalMouseMove = (e: MouseEvent) => {
    cursor.x = e.clientX
    cursor.y = e.clientY

    // Плавное следование спутников с естественным смещением
    satellite1.x += (e.clientX - satellite1.x) * 0.15
    satellite1.y += (e.clientY - satellite1.y) * 0.15

    satellite2.x += (e.clientX - satellite2.x) * 0.08
    satellite2.y += (e.clientY - satellite2.y) * 0.08
  }

  const cardRef = ref<HTMLElement | null>(null)
  const cardMouse = reactive({ x: 0, y: 0 })
  const rotate = reactive({ x: 0, y: 0 })

  const handleCardMouseMove = (e: MouseEvent) => {
    if (!cardRef.value) return
    const rect = cardRef.value.getBoundingClientRect()

    cardMouse.x = e.clientX - rect.left
    cardMouse.y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    rotate.y = (e.clientX - rect.left - centerX) / 15
    rotate.x = -(e.clientY - rect.top - centerY) / 15
  }

  const handleCardMouseLeave = () => {
    rotate.x = 0
    rotate.y = 0
  }

  // ✅ ИСПРАВЛЕНО: Добавлена перспектива и scale
  const cardStyle = computed(() => ({
    transform: `perspective(1000px) rotateY(${rotate.y}deg) rotateX(${rotate.x}deg) scale3d(1.02, 1.02, 1.02)`,
    transformStyle: 'preserve-3d',
  }))

  const openAnimalModal = (id: string) => {
    selectedAnimalId.value = id
    isModalOpen.value = true
  }

  const closeAnimalModal = () => {
    isModalOpen.value = false
    setTimeout(() => {
      selectedAnimalId.value = null
    }, 300)
  }

  const goToMap = () => {
    router.push('/zones')
  }

  const openEditModal = () => {
    isEditModalOpen.value = true
  }

  const closeEditModal = () => {
    isEditModalOpen.value = false
  }

  const toggleEditMode = () => {
    openEditModal()
  }

  return {
    isEditModalOpen,
    isModalOpen,
    selectedAnimalId,
    heroRef,
    cardRef,
    cursor,
    satellite1,
    satellite2,
    rotate,
    cardMouse,
    cardStyle,
    badgeText,
    titleLine1,
    titleLine2,
    titleLine3,
    description,
    buttonText1,
    buttonText2,
    cardBadge,
    animalName,
    animalInfo,
    statsAnimals,
    statsContinents,
    editFields,
    handleEditSave,
    handleGlobalMouseMove,
    handleCardMouseMove,
    handleCardMouseLeave,
    openAnimalModal,
    closeAnimalModal,
    goToMap,
    openEditModal,
    closeEditModal,
    toggleEditMode,
  }
}
