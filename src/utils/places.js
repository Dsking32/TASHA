// Local date in YYYY-MM-DD. toISOString() uses UTC, which returns
// yesterday between midnight and 1am in Nigeria.
export function localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Cities are named after the city, with the state alongside when it
// differs — e.g. "Maiduguri, Borno" — so people who think in states find it.
export const cityLabel = (loc) =>
  loc.state && loc.state !== loc.name && loc.state !== 'FCT' ? `${loc.name}, ${loc.state}` : loc.name;

export function formatDuration(mins) {
  if (!mins && mins !== 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m ? ` ${m}m` : ''}`;
}

// Seeded landmarks already read "Near Kano Zoo"; avoid "near Near ...".
export const nearText = (l) => (/^nearb/i.test(l) ? l.charAt(0).toLowerCase() + l.slice(1) : `near ${l}`);
