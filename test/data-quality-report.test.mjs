import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQualityReport } from '../scripts/data-quality-report.mjs';

test('quality report identifies duplicate questions with conflicting answers', () => {
  const result = {
    errors: [],
    warnings: [],
    records: [
      { id: '1', tag: 'フェルミ推定', q: '日本にあるエレベーターの台数を推定してください。', a: '約80万台' },
      { id: '2', tag: 'フェルミ推定', q: '日本にあるエレベーターの台数を推定してください', a: '約90万台' },
    ],
  };

  const report = buildQualityReport(result);
  assert.match(report, /Potential answer-conflict groups: \*\*1\*\*/);
  assert.match(report, /\| 1 \|/);
  assert.match(report, /\| 2 \|/);
});

test('quality report includes category counts', () => {
  const result = {
    errors: [],
    warnings: [],
    records: [
      { id: '1', tag: '論理・確率', q: 'Question one', a: 'A' },
      { id: '2', tag: '論理・確率', q: 'Question two', a: 'B' },
      { id: '3', tag: '思考・発散', q: 'Question three', a: 'C' },
    ],
  };

  const report = buildQualityReport(result);
  assert.match(report, /\| 論理・確率 \| 2 \|/);
  assert.match(report, /\| 思考・発散 \| 1 \|/);
});
