import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const DUPLICATE_IDS = new Set(['449', '450', '454', '459', '460', '462', '463', '467', '472']);

export function splitCsvRecords(text) {
  const records = [];
  let start = 0;
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') i += 1;
      else quoted = !quoted;
    } else if (char === '\n' && !quoted) {
      records.push(text.slice(start, i).replace(/\r$/, ''));
      start = i + 1;
    }
  }

  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  if (start < text.length) records.push(text.slice(start).replace(/\r$/, ''));
  return records.filter((record) => record !== '');
}

function firstCsvField(record) {
  if (record.startsWith('"')) {
    let value = '';
    for (let i = 1; i < record.length; i += 1) {
      if (record[i] === '"' && record[i + 1] === '"') {
        value += '"';
        i += 1;
      } else if (record[i] === '"') return value;
      else value += record[i];
    }
    throw new Error('Unclosed quoted first field.');
  }
  const comma = record.indexOf(',');
  return comma === -1 ? record : record.slice(0, comma);
}

export function removeKnownDuplicates(text, ids = DUPLICATE_IDS) {
  const records = splitCsvRecords(text);
  if (records.length === 0) throw new Error('CSV is empty.');

  const [header, ...data] = records;
  const removed = [];
  const kept = data.filter((record) => {
    const id = firstCsvField(record).trim();
    if (ids.has(id)) {
      removed.push(id);
      return false;
    }
    return true;
  });

  const missing = [...ids].filter((id) => !removed.includes(id));
  if (missing.length > 0) throw new Error(`Expected duplicate IDs were not found: ${missing.join(', ')}`);

  return {
    text: `${[header, ...kept].join('\n')}\n`,
    removed: removed.sort((a, b) => Number(a) - Number(b)),
  };
}

async function main() {
  const path = new URL('../questions.csv', import.meta.url);
  const source = await readFile(path, 'utf8');
  const result = removeKnownDuplicates(source);
  await writeFile(path, result.text, 'utf8');
  console.log(`Removed ${result.removed.length} duplicate records: ${result.removed.join(', ')}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`))) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
