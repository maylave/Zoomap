// composables/useHero.ts
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const useHero = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  // State for Edit Modal
  const isEditModalOpen = ref(false)
  const isModalOpen = ref(false)
  const selectedAnimalId = ref<string | null>(null)

  // State for Global Cursor Glow
  const heroRef = ref<HTMLElement | null>(null)
  const cursor = reactive({ x: 0, y: 0 })
  const satellite1 = reactive({ x: 0, y: 0 })
  const satellite2 = reactive({ x: 0, y: 0 })

  // Публичные реактивные данные
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
    // TODO: отправить данные на бэкенд
  }

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!heroRef.value) return
    const rect = heroRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    cursor.x = x
    cursor.y = y
    satellite1.x = x + 30
    satellite1.y = y + 50
    satellite2.x = x - 20
    satellite2.y = y + 70
  }

  // State for Card Parallax & Internal Glow
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
    rotate.y = (e.clientX - rect.left - centerX) / 20
    rotate.x = -(e.clientY - rect.top - centerY) / 20
  }

  const handleCardMouseLeave = () => {
    rotate.x = 0
    rotate.y = 0
  }

  const cardStyle = computed(() => ({
    transform: `rotateY(${rotate.y}deg) rotateX(${rotate.x}deg)`,
  }))

  // Modal Logic
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

  // Edit Modal Logic
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
    // Состояние (если родителю нужно читать)
    isEditModalOpen,
    isModalOpen,
    selectedAnimalId,
    heroRef,
    cardRef,
    cursor,
    satellite1, // ✅ Добавлено
    satellite2, // ✅ Добавлено
    rotate,
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

    // Методы
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
