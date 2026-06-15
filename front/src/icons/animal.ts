// front/src/utils/animalIcons.ts (или где у вас этот файл)
export const animalIcons = {
  lion: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="8" stroke-width="1.8"/>
      <circle cx="9" cy="10" r="1"/>
      <circle cx="15" cy="10" r="1"/>
      <path d="M9 15c1 1 5 1 6 0" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `,
  moon: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" stroke-width="2" stroke-linejoin="round"/>
    </svg>
  `,
  elephant: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M7 8h8a4 4 0 0 1 4 4v3 a3 3 0 0 1-3 3h-1v-4h-3v4H8 a3 3 0 0 1-3-3v-2a5 5 0 0 1 2-5z" stroke-width="2" stroke-linejoin="round"/>
    </svg>
  `,
  paw: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <ellipse cx="7" cy="9" rx="2" ry="2.5" stroke-width="1.8"/>
      <ellipse cx="17" cy="9" rx="2" ry="2.5" stroke-width="1.8"/>
      <ellipse cx="5" cy="14" rx="1.8" ry="2.2" stroke-width="1.8"/>
      <ellipse cx="19" cy="14" rx="1.8" ry="2.2" stroke-width="1.8"/>
      <path d="M8 17c1-2 2.5-3 4-3s3 1 4 3c.5 1.5 0 3-1.5 3.5S12 20 12 20s-3 0-4.5-.5S7 18.5 8 17z" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>
  `,
  globe: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="9" stroke-width="1.8"/>
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke-width="1.8"/>
      <path d="M3 12h18" stroke-width="1.8"/>
      <path d="M4 8h16" stroke-width="1.5"/>
      <path d="M4 16h16" stroke-width="1.5"/>
    </svg>
  `
} as const

