# SCHEMA BUREAU — Relational Systems Lab

A local-first SQL schema workbench with Modern ER and Chen ER notation.

## Run

1. Extract this folder.
2. Open PowerShell in this folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the localhost URL Vite prints.

Or double-click `START_SCHEMA_BUREAU.bat` on Windows.

## Product flow

Landing / manifesto → cinematic boot → sign in / sign up → Workbench → Field Guide / Blueprints / Archive / Telemetry / Settings.

## Diagram export

The export menu follows the currently selected notation. Chen SVG/PNG exports are generated from the Chen layout model, not by screenshotting or reusing the Modern ER geometry.

## Groq AI

SCHEMA BUREAU now includes server-side Groq integration for Schema Intelligence. The local development Vite server reads `GROQ_API_KEY` from `.env.local` and proxies requests to Groq so the key is never shipped in the browser bundle. The configured model is `openai/gpt-oss-120b`.

**Security:** `.env.local` is ignored by Git. Do not commit it or publish it. Because the API key was shared during setup, rotate/revoke it in the Groq console after testing if this project will be shared publicly.

## Video Library

The authenticated workspace includes a Video Library at **Modules → Video Library**. It embeds selected SQL and DBMS lessons and playlists from YouTube, with topic filters, search, a mark-complete toggle stored in browser local storage, and links to open the original lesson on YouTube. Playback and availability are controlled by YouTube and the video publishers.

For local Groq AI configuration, create a `.env.local` file from `.env.example` and add your own `GROQ_API_KEY`. Do not commit `.env.local` or share API keys.

## GATE DBMS Arena

SCHEMA BUREAU includes a DBMS-only GATE preparation module at **GATE DBMS Arena**. It provides topic and difficulty filters, original practice questions with explanations, weekly and biweekly timed challenge sessions, local attempt history, 7/14/30-day accuracy snapshots, topic accuracy, and a year-wise paper-discovery archive for 2000–2026.

The built-in practice questions are original learning questions, not a reproduction of complete copyrighted GATE papers. The year-wise archive links users to external search results, the GATE portal, and GATE Overflow so they can locate source papers and answer keys. Check the official paper/answer key for each year and session. Progress is stored in browser local storage on the current device and is not synced between devices or accounts.


## GATE DBMS Arena — 65-question mock

The Arena includes a timed exam mode configured for **65 questions in 60 minutes**. It supports question-palette navigation, answer selection, mark-for-review flags, automatic submission when time expires, a results summary, and per-question answer explanations. Attempt history is stored in the browser's local storage.

**Question provenance:** the 65-question bank included in this build consists of original GATE-style practice questions. They are not represented as historical GATE questions. The archive links to paper sources, but verified historical PYQs still need to be imported with source year/session/question number and checked answer keys before this build can honestly offer a balanced PYQ + practice mock.


## BACSE202 Digital Assignment requirements implemented

- **Learn:** renamed the primary navigation item to Learn; existing concept explanations remain, with an educational SQL video embed and references.
- **Developed By / Guided By:** Project Companion includes student name/register number and the supplied faculty portrait for Dr. Swaminathan A, Assistant Professor.
- **Help:** step-by-step instructions for inputs, controls, processing and interpreting output.
- **Download:** exports an execution report as TXT and Word-compatible DOC; PDF is available through the browser print dialog. Report sections include SQL input, processing steps, intermediate table/relationship results, diagnostics and final summary.
- **Day/Night mode:** shared theme toggle is exposed on the Project Companion and uses the app-wide theme context.
- **Quiz:** user selects count and difficulty; attempts AI generation through the existing server-side Groq endpoint, then transparently falls back to the local practice bank if unavailable. It is one question at a time with feedback, explanation and score.
- **Competitive Exam:** exposes the 65-question DBMS bank with answers and explanations, searchable/filterable by topic.

### Accuracy and submission notes
- The included 65-question bank is original GATE-style practice,  verified historical GATE/UPSC/PSU PYQs. It is labelled accordingly; no year/session is invented.
- The Developed By section includes both team members and their supplied photographs: Surya Mannam (25BCE5411) and Harish S (25BCE5390).
- Confirm the official faculty spelling with the course page before submitting: the assignment text supplied in chat says **Dr. Swaminathan A**, while the project acknowledgement uses that exact supplied spelling.
- A full production build was not verified in this environment because node dependencies were unavailable. Run `npm install` and `npm run build` locally before submission.
