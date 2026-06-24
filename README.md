<div align="center">

# MediVoice

### AI-Speaker–Based Nursing Information System

Turning bedside voice interactions into structured clinical documentation.

[![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MUI](https://img.shields.io/badge/MUI-5-007FFF?logo=mui&logoColor=white)](https://mui.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-22a559.svg)](./LICENSE)

**[▶ Live demo](https://stt-nursing-system.vercel.app)**

</div>

---

## Overview

Nursing documentation is one of the most time-consuming parts of inpatient care. **MediVoice** explores a
voice-first alternative: at the bedside, an AI speaker asks the patient structured assessment questions
(text-to-speech), the patient's answers are transcribed in real time (speech-to-text), and the system
normalizes them into a nursing record — which then flows into the patient chart, the rounding schedule, and
exportable PDF reports.

The application is a faithful, interactive realization of an undergraduate research project on improving
nursing-record efficiency with an AI-speaker assistant. In that study, the assisted workflow reduced
documentation time for a repeated assessment by **up to 96%**, and Google's Korean speech engine recognized
the reference utterance with a **0% character error rate**. Those findings are reproduced on the **Research**
screen.

> All data in the app is **synthetic** (generated with faker) and is for demonstration only.

## Highlights

- 🎙️ **Voice rounds** — an AI-speaker interaction loop (TTS → patient answer → STT → structured record) built on
  the Web Speech API, with a reliable simulation mode for presentations.
- 🩺 **EMR-grade patient charts** — vitals trends, lab panels with reference-range flagging, medications & MAR,
  assessment scales (Braden, Morse, GCS), intake/output, and a care plan.
- 🧠 **Standardized nursing language** — NANDA nursing diagnoses linked to **NOC** outcomes and **NIC**
  interventions, the way clinical documentation systems model them.
- 📈 **Unit dashboard** — census, acuity mix, a critical-patient watchlist, today's rounding schedule, and
  recent activity.
- 📄 **PDF reporting** — one-click nursing assessment and voice-rounding reports rendered with jsPDF.
- 🌐 **Bilingual UI (English / 한국어)** and a polished **light/dark** clinical theme.

## Screens

| Screen | What it does |
| --- | --- |
| **Dashboard** | Unit KPIs, census & acuity charts, critical watchlist, schedule and recent records |
| **Patients** | Filterable roster (data grid) → full EMR detail per patient |
| **Voice Rounds** | The AI-speaker assessment loop with live transcription and structured charting |
| **Nursing Records** | Browse rounding / SOAP records, review the Q&A transcript, sign & export |
| **Schedule** | Plan rounding sessions and track today's timeline |
| **Reports** | Live PDF preview and export of clinical documents |
| **Research** | The underlying study: STT benchmarks, time-and-motion efficiency, recognition by age |

## Tech stack

- **React 18 + TypeScript** (strict), built with **Vite**
- **MUI v5** design system + **MUI X** Data Grid & Date Pickers
- **recharts** for clinical data visualization
- **Zustand** for application state
- **Web Speech API** for STT/TTS, **jsPDF** for report generation
- **faker** for synthetic clinical data

## Getting started

```bash
# install
npm install

# run the dev server (http://localhost:5173)
npm run dev

# type-check and build for production
npm run build

# preview the production build
npm run preview
```

Requires Node.js ≥ 18.18. Speech recognition uses the browser's Web Speech API (best supported in Chromium-based
browsers); when it is unavailable, Voice Rounds automatically falls back to simulation mode.

## Project structure

```
src/
├── app/          application shell, routing, layout
├── theme/        clinical MUI theme (light/dark) and design tokens
├── i18n/         English/Korean internationalization
├── types/        clinical domain model
├── data/         curated clinical vocabularies + synthetic data generation
├── store/        Zustand store and selector hooks
├── lib/          clinical scoring, formatting, speech (STT/TTS), PDF
├── components/   shared UI building blocks
└── features/     one module per screen
```

## Acknowledgements

This project builds on the graduation research *"A study on work efficiency improvement using an AI-speaker–based
nursing-record work assistance system"* by **Hur Jun, Choi Hyo-jae, and Kim Yul**. Clinical terminology follows the
NANDA-I / NOC / NIC standardized nursing languages.

## License

Released under the [MIT License](./LICENSE).
