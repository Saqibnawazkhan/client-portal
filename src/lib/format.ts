/** Two-letter initials from a company or person name, e.g. "Lumen Skincare" → "LS". */
export function initials(name: string): string {
  return (name || '?')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
