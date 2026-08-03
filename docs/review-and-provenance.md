# Review and provenance workflow

M3Quiz keeps learner-facing content in `questions.csv` and review metadata in `question-metadata.csv`.

## Review statuses

- `needs-review`: a maintainer or contributor found a possible accuracy, consistency, or sourcing problem.
- `in-review`: someone is actively checking the item.
- `verified`: the answer and explanation were checked against a named HTTPS source on the recorded date.
- `rejected`: the record should not be treated as valid and is awaiting removal or replacement.

## Required metadata

Every metadata row references an existing `questionId`. A `verified` row must contain:

- `sourceUrl`
- `sourceTitle`
- `reviewedAt` in `YYYY-MM-DD` format
- a short note explaining what was checked

Other statuses should include enough notes for another contributor to reproduce the concern.

## Contributor process

1. Open a question-correction issue describing the problem.
2. Add or update the corresponding metadata row.
3. Verify the claim using an authoritative or primary source when possible.
4. Correct `questions.csv` in the same PR or a linked follow-up PR.
5. Mark the item `verified` only after a human has reviewed the final answer and explanation.

Run `npm run check` before opening a pull request.

## Current backlog

The initial registry contains several answer/explanation mismatches found during the first dataset audit. Their presence is intentional: the registry makes known quality debt visible instead of silently presenting it as verified content.
