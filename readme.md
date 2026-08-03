# M3Quiz

M3Quiz is an open-source Japanese question bank and lightweight web app for practicing logical reasoning, probability, quantitative thinking, business reasoning, and Fermi estimation.

The project is intentionally simple to run: the application is a static HTML page, while the question bank is maintained as CSV. This makes it easy for learners, educators, and contributors to review questions and propose corrections without operating a backend service.

> **Project status:** early-stage community project. The current dataset is being audited for duplicate questions, unsupported claims, inconsistent estimates, and unclear explanations. Treat numerical answers as learning examples rather than authoritative facts.

## Features

- More than 450 Japanese practice questions and explanations
- Categories including logic, probability, mathematics, business thinking, and Fermi estimation
- Randomized practice without immediate repetition
- Answer and explanation reveal
- Previous-question navigation and session progress
- Responsive layout and automatic dark mode
- Automated CSV structure and quality validation

## Try it locally

Requirements: Node.js 20 or later.

```bash
git clone https://github.com/C4stleB/m3quiz.git
cd m3quiz
npm install
npm run validate
npm run dev
```

Then open `http://localhost:8080`.

The application can also be served by any static file server. Opening `index.html` directly may prevent `questions.csv` from loading because of browser security restrictions.

## Project structure

```text
.
├── index.html                  # Static quiz application
├── questions.csv              # Question bank
├── scripts/validate-data.mjs  # Dataset validator
├── test/validator.test.mjs     # Validator tests
└── .github/workflows/ci.yml    # Continuous integration
```

## Question format

`questions.csv` uses the following columns:

| Column | Description |
| --- | --- |
| `id` | Unique positive integer |
| `tag` | Human-readable category |
| `tagClass` | Supported visual category class |
| `q` | Question text |
| `a` | Expected answer or representative estimate |
| `exp` | Explanation and reasoning |

For factual or time-sensitive questions, contributors should include a reliable source and access date in the explanation. For Fermi-estimation questions, clearly distinguish assumptions from observed facts.

## Data quality policy

Every contribution must pass `npm run validate`. The validator checks:

- required headers and non-empty fields
- unique, positive integer IDs
- supported category classes
- exact duplicate questions
- likely duplicate questions after normalization
- suspicious replacement characters and malformed text
- answer and explanation length expectations

Some legacy data currently produces warnings. New pull requests should not increase the warning count unless the change explicitly documents why.

## Contributing

Contributions are welcome, especially:

- correcting inaccurate or contradictory explanations
- adding reliable sources to factual claims
- consolidating duplicate questions
- improving Japanese wording
- adding tests and accessibility improvements
- proposing reusable dataset tooling

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Please use the issue templates for bug reports and question corrections.

## Roadmap

See [ROADMAP.md](ROADMAP.md). Near-term priorities are dataset auditing, source metadata, stronger duplicate detection, accessibility, and documented releases.

## Responsible use

M3Quiz is a study aid. It is not affiliated with any employer, assessment provider, or official examination. Questions and answers may contain errors, approximations, or outdated information. Do not use the repository as a source for medical, legal, financial, or safety-critical decisions.

## Security

Please do not report security vulnerabilities through public issues. Follow [SECURITY.md](SECURITY.md).

## License

Code and original project documentation are licensed under the [MIT License](LICENSE). Dataset contributions are accepted under the same license unless a file explicitly states otherwise. Contributors must not submit copyrighted assessment questions copied from non-permissive sources.