<template>
  <footer class="bg-forest-900 text-cream-100 border-t border-white/5">
    <div class="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">
      
      <!-- Logo & Description -->
      <div class="flex flex-col items-start">
        <a href="/" class="text-3xl font-black tracking-tight text-cream-100 group">
          Zoo<span class="text-lime group-hover:text-lime/80 transition-colors">Verse</span>
        </a>
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-cream-100/60">
          Живое путешествие по пяти континентам без перелётов. 
          Мы создаем пространство, где природа говорит с человеком.
        </p>
        
        <!-- Mini Newsletter in Footer -->
        <div class="mt-6 w-full max-w-xs">
          <label class="text-xs font-bold uppercase tracking-wider text-lime mb-2 block">Подпишись на новости</label>
          <div class="flex gap-2">
            <input 
              type="email" 
              placeholder="Твой email" 
              class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime transition-colors"
            />
            <button class="bg-lime text-forest-900 rounded-lg px-3 hover:bg-lime/90 transition-colors">
              →
            </button>
          </div>
        </div>
      </div>

      <!-- Dynamic Blocks -->
      <div v-for="(block, index) in blocks" :key="index">
        <template v-if="block.links">
          <h3 class="mb-5 text-sm font-bold uppercase tracking-wider text-lime">
            {{ block.nameblock }}
          </h3>
          <ul class="space-y-3">
            <li v-for="link in block.links" :key="link.path">
              <a
                :href="link.path"
                class="text-sm text-cream-100/60 transition hover:text-lime hover:pl-1 inline-block"
              >
                {{ link.name }}
              </a>
            </li>
          </ul>
        </template>

        <template v-else-if="block.socials">
          <h3 class="mb-5 text-sm font-bold uppercase tracking-wider text-lime">
            {{ block.nameblock }}
          </h3>
          <div class="flex gap-3">
            <a
              v-for="social in block.socials"
              :key="social.url"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 transition-all hover:bg-lime hover:text-forest-900 hover:border-lime hover:-translate-y-1"
              aria-label="Social Link"
            >
              <!-- Заглушка для иконки, замени на AppIcon -->
              <span class="text-lg">{{ social.icon }}</span>
            </a>
          </div>
          
          <div class="mt-6">
             <p class="text-xs text-cream-100/40 mb-2">Мы работаем ежедневно:</p>
             <p class="text-sm font-medium text-cream-100/80">09:00 – 21:00</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-white/5 px-6 py-6 bg-forest-950/30">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-cream-100/40 md:flex-row">
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

const props = withDefaults(defineProps<{
  blocks?: BlockLink[]
}>(), {
  blocks: () => [
    {
      nameblock: 'Парк',
      links: [
        { name: 'Животные', path: '#animals' },
        { name: 'Зоны обитания', path: '#zones' },
        { name: 'Расписание шоу', path: '#schedule' },
        { name: 'Экскурсии', path: '#tours' }
      ]
    },
    {
      nameblock: 'Посетителям',
      links: [
        { name: 'Купить билет', path: '#visit' },
        { name: 'Как добраться', path: '#map' },
        { name: 'Частые вопросы', path: '#faq' },
        { name: 'Вакансии', path: '/careers' }
      ]
    },
    {
      nameblock: 'Контакты',
      socials: [
        { url: 'https://vk.com', icon: 'VK' }, // Замени на SVG компонент
        { url: 'https://t.me', icon: 'TG' },
        { url: 'https://youtube.com', icon: 'YT' }
      ]
    }
  ]
})
</script>