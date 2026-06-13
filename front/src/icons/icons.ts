export const arrowIcons = {
  arrowRight: `
    <line x1="0.707" y1="0.5" x2="26.773" y2="26.566" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    <line x1="0.5" y1="-0.5" x2="37.363" y2="-0.5" transform="matrix(0.707 -0.707 -0.707 -0.707 0 53.273)" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  `,
  arrowLeft: `
    <line x1="0.5" y1="-0.5" x2="37.363" y2="-0.5" transform="matrix(-0.707 0.707 0.707 0.707 27.273 0.5)" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    <line x1="26.566" y1="53.273" x2="0.500" y2="27.207" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  `,
  arrowDown: `
    <line x1="53.273" y1="0.707" x2="27.207" y2="26.773" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    <line x1="0.5" y1="-0.5" x2="37.363" y2="-0.5" transform="matrix(0.707 0.707 0.707 -0.707 0.5 0)" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  `,
  arrowUP: `
    <line x1="0.5" y1="26.566" x2="26.566" y2="0.5" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    <line x1="0.5" y1="-0.5" x2="37.363" y2="-0.5" transform="matrix(-0.707 -0.707 -0.707 0.707 53.273 27.273)" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  `
} as const