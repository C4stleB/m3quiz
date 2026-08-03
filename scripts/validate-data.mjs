import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const REQUIRED_HEADERS = ['id', 'tag', 'tagClass', 'q', 'a', 'exp'];
export const SUPPORTED_TAG_CLASSES = new Set(['tag-prob', 'tag-math', 'tag-open', 'tag-biz', 'tag-think']);

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  row.push(field.replace(/\r$/, ''));
  if (row.some((value) => value !== '')) rows.push(row);
  return rows;
}

export function normalizeQuestion(value) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s、。！？!?「」『』（）()・:：;；,，.]/g, '');
}

export function validateRows(rows) {
  const errors = [];
  const warnings = [];
  if (rows.length === 0) return { errors: ['CSV is empty.'], warnings, records: [] };

  const headers = rows[0].map((value) => value.trim());
  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) errors.push(`Missing required header: ${required}`);
  }

  const records = rows.slice(1).map((values, index) => {
    const record = Object.fromEntries(headers.map((header, column) => [header, values[column] ?? '']));
    record.__line = index + 2;
    return record;
  });

  const ids = new Map();
  const exactQuestions = new Map();
  const normalizedQuestions = new Map();

  for (const record of records) {
    const line = record.__line;
    for (const header of REQUIRED_HEADERS) {
      if (!String(record[header] ?? '').trim()) errors.push(`Line ${line}: ${header} is empty.`);
    }

    if (!/^\d+$/.test(record.id) || Number(record.id) < 1) {
      errors.push(`Line ${line}: id must be a positive integer.`);
    } else if (ids.has(record.id)) {
      errors.push(`Line ${line}: duplicate id ${record.id} (first seen on line ${ids.get(record.id)}).`);
    } else {
      ids.set(record.id, line);
    }

    if (record.tagClass && !SUPPORTED_TAG_CLASSES.has(record.tagClass)) {
      errors.push(`Line ${line}: unsupported tagClass ${record.tagClass}.`);
    }

    const question = record.q.trim();
    if (question) {
      if (exactQuestions.has(question)) {
        warnings.push(`Line ${line}: exact duplicate question (line ${exactQuestions.get(question)}).`);
      } else exactQuestions.set(question, line);

      const normalized = normalizeQuestion(question);
      if (normalizedQuestions.has(normalized)) {
        warnings.push(`Line ${line}: likely duplicate question (line ${normalizedQuestions.get(normalized)}).`);
      } else normalizedQuestions.set(normalized, line);
    }

    for (const header of REQUIRED_HEADERS) {
      if (String(record[header] ?? '').includes('�')) errors.push(`Line ${line}: ${header} contains a replacement character.`);
    }

    if (record.q && record.q.trim().length < 8) warnings.push(`Line ${line}: question is unusually short.`);
    if (record.exp && record.exp.trim().length < 20) warnings.push(`Line ${line}: explanation is unusually short.`);
  }

  return { errors, warnings, records };
}

export async function validateFile(path) {
  const text = await readFile(path, 'utf8');
  return validateRows(parseCsv(text));
}

async function main() {
  const result = await validateFile(new URL('../questions.csv', import.meta.url));
  console.log(`Validated ${result.records.length} questions.`);
  for (const warning of result.warnings) console.warn(`WARNING: ${warning}`);
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  console.log(`${result.errors.length} error(s), ${result.warnings.length} warning(s).`);
  if (result.errors.length > 0) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`))) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
