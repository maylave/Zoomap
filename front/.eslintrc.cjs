module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended', // Правила для Vue 3
    'plugin:@typescript-eslint/recommended', // Правила для TS
    'plugin:tailwindcss/recommended', // Правила для Tailwind
    'prettier', // Отключаем правила форматирования ESLint, чтобы они не конфликтовали с Prettier (должен быть последним!)
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'tailwindcss'],
  rules: {
    // --- Настройки Vue ---
    'vue/multi-word-component-names': 'off', // Разрешает имена компонентов из одного слова (например, Button.vue)
    'vue/html-self-closing': [
      'error',
      { html: { void: 'always', normal: 'always', component: 'always' } },
    ],

    // --- Настройки TypeScript ---
    '@typescript-eslint/no-explicit-any': 'warn', // Предупреждать об использовании any, но не ломать сборку
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Игнорировать неиспользуемые переменные, если они начинаются с _

    // --- Настройки Tailwind ---
    'tailwindcss/no-custom-classname': 'off', // Отключает ошибку на кастомные/динамические классы (очень полезно для Vue)
    'tailwindcss/classnames-order': 'warn', // Предупреждать о неправильном порядке классов (Prettier это исправит)
  },
  settings: {
    tailwindcss: {
      // Если вы используете библиотеки для генерации классов (clsx, cva и т.д.), добавьте их сюда
      callees: ['classnames', 'clsx', 'ctl', 'cva', 'tv'],
    },
  },
}
