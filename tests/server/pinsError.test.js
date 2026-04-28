import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PinsQueryError } from '../../server/schemas/errors.js';

describe('PinsQueryError', () => {
  test('is an Error and carries a cause for logging', () => {
    const inner = new Error('dynamo');
    const e = new PinsQueryError('failed', inner);
    assert.ok(e instanceof Error);
    assert.equal(e.name, 'PinsQueryError');
    assert.equal(e.cause, inner);
  });
});
