# External Integrations

**Analysis Date:** 2026-03-26

## APIs & External Services

**Speech Recognition & Transcription:**
- Web Speech API (browser-native) - Client-side transcription for HTTPS contexts
  - SDK/Client: Browser `window.SpeechRecognition` / `window.webkitSpeechRecognition`
  - No auth required
  - Used in: `src/components/VoiceRecorder.jsx`

- Dragon Speech Recognition (proprietary backend) - Server-side transcription for HTTP contexts
  - Endpoints: `src/components/VoiceRecorder.jsx`
    - Office proxy: `http://10.66.19.163:8888/api/transcribe`
    - Direct (Tailscale): `http://100.101.184.20:5005/transcribe`
    - Direct (home LAN): `http://192.168.0.125:5005/transcribe`
  - Method: POST with multipart form data (audio file)
  - No authentication
  - Fallback chain: Tries office proxy first, then Tailscale, then home LAN

**AI/LLM Services:**
- Ollama (local/remote LLM inference) - Medical data extraction and note generation
  - Endpoints: Configured in `src/components/VoiceInterview.jsx` and `src/components/NoteEditor.jsx`
    - Office proxy: `http://10.66.19.163:8888/api/chat`
    - Direct (Tailscale): `http://100.101.184.20:11434/v1/chat/completions`
    - Direct (home LAN): `http://192.168.0.125:11434/v1/chat/completions`
  - Model: `llama3:8b`
  - Method: POST with JSON payload
  - No authentication
  - Fallback chain: Tries office proxy first, then Tailscale, then home LAN
  - Uses: `src/components/NoteEditor.jsx` (section regeneration), `src/components/VoiceInterview.jsx` (clinical data extraction)

**Voice Interview (AI Chat):**
- Same Ollama endpoints as above
- Chat completion requests with system prompts for clinical data extraction
- JSON response parsing with fallback to markdown code block extraction
- Timeout: 60 seconds per request

**External Web Links:**
- Plaud AI App - Referenced in UI as external link (documentation)
  - URL: `https://app.plaud.ai`
  - Used in: `src/components/LandingScreen.jsx`, `src/components/InterviewScreen.jsx`

## Data Storage

**Databases:**
- None detected - Application is client-side only

**File Storage:**
- Browser Local Storage - Could be used (not detected in current codebase)
- Session Storage - Could be used (not detected in current codebase)
- IndexedDB - Could be used (not detected in current codebase)
- Client-side generated files:
  - Notes exported as `.txt` files (in-memory blob generation)
  - Print functionality via window.open()

**Caching:**
- Service Worker cache (`public/sw.js`)
  - Cache name: `vascular-interview-v1`
  - Cached resources: `/`, `/index.html`, `/manifest.json`
  - Strategy: Cache-first with network fallback
  - Used for PWA offline functionality

## Authentication & Identity

**Auth Provider:**
- None - Application is open, unauthenticated

**Authorization:**
- No authorization layers - All features accessible without login

## Monitoring & Observability

**Error Tracking:**
- None detected - No external error tracking service integration

**Logs:**
- Browser console logging only (console.log/console.error)
- Service Worker registration logged to console
- No centralized logging

## CI/CD & Deployment

**Hosting:**
- GitHub Pages
- Base path: `/vascular-interview-app/` (configured in `vite.config.js`)

**CI Pipeline:**
- Not configured - No `.github/workflows` directory
- Manual deployment via `npm run deploy` using gh-pages package

**Deployment Process:**
- Local: `npm run predeploy` (builds) + `npm run deploy` (publishes to gh-pages branch)
- No automated pipeline (manual trigger required)

## Environment Configuration

**Required env vars:**
- None - No environment variables used or required
- All configuration is hardcoded or derived from build time

**Secrets location:**
- Not applicable - No secrets managed

**Internal endpoints (hardcoded):**
- Office proxy (Precision T3600): `http://10.66.19.163:8888/`
- Voldemort via Tailscale: `http://100.101.184.20:5005/` (transcription), `http://100.101.184.20:11434/` (LLM)
- Voldemort via home LAN: `http://192.168.0.125:5005/` (transcription), `http://192.168.0.125:11434/` (LLM)

## Webhooks & Callbacks

**Incoming:**
- None - Application is client-side only

**Outgoing:**
- None - No webhook calls to external services

---

*Integration audit: 2026-03-26*
