/**
 * Returns a human-readable relative time string for an ISO timestamp,
 * e.g. "just now", "3 weeks ago", "8 months ago".
 */
export function timeAgo(isoString) {
    if (!isoString) return null;
    const then = new Date(isoString).getTime();
    if (isNaN(then)) return null;

    const seconds = Math.floor((Date.now() - then) / 1000);
    if (seconds < 60) return 'just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30.44);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

    const years = Math.floor(days / 365.25);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/**
 * Returns true if the ISO timestamp is older than the given number of months.
 */
export function isOlderThanMonths(isoString, months) {
    if (!isoString) return false;
    const then = new Date(isoString).getTime();
    if (isNaN(then)) return false;
    return Date.now() - then > months * 30.44 * 24 * 60 * 60 * 1000;
}
