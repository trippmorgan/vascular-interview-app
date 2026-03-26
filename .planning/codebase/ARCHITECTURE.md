# Architecture

**Analysis Date:** 2026-03-26

## Pattern Overview

**Overall:** Component-driven React SPA with multi-modal clinical interview capture (text-based questionnaire + voice transcription + physical exam).

**Key Characteristics:**
- Client-side state management using React hooks (no Redux/external store)
- Hierarchical tab-based UI for managing multiple patient conditions simultaneously
- Dual-channel data flow: structured questionnaire answers + voice-to-AI extraction
- Clinical decision support via auto-calculated scoring systems and ICD-10/CPT coding suggestions

## Layers

**Presentation (Components):**
- Purpose: Render UI and handle user interactions
- Location: `src/components/`
- Contains: React components (LandingScreen, InterviewScreen, QuestionSection, ClinicalScoring, NoteGenerator, CodingPanel, PhysicalExam, VoiceInterview, VoiceRecorder, Summary, QuickReference, NoteEditor)
- Depends on: Data layer (interviewData, clinicalScoring, codingEngine)
- Used by: App entry point

**Data/Business Logic:**
- Purpose: Store clinical question definitions, scoring algorithms, coding rules
- Location: `src/data/`
- Contains:
  - `interviewData.js` - Question definitions for 7 patient conditions, universal history questions
  - `clinicalScoring.js` - Rutherford, WIfI, CEAP, Wagner, ABI, Carotid, NIHSS, Diabetic Foot Risk scoring systems
  - `codingEngine.js` - ICD-10 and CPT code databases with suggestion algorithms
- Depends on: None (no external dependencies)
- Used by: All components needing clinical data

**State Management:**
- Purpose: Maintain interview answers and UI state
- Location: Distributed across component local state (useState hooks)
- Contains:
  - `interviewData` - Structured answers to all questions {[questionId]: {checked, text, value, values}}
  - `activeTab` - Current tab in interview screen (interview, summary, coding, notes, voice)
  - `activeConditionTab` - Currently selected condition for condition-specific questions
  - `expandedSections` - Which question sections are expanded
  - `clinicalScores` - Calculated scores from clinical scoring systems
  - `manualScores` - Manually overridden clinical scores
  - `selectedCodes` - User-selected ICD-10/CPT codes
- Passes down via props as single source of truth per subtree

## Data Flow

**Main Interview Loop:**

1. User selects one or more conditions on LandingScreen
2. App.jsx receives selected conditions, renders InterviewScreen
3. InterviewScreen displays:
   - Universal questions (opening, cardiovascular, metabolic, surgical, medications)
   - Condition-specific questions (deduped - shared questions only appear once)
   - Physical exam section (tabs show relevant exams per condition)
   - Clinical scoring panel (shows applicable scoring systems)
   - Coding panel (suggests ICD-10/CPT based on answers)
   - Note generator (produces copy-paste-ready clinical note)
4. User answers questions → QuestionSection onChange handler → handleQuestionChange updates interviewData
5. interviewData flows down to QuestionSection, ClinicalScoring, CodingPanel, NoteGenerator as answers prop

**Voice Interview Flow:**

1. User clicks voice icon or selects VoiceInterview tab
2. VoiceRecorder captures audio (Web Speech API over HTTPS, Dragon.js fallback over HTTP, fallback to office proxy at 10.66.19.163)
3. Audio sent to Ollama endpoints for transcription
4. Transcription extracted to structured JSON via LLM prompt
5. Extracted data merged into interviewData via onAutoFill callback

**Clinical Scoring Flow:**

1. ClinicalScoring component renders based on getScoringForType(patientType)
2. Each scoring system has a classify() or score() function
3. Functions read relevant fields from flatAnswers (flattened interviewData)
4. Auto-calculated result displayed (e.g., Rutherford category 0-6)
5. User can override with manualScores
6. Scores used by NoteGenerator to populate clinical narrative

**Coding Suggestion Flow:**

1. CodingPanel calls suggestMultiConditionCodes(selectedConditions, interviewData, visitContext)
2. Coding engine matches answer patterns to ICD-10 database (location, severity, complications)
3. CPT codes suggested based on condition type + visit context (new vs established patient)
4. RVU (Relative Value Unit) calculated for selected CPT codes
5. User selects/deselects codes, manual codes can be added
6. Selected codes passed to NoteGenerator for inclusion in final note

**State Management:**

- Parent component (InterviewScreen) holds primary interview state (interviewData, selectedConditions)
- Child components (QuestionSection, PhysicalExam, ClinicalScoring, CodingPanel, NoteGenerator, VoiceInterview) receive data as props
- onChange callbacks propagate changes upward via handleQuestionChange, onDataChange patterns
- flatAnswers useMemo flattens nested interviewData for easier consumption downstream
- deduplicatedConditionSections useMemo deduplicates shared questions across multiple conditions

## Key Abstractions

**Question Schema:**
- Purpose: Uniform representation of all clinical questions regardless of type
- Examples: `src/data/interviewData.js` lines 16-389
- Pattern: Questions have `id`, `text`, `type` (checkbox/text/select/multiselect/yesno), optional `options`, optional `placeholder`
- Answer storage: `interviewData[questionId]` = {checked, text, value, values} depending on type

**Scoring System Object:**
- Purpose: Represent a clinical scoring tool with auto-calculation and manual override
- Examples: `src/data/clinicalScoring.js` (RUTHERFORD, WIFI, CEAP, WAGNER, ABI_INTERPRETATION, CAROTID_GRADING, NIHSS, DIABETIC_FOOT_RISK)
- Pattern: Each system exports {name, condition, classify/score function, categories/components}
- Integration: getScoringForType(patientType) returns applicable systems; ScoringCard renders each

**Coding Database:**
- Purpose: Centralized ICD-10 and CPT code repositories with metadata
- Examples: `src/data/codingEngine.js` lines 8-250
- Pattern: {[code]: {desc, category, laterality?}} for ICD-10; {[code]: {desc, rvu, category}} for CPT
- Lookup: ICD10_DATABASE[code] retrieves definition; suggestMultiConditionCodes() filters by condition type

**Color Coding:**
- Purpose: Visual distinction of patient conditions across UI
- Examples: conditionColors maps condition ID → {accent, bg, text, tab} Tailwind classes
- Used by: LandingScreen, InterviewScreen, CodingPanel, Summary
- Pattern: Consistent Tailwind color palette per condition (pad=red, venous=purple, carotid=blue, etc.)

## Entry Points

**Web Entry:**
- Location: `src/main.jsx`
- Triggers: Page load (registers React root, service worker)
- Responsibilities: Mount React app to #root, enable offline via service worker

**App Component:**
- Location: `src/App.jsx`
- Triggers: Initial render after main.jsx
- Responsibilities: Top-level state (selectedPatientTypes, interviewData); conditional render of LandingScreen vs InterviewScreen

**LandingScreen:**
- Location: `src/components/LandingScreen.jsx`
- Triggers: App renders when selectedPatientTypes is null
- Responsibilities: Multi-select condition picker, apply preset combos, route to interview

**InterviewScreen:**
- Location: `src/components/InterviewScreen.jsx`
- Triggers: App renders when selectedPatientTypes is set
- Responsibilities: Tab-based navigation (interview/summary/coding/notes/voice), render all sub-components with shared interviewData

## Error Handling

**Strategy:** Try-catch for external API calls (Ollama voice extraction); fallback URLs; user-visible error messages without app crash.

**Patterns:**
- Voice extraction: Loop through OLLAMA_URLS array, catch network errors, try next endpoint, final fallback to error message (VoiceInterview.jsx lines 76-114)
- Note generation: Safely read optional nested fields (answers || {}, examFindings || {}) to prevent undefined errors
- Code lookup: Check ICD10_DATABASE[code] exists before accessing; allow manual code entry as fallback (CodingPanel.jsx lines 69-79)
- Scoring: classify() and score() functions return null or default values if required fields missing

## Cross-Cutting Concerns

**Logging:** Browser console.log for service worker registration, network errors. No structured logging framework.

**Validation:** Client-side only (question types enforce input format via UI: toggles, text inputs, selects). No server-side validation (offline-first app).

**Authentication:** None (PWA for iPad use in clinic; no backend auth required).

**State Persistence:** Browser localStorage not explicitly used. Data lost on page reload (acceptable for single-session clinical note taking).

**Accessibility:**
- Keyboard navigation via button/input focus
- Touch targets min 44x44px for iPad (min-h-[56px] buttons)
- Screen reader hints (role="switch" on toggles, aria-checked)
- Semantic HTML where possible
