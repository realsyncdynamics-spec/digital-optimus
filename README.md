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


---

## Go Agent (Native Desktop Automation)

Native Go-basierte Desktop-Automation mit `robotgo`. Laeuft neben der Electron-App als performanter Kern-Agent.

### Struktur

```
go-agent/
  cmd/desktop-client/main.go    # Entry Point - Session-Start, Signal-Handling
  internal/desktop/
    session.go                   # Capture-Loop mit Ticker
    screen.go                    # Screenshot via robotgo
    input.go                     # Maus/Tastatur-Automation
    hotkey.go                    # Global Hotkey (Ctrl+Alt+O)
  go.mod                         # Go Module mit robotgo + gohook
```

### Quick Start

```bash
cd go-agent
go mod tidy
go run cmd/desktop-client/main.go
```

### Features

- Screen Capture alle 3 Sekunden (konfigurierbar)
- Maus/Tastatur-Steuerung (MoveMouse, Click, TypeText, KeyTap, Scroll)
- Global Hotkey Ctrl+Alt+O zum Togglen der Session
- Graceful Shutdown via Ctrl+C
- Vorbereitet fuer LLM-Integration (TODO in session.go)
