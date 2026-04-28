import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  confirmDedupKey,
  isDuplicateConfirm,
  markConfirmed,
} from '../../server/utils/confirmDedup.js';

// ── confirmDedupKey ────────────────────────────────────────────────────────────

describe('confirmDedupKey', () => {
  test('builds the expected Redis key', () => {
    assert.equal(confirmDedupKey('pin-123', '1.2.3.4'), 'confirm:pin-123:1.2.3.4');
  });

  test('includes both pinId and ip so different pins get different keys', () => {
    const a = confirmDedupKey('pin-aaa', '1.2.3.4');
    const b = confirmDedupKey('pin-bbb', '1.2.3.4');
    assert.notEqual(a, b);
  });

  test('includes both pinId and ip so different IPs get different keys', () => {
    const a = confirmDedupKey('pin-aaa', '1.1.1.1');
    const b = confirmDedupKey('pin-aaa', '2.2.2.2');
    assert.notEqual(a, b);
  });
});

// ── isDuplicateConfirm ─────────────────────────────────────────────────────────

describe('isDuplicateConfirm', () => {
  test('returns false when redisClient is null (no Redis)', async () => {
    assert.equal(await isDuplicateConfirm(null, 'pin-1', '1.2.3.4'), false);
  });

  test('returns false when key does not exist in Redis', async () => {
    const mockRedis = { get: async () => null };
    assert.equal(await isDuplicateConfirm(mockRedis, 'pin-1', '1.2.3.4'), false);
  });

  test('returns true when key exists in Redis', async () => {
    const mockRedis = { get: async () => '1' };
    assert.equal(await isDuplicateConfirm(mockRedis, 'pin-1', '1.2.3.4'), true);
  });

  test('fails open (returns false) when Redis throws', async () => {
    const mockRedis = { get: async () => { throw new Error('connection refused'); } };
    assert.equal(await isDuplicateConfirm(mockRedis, 'pin-1', '1.2.3.4'), false);
  });
});

// ── markConfirmed ──────────────────────────────────────────────────────────────

describe('markConfirmed', () => {
  test('does nothing when redisClient is null', async () => {
    await assert.doesNotReject(() => markConfirmed(null, 'pin-1', '1.2.3.4'));
  });

  test('calls redis.set with the correct key and a 24-hour TTL', async () => {
    const calls = [];
    const mockRedis = {
      set: async (key, value, opts) => { calls.push({ key, value, opts }); },
    };
    await markConfirmed(mockRedis, 'pin-abc', '9.9.9.9');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].key, 'confirm:pin-abc:9.9.9.9');
    assert.equal(calls[0].value, '1');
    assert.equal(calls[0].opts.EX, 86400);
  });

  test('does not throw when Redis errors on set', async () => {
    const mockRedis = { set: async () => { throw new Error('timeout'); } };
    await assert.doesNotReject(() => markConfirmed(mockRedis, 'pin-1', '1.2.3.4'));
  });
});

// ── round-trip: mark then check ───────────────────────────────────────────────

describe('dedup round-trip', () => {
  test('isDuplicateConfirm is false before marking and true after', async () => {
    const store = new Map();
    const mockRedis = {
      get: async (key) => store.get(key) ?? null,
      set: async (key, value) => { store.set(key, value); },
    };

    assert.equal(await isDuplicateConfirm(mockRedis, 'pin-xyz', '5.5.5.5'), false);
    await markConfirmed(mockRedis, 'pin-xyz', '5.5.5.5');
    assert.equal(await isDuplicateConfirm(mockRedis, 'pin-xyz', '5.5.5.5'), true);
  });

  test('marking one pin does not affect a different pin from the same IP', async () => {
    const store = new Map();
    const mockRedis = {
      get: async (key) => store.get(key) ?? null,
      set: async (key, value) => { store.set(key, value); },
    };

    await markConfirmed(mockRedis, 'pin-A', '5.5.5.5');
    assert.equal(await isDuplicateConfirm(mockRedis, 'pin-B', '5.5.5.5'), false);
  });

  test('marking one IP does not affect a different IP on the same pin', async () => {
    const store = new Map();
    const mockRedis = {
      get: async (key) => store.get(key) ?? null,
      set: async (key, value) => { store.set(key, value); },
    };

    await markConfirmed(mockRedis, 'pin-A', '1.1.1.1');
    assert.equal(await isDuplicateConfirm(mockRedis, 'pin-A', '2.2.2.2'), false);
  });
});
