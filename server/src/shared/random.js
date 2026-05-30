export function randomItem(items) {
  if (!items.length) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}
