# Cognitive Report App

Web workspace for clinical psychologists drafting cognitive assessment reports from WAIS testing. This repository currently contains the application foundation and interface only.

Not included yet: authentication, database storage, psychometric scoring, language-model generation, or DOCX/PDF export.

The interface is available in Estonian (default) and English.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
