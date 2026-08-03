# Question data schema

M3Quiz stores its public question bank in `questions.csv`. The web application reads this file directly, so schema changes must remain backward-compatible or include a matching application migration.

## Current required columns

| Column | Type | Description |
| --- | --- | --- |
| `id` | positive integer | Stable question identifier. Never reuse a removed ID. |
| `tag` | string | Human-readable Japanese category label. |
| `tagClass` | enum | Presentation class: `tag-prob`, `tag-math`, `tag-open`, `tag-biz`, or `tag-think`. |
| `q` | string | Question shown to the learner. |
| `a` | string | Expected answer or explicit note that the question is open-ended. |
| `exp` | string | Explanation, reasoning process, or evaluation guidance. |

## Planned provenance columns

The following optional columns are reserved for the next data migration. Contributors should already include equivalent information in pull-request descriptions when proposing factual content.

| Column | Type | Intended use |
| --- | --- | --- |
| `sourceUrl` | URL | Primary or authoritative source for factual claims. |
| `sourceTitle` | string | Human-readable source name. |
| `reviewStatus` | enum | `unreviewed`, `reviewed`, or `needs-update`. |
| `reviewedAt` | ISO date | Date of the latest human factual review. |
| `notes` | string | Maintainer notes that should not be shown as the answer. |

These columns are not yet required because the legacy dataset must be migrated incrementally. A future release will add them to the CSV and application.

## Content rules

- IDs must be unique positive integers.
- Questions must be understandable without hidden context.
- Closed questions need one defensible answer.
- Open-ended questions must state that evaluation depends on reasoning, coverage, or assumptions.
- Numerical claims must distinguish estimates from sourced facts.
- Fermi-estimation answers must show assumptions and arithmetic rather than presenting an estimate as a verified statistic.
- Duplicate questions with conflicting answers must be consolidated before new variants are accepted.
- Generated text requires human review before merge.

## Compatibility policy

Adding optional columns is backward-compatible. Renaming or deleting existing required columns is a breaking change and requires a versioned migration, updated tests, and release notes.
