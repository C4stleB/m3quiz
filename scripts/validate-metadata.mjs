import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseCsv, validateFile } from './validate-data.mjs';

export const METADATA_HEADERS = ['questionId', 'reviewStatus', 'sourceUrl', 'sourceTitle', 'reviewedAt', 'notes'];
export const REVIEW_STATUSES = new Set(['needs-review', 'in-review', 'verified', 'rejected']);

export function validateMetadataRows(rows, questionIds) {
  const errors = [];
  const warnings = [];
  if (rows.length === 0) return { errors: ['Metadata CSV is empty.'], warnings, records: [] };

  const headers = rows[0].map((value) => value.trim());
  for (const header of METADATA_HEADERS) {
    if (!headers.includes(header)) errors.push(`Missing metadata header: ${header}`);
  }

  const seen = new Set();
  const records = rows.slice(1).map((values, index) => {
    const record = Object.fromEntries(headers.map((header, column) => [header, values[column] ?? '']));
    record.__line = index + 2;
    return record;
  });

  for (const record of records) {
    const id = record.questionId.trim();
    if (!/^\d+$/.test(id)) errors.push(`Line ${record.__line}: questionId must be a positive integer.`);
    else if (!questionIds.has(id)) errors.push(`Line ${record.__line}: questionId ${id} does not exist in questions.csv.`);
    if (seen.has(id)) errors.push(`Line ${record.__line}: duplicate metadata for questionId ${id}.`);
    seen.add(id);

    if (!REVIEW_STATUSES.has(record.reviewStatus)) {
      errors.push(`Line ${record.__line}: unsupported reviewStatus ${record.reviewStatus}.`);
    }

    if (record.sourceUrl && !/^https:\/\//.test(record.sourceUrl)) {
      errors.push(`Line ${record.__line}: sourceUrl must use https.`);
    }
    if (record.reviewStatus === 'verified') {
      if (!record.sourceUrl || !record.sourceTitle || !/^\d{4}-\d{2}-\d{2}$/.test(record.reviewedAt)) {
        errors.push(`Line ${record.__line}: verified records require sourceUrl, sourceTitle, and reviewedAt (YYYY-MM-DD).`);
      }
    } else if (!record.notes.trim()) {
      warnings.push(`Line ${record.__line}: unverified record has no review notes.`);
    }
  }

  return { errors, warnings, records };
}

export async function validateMetadataFiles(questionPath, metadataPath) {
  const questions = await validateFile(questionPath);
  const metadataText = await readFile(metadataPath, 'utf8');
  const questionIds = new Set(questions.records.map((record) => record.id));
  return validateMetadataRows(parseCsv(metadataText), questionIds);
}

async function main() {
  const result = await validateMetadataFiles(
    new URL('../questions.csv', import.meta.url),
    new URL('../question-metadata.csv', import.meta.url),
  );
  console.log(`Validated ${result.records.length} metadata record(s).`);
  for (const warning of result.warnings) console.warn(`WARNING: ${warning}`);
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  if (result.errors.length > 0) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`))) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
