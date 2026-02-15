/**
 * Returns a placeholder image URL from placehold.co for section images.
 * Dark gray background (#2F253A), white text.
 * @param {string} text - Label for the placeholder (e.g. "HERO BANNER", "ABOUT US")
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @returns {string} URL for the placeholder image
 */
export function getSectionImage(text, width = 1200, height = 600) {
  const encoded = encodeURIComponent(text);
  return `https://placehold.co/${width}x${height}/2F253A/FFFFFF?text=${encoded}`;
}
