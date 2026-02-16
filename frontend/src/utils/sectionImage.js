export function getSectionImage(text, width = 1200, height = 600) {
  const encoded = encodeURIComponent(text);
  return `https://placehold.co/${width}x${height}/2F253A/FFFFFF?text=${encoded}`;
}
