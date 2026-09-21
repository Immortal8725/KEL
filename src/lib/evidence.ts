export function evidenceSvg(title: string, caption: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#0f1c24"/>
        <stop offset="1" stop-color="#1c3a32"/>
      </linearGradient>
    </defs>
    <rect width="640" height="420" fill="url(#g)"/>
    <rect x="40" y="48" width="560" height="250" rx="12" fill="#0b1210" stroke="#3dd68c" stroke-width="2"/>
    <path d="M80 250 L180 160 L250 210 L340 120 L400 190 L560 90" fill="none" stroke="#f5c542" stroke-width="4"/>
    <circle cx="180" cy="160" r="7" fill="#e24b4b"/>
    <circle cx="340" cy="120" r="7" fill="#e24b4b"/>
    <text x="56" y="330" fill="#9ad7b8" font-family="ui-monospace,monospace" font-size="14">FIELD EVIDENCE · CITY OF TSHWANE RP</text>
    <text x="56" y="358" fill="#f4f1e8" font-family="ui-sans-serif,system-ui" font-size="22" font-weight="700">${escapeXml(title)}</text>
    <text x="56" y="386" fill="#c5d0c8" font-family="ui-sans-serif,system-ui" font-size="14">${escapeXml(caption)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
