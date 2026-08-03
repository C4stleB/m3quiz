import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeQuestion, parseCsv, validateRows } from '../scripts/validate-data.mjs';

test('parses quoted commas and newlines', () => {
  const rows = parseCsv('id,tag,tagClass,q,a,exp\n1,論理,tag-think,"質問,です",答え,"複数行\nの説明"\n');
  assert.equal(rows.length, 2);
  assert.equal(rows[1][3], '質問,です');
  assert.equal(rows[1][5], '複数行\nの説明');
});

test('normalizes punctuation and width variants', () => {
  assert.equal(normalizeQuestion('日本にある「傘」の数？'), normalizeQuestion('日本にある 傘 の数?'));
});

test('accepts a valid record', () => {
  const rows = parseCsv('id,tag,tagClass,q,a,exp\n1,論理,tag-think,これは十分に長い質問ですか,はい,前提と理由を明確に説明する十分な長さの文章です。\n');
  const result = validateRows(rows);
  assert.deepEqual(result.errors, []);
});

test('rejects duplicate ids and unsupported classes', () => {
  const rows = parseCsv('id,tag,tagClass,q,a,exp\n1,論理,bad-class,これは最初の質問です,答え,これは十分に長い説明文として用意されています。\n1,論理,tag-think,これは二番目の質問です,答え,これは十分に長い説明文として用意されています。\n');
  const result = validateRows(rows);
  assert.ok(result.errors.some((error) => error.includes('duplicate id')));
  assert.ok(result.errors.some((error) => error.includes('unsupported tagClass')));
});

test('warns about equivalent duplicate questions', () => {
  const rows = parseCsv('id,tag,tagClass,q,a,exp\n1,論理,tag-think,日本にある傘の数は？,答え,これは十分に長い説明文として用意されています。\n2,論理,tag-think,日本にある「傘」の数は?,答え,これは十分に長い説明文として用意されています。\n');
  const result = validateRows(rows);
  assert.ok(result.warnings.some((warning) => warning.includes('likely duplicate')));
});
