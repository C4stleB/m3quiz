import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMetadataRows } from '../scripts/validate-metadata.mjs';

const headers = ['questionId', 'reviewStatus', 'sourceUrl', 'sourceTitle', 'reviewedAt', 'notes'];

test('accepts a complete verified metadata record', () => {
  const result = validateMetadataRows([
    headers,
    ['18', 'verified', 'https://example.com/source', 'Reference', '2026-08-03', 'Checked manually'],
  ], new Set(['18']));
  assert.deepEqual(result.errors, []);
});

test('rejects unknown question ids and incomplete verification', () => {
  const result = validateMetadataRows([
    headers,
    ['999', 'verified', '', '', '', ''],
  ], new Set(['18']));
  assert.equal(result.errors.some((message) => message.includes('does not exist')), true);
  assert.equal(result.errors.some((message) => message.includes('verified records require')), true);
});

test('allows review backlog records with notes', () => {
  const result = validateMetadataRows([
    headers,
    ['18', 'needs-review', '', '', '', 'Answer conflicts with explanation.'],
  ], new Set(['18']));
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
});
