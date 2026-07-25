import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getVisualStandardsProfile,
  listVisualStandardsProfiles,
} from '../src/standards/profiles.js';

test('crop-specific trusted visual profiles are selected', () => {
  assert.equal(getVisualStandardsProfile('maize').id, 'maize-visual');
  assert.equal(getVisualStandardsProfile('unlisted crop').id, 'generic-produce-visual');
  assert.ok(listVisualStandardsProfiles().length >= 4);
});

test('a crop cannot use an unrelated profile', () => {
  assert.throws(() => getVisualStandardsProfile('tomatoes', 'maize-visual'), /does not apply/);
});
