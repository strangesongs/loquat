import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { getTinyScreenGuestAuthState } from '../../client/utils/sidebarState.js';

describe('sidebar tiny-screen auth state', () => {
  test('opens sign in mode with clean auth fields', () => {
    const state = getTinyScreenGuestAuthState('login');

    assert.equal(state.guestAddAttempted, true);
    assert.equal(state.isLoginMode, true);
    assert.equal(state.authError, '');
    assert.equal(state.authUserName, '');
    assert.equal(state.authPassword, '');
    assert.equal(state.authEmail, '');
  });

  test('opens register mode with clean auth fields', () => {
    const state = getTinyScreenGuestAuthState('register');

    assert.equal(state.guestAddAttempted, true);
    assert.equal(state.isLoginMode, false);
    assert.equal(state.authError, '');
    assert.equal(state.authUserName, '');
    assert.equal(state.authPassword, '');
    assert.equal(state.authEmail, '');
  });

  test('defaults to sign in mode for unknown values', () => {
    const state = getTinyScreenGuestAuthState('unexpected');

    assert.equal(state.isLoginMode, true);
  });
});
