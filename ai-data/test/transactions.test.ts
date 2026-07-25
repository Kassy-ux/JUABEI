import assert from 'node:assert/strict';
import test from 'node:test';

import { isAllowedTransactionTransition } from '../src/db/repositories/transactions.js';

test('transaction verification follows the documented lifecycle', () => {
  assert.equal(isAllowedTransactionTransition('reported', 'pending_verification'), true);
  assert.equal(isAllowedTransactionTransition('pending_verification', 'verified'), true);
  assert.equal(isAllowedTransactionTransition('pending_verification', 'rejected'), true);
  assert.equal(isAllowedTransactionTransition('reported', 'verified'), false);
  assert.equal(isAllowedTransactionTransition('verified', 'rejected'), false);
});
