# Contributing to M3Quiz

Thank you for helping improve M3Quiz. Contributions to code, documentation, accessibility, tests, and the question dataset are welcome.

## Before you start

1. Search existing issues and pull requests.
2. Open an issue before making a large architectural or dataset-wide change.
3. Do not copy questions from proprietary tests, books, websites, or interview materials unless their license clearly permits redistribution.
4. Do not include personal data, secrets, or confidential employer information.

## Development setup

```bash
npm install
npm run validate
npm test
npm run dev
```

Node.js 20 or later is required.

## Adding or editing questions

Each CSV row must include:

- a unique positive integer `id`
- a supported `tagClass`
- a clear Japanese question
- an answer suitable for the question type
- an explanation showing the reasoning

For factual claims, include the source name, URL, and access date in the explanation when practical. Prefer primary sources such as government statistics, standards bodies, and original research.

For Fermi estimates:

- label assumptions explicitly
- show the arithmetic
- avoid presenting an estimate as an official statistic
- use internally consistent units
- explain the plausible range when one exact value would be misleading

## Validation

Run:

```bash
npm run validate
npm test
```

The validator reports errors and warnings. Errors must be fixed. New warnings should be fixed or justified in the pull request description.

## Pull requests

Keep pull requests focused. Include:

- what changed
- why it changed
- how it was validated
- sources for factual content changes
- screenshots for visible UI changes

By submitting a contribution, you agree that your contribution may be distributed under the repository's MIT License.

## Review policy

Maintainers may request revisions for unsupported facts, unclear provenance, duplicated questions, inconsistent estimates, inaccessible UI, or changes that make the dataset harder to reuse.

All AI-assisted contributions require human review. Contributors remain responsible for accuracy, licensing, and safety.