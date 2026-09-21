/** Full document navigation — avoids Next.js RSC fetches that download as files in the preview. */
export function go(href: string) {
  window.location.assign(href);
}

export function goReplace(href: string) {
  window.location.replace(href);
}
