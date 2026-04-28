/**
 * Builds the text content for the "in this view" live ticker.
 *
 * Returns null when there are no visible pins — the caller is responsible
 * for hiding the element entirely in that case.
 *
 * @param {number} pinCount  - total pins visible in the current map viewport
 * @param {string[]} fruitTypes - fruit types present in the current viewport
 * @returns {string|null}
 */
export function buildViewTickerText(pinCount, fruitTypes = []) {
    if (!pinCount || pinCount <= 0) return null;
    const count = `${pinCount} ${pinCount === 1 ? 'find' : 'finds'}`;
    const visible = Array.isArray(fruitTypes) ? fruitTypes.slice(0, 5) : [];
    return visible.length > 0 ? `${count} · ${visible.join(', ')}` : count;
}
