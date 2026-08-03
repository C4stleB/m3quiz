import test from 'node:test';
import assert from 'node:assert/strict';

import { removeKnownDuplicates, splitCsvRecords } from '../scripts/remove-known-duplicates.mjs';

test('splitCsvRecords preserves quoted newlines', () => {
  const csv = 'id,q,a\n1,"line one\nline two",answer\n2,plain,answer\n';
  const records = splitCsvRecords(csv);
  assert.equal(records.length, 3);
  assert.match(records[1], /line one\nline two/);
});

test('removeKnownDuplicates removes only requested IDs', () => {
  const csv = 'id,q,a\n1,keep,one\n2,remove,two\n3,keep,three\n';
  const result = removeKnownDuplicates(csv, new Set(['2']));

  assert.deepEqual(result.removed, ['2']);
  assert.match(result.text, /^id,q,a\n1,keep,one\n3,keep,three\n$/);
});

test('removeKnownDuplicates fails when an expected ID is absent', () => {
  const csv = 'id,q,a\n1,keep,one\n';
  assert.throws(
    () => removeKnownDuplicates(csv, new Set(['9'])),
    /Expected duplicate IDs were not found: 9/,
  );
});
