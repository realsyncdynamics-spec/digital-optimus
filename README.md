# Digital Optimus

**KI Screen-Agent for Creator-Automation by RealSync Dynamics**

Desktop-App (Electron) die deinen Bildschirm analysiert und Aufgaben automatisch ausfuehrt. Integriert mit Supabase und CreatorSeal.

## Architektur

```
main.js          - Electron Main Process + IPC
preload.js       - Secure Context Bridge
src/capture.js   - Screen Capture (screenshot-desktop + sharp)
src/agent.js     - KI Agent (System-1 Fast + System-2 LLM)
src/api.js       - Supabase DB + CreatorSeal API
ui/index.html    - Dark-Theme Dashboard
```

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/realsyncdynamics-spec/digital-optimus.git
cd digital-optimus
npm install
```

### 2. Environment
```bash
cp .env.example .env
```
Trage deine Keys ein:
- `SUPABASE_URL` - bereits gesetzt
- `SUPABASE_ANON_KEY` - aus Supabase Dashboard > Settings > API Keys
- `OPENAI_API_KEY` - von platform.openai.com
- `CREATORSEAL_API_KEY` - von CreatorSeal Dashboard

### 3. Starten
```bash
npm start
```

## Features

- Screen Capture mit automatischer Analyse
- KI-Agent mit System-1 (schnelle UI-Aktionen) und System-2 (LLM-Planung)
- Automations erstellen und verwalten
- Tasks tracken via Supabase
- CreatorSeal Integration (Content-Verifizierung)
- Dark-Theme Electron UI

## Supabase Tabellen

| Tabelle | Funktion |
|---|---|
| `do_automations` | Gespeicherte Automatisierungen |
| `do_tasks` | Task-Queue mit Status |
| `do_agent_logs` | Agent-Aktivitaetslog |
| `do_seal_proofs` | CreatorSeal Verifizierungen |

## Tech Stack

- Electron 28
- Node.js
- Supabase (PostgreSQL + RLS)
- OpenAI API
- screenshot-desktop + sharp
- CreatorSeal API

## Lizenz

Proprietary - RealSync Dynamics 2026
