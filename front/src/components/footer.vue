<template>
  <footer class="bg-forest-900 text-cream-100 border-t border-white/5">
    <div class="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">
      <!-- Logo & Description -->
      <div class="flex flex-col items-start">
        <a href="/" class="text-cream-100 group text-3xl font-black tracking-tight">
          Zoo<span class="text-lime group-hover:text-lime/80 transition-colors">Verse</span>
        </a>
        <p class="text-cream-100/60 mt-4 max-w-xs text-sm leading-relaxed">
          Живое путешествие по пяти континентам без перелётов. Мы создаем пространство, где природа
          говорит с человеком.
        </p>

        <!-- Mini Newsletter in Footer -->
        <div class="mt-6 w-full max-w-xs">
          <label class="text-lime mb-2 block text-xs font-bold tracking-wider uppercase"
            >Подпишись на новости</label
          >
          <div class="flex gap-2">
            <input
              type="email"
              placeholder="Твой email"
              class="focus:border-lime w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm transition-colors focus:outline-none"
            />
            <button
              class="bg-lime text-forest-900 hover:bg-lime/90 rounded-lg px-3 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <!-- Dynamic Blocks -->
      <div v-for="(block, index) in blocks" :key="index">
        <template v-if="block.links">
          <h3 class="text-lime mb-5 text-sm font-bold tracking-wider uppercase">
            {{ block.nameblock }}
          </h3>
          <ul class="space-y-3">
            <li v-for="link in block.links" :key="link.path">
              <a
                :href="link.path"
                class="text-cream-100/60 hover:text-lime inline-block text-sm transition hover:pl-1"
              >
                {{ link.name }}
              </a>
            </li>
          </ul>
        </template>

        <template v-else-if="block.socials">
          <h3 class="text-lime mb-5 text-sm font-bold tracking-wider uppercase">
            {{ block.nameblock }}
          </h3>
          <div class="flex gap-3">
            <a
              v-for="social in block.socials"
              :key="social.url"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:bg-lime hover:text-forest-900 hover:border-lime flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:-translate-y-1"
              aria-label="Social Link"
            >
              <!-- Заглушка для иконки, замени на AppIcon -->
              <span class="text-lg">{{ social.icon }}</span>
            </a>
          </div>

          <div class="mt-6">
            <p class="text-cream-100/40 mb-2 text-xs">Мы работаем ежедневно:</p>
            <p class="text-cream-100/80 text-sm font-medium">09:00 – 21:00</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bg-forest-950/30 border-t border-white/5 px-6 py-6">
      <div
        class="text-cream-100/40 mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs md:flex-row"
      >
        <p>© {{ new Date().getFullYear() }} ZooVerse Park. Все права защищены.</p>
        <div class="flex gap-6">
          <a href="#" class="hover:text-lime transition-colors">Политика конфиденциальности</a>
          <a href="#" class="hover:text-lime transition-colors">Правила посещения</a>
          <a href="#" class="hover:text-lime transition-colors">Карта сайта</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
interface BlockLink {
  nameblock: string
  links?: { name: string; path: string }[]
  socials?: { url: string; icon: string }[]
}

const props = withDefaults(
  defineProps<{
    blocks?: BlockLink[]
  }>(),
  {
    blocks: () => [
      {
        nameblock: 'Парк',
        links: [
          { name: 'Животные', path: '#animals' },
          { name: 'Зоны обитания', path: '#zones' },
          { name: 'Расписание шоу', path: '#schedule' },
          { name: 'Экскурсии', path: '#tours' },
        ],
      },
      {
        nameblock: 'Посетителям',
        links: [
          { name: 'Купить билет', path: '#visit' },
          { name: 'Как добраться', path: '#map' },
          { name: 'Частые вопросы', path: '#faq' },
          { name: 'Вакансии', path: '/careers' },
        ],
      },
      {
        nameblock: 'Контакты',
        socials: [
          { url: 'https://vk.com', icon: 'VK' }, // Замени на SVG компонент
          { url: 'https://t.me', icon: 'TG' },
          { url: 'https://youtube.com', icon: 'YT' },
        ],
      },
    ],
  }
)
</script>
