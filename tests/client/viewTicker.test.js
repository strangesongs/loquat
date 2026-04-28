import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { buildViewTickerText } from '../../client/utils/viewTicker.js';

describe('buildViewTickerText', () => {

    // ── hidden / null cases ──────────────────────────────────────────────────

    test('returns null when pinCount is 0', () => {
        assert.equal(buildViewTickerText(0), null);
    });

    test('returns null when pinCount is null', () => {
        assert.equal(buildViewTickerText(null), null);
    });

    test('returns null when pinCount is undefined', () => {
        assert.equal(buildViewTickerText(undefined), null);
    });

    test('returns null for negative pinCount', () => {
        assert.equal(buildViewTickerText(-1), null);
    });

    // ── singular / plural ────────────────────────────────────────────────────

    test('uses "find" (singular) for a pinCount of 1', () => {
        const text = buildViewTickerText(1, []);
        assert.equal(text, '1 find');
    });

    test('uses "finds" (plural) for a pinCount of 2', () => {
        const text = buildViewTickerText(2, []);
        assert.equal(text, '2 finds');
    });

    test('uses "finds" (plural) for larger counts', () => {
        const text = buildViewTickerText(99, []);
        assert.equal(text, '99 finds');
    });

    // ── fruit type formatting ────────────────────────────────────────────────

    test('returns count only when fruitTypes is empty', () => {
        assert.equal(buildViewTickerText(4, []), '4 finds');
    });

    test('returns count only when fruitTypes is omitted', () => {
        assert.equal(buildViewTickerText(4), '4 finds');
    });

    test('appends fruit types joined by ", "', () => {
        const text = buildViewTickerText(3, ['loquat', 'fig', 'lemon']);
        assert.equal(text, '3 finds · loquat, fig, lemon');
    });

    test('preserves the order of fruitTypes as given', () => {
        const text = buildViewTickerText(2, ['mango', 'avocado']);
        assert.equal(text, '2 finds · mango, avocado');
    });

    test('appends a single fruit type without a trailing separator', () => {
        const text = buildViewTickerText(7, ['orange']);
        assert.equal(text, '7 finds · orange');
    });

    // ── five-fruit cap ───────────────────────────────────────────────────────

    test('includes exactly 5 fruit types when 5 are provided', () => {
        const text = buildViewTickerText(5, ['apple', 'pear', 'plum', 'fig', 'lemon']);
        assert.equal(text, '5 finds · apple, pear, plum, fig, lemon');
    });

    test('caps the fruit list at 5 when more are provided', () => {
        const text = buildViewTickerText(8, ['apple', 'pear', 'plum', 'fig', 'lemon', 'mango', 'guava']);
        assert.equal(text, '8 finds · apple, pear, plum, fig, lemon');
    });

    test('does not mutate the original fruitTypes array', () => {
        const types = ['apple', 'pear', 'plum', 'fig', 'lemon', 'mango'];
        buildViewTickerText(6, types);
        assert.equal(types.length, 6);
    });

    // ── graceful handling of bad input ───────────────────────────────────────

    test('treats a non-array fruitTypes as an empty list', () => {
        assert.equal(buildViewTickerText(3, 'loquat'), '3 finds');
        assert.equal(buildViewTickerText(3, null), '3 finds');
    });
});
