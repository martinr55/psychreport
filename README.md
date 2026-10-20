# Cognitive Report App

Web workspace for clinical psychologists drafting cognitive assessment reports from WAIS testing. This repository currently contains the application foundation and interface only.

Not included yet: authentication and database storage. WAIS-III scoring, DOCX/PDF export, and Estonian draft generation are included.

The interface is available in Estonian (default) and English.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Report draft

Set `OPENAI_API_KEY` in `.env.local`. The optional `OPENAI_MODEL` value selects the model; when it is unset, the route uses `gpt-4.1`.

The key is read only by the server route `src/app/api/reports`. Writing instructions live in `src/lib/report/instructions.ts`.

In the app, choose **Laadi näidisjuhtum**, then **Koosta aruanne**. The sample case is fictional. Edit any section, then download DOCX or PDF. Scoring stays in the WAIS-III calculator; the model only writes the narrative.

## Project structure

```text
src/
  app/                         Next.js App Router entry
  components/
    assessment/                Case forms and workspace state
    layout/                    Header, shell, section chrome
    report/                    Preview panel and generate action
    ui/                        Shared field styles
  data/                        Empty draft and WAIS subtest labels
  i18n/                        Estonian and English copy
  lib/buildPlaceholderReport.ts
  types/assessment.ts
```
