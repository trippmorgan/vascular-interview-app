# Codebase Structure

**Analysis Date:** 2026-03-26

## Directory Layout

```
vascular-interview-app/
├── src/                          # Source code
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Root component (condition selection router)
│   ├── App.css                   # Global styles
│   ├── index.css                 # Tailwind + base styles
│   ├── components/               # React components
│   │   ├── LandingScreen.jsx     # Condition selection (multi-select)
│   │   ├── InterviewScreen.jsx   # Main interview UI (tab container)
│   │   ├── QuestionSection.jsx   # Question renderer (checkbox/text/select/multiselect/yesno)
│   │   ├── PhysicalExam.jsx      # Pulse, edema, skin, carotid, abdominal, dialysis exams
│   │   ├── ClinicalScoring.jsx   # Display + manual override of scores
│   │   ├── CodingPanel.jsx       # ICD-10/CPT suggestion + selection
│   │   ├── NoteGenerator.jsx     # Generate copy-paste clinical note
│   │   ├── NoteEditor.jsx        # Edit generated note inline
│   │   ├── VoiceInterview.jsx    # Voice-to-text transcription + extraction
│   │   ├── VoiceRecorder.jsx     # Audio capture (Web Speech API + Dragon.js)
│   │   ├── Summary.jsx           # Structured summary of answers
│   │   ├── QuickReference.jsx    # Quick lookup tips by condition
│   ├── data/                     # Data + business logic
│   │   ├── interviewData.js      # Question definitions (universal + condition-specific)
│   │   ├── clinicalScoring.js    # Scoring algorithms (Rutherford, WIfI, CEAP, Wagner, etc.)
│   │   ├── codingEngine.js       # ICD-10/CPT databases + suggestion rules
│   ├── assets/                   # Static assets
├── public/                       # Public static files
├── index.html                    # HTML entry point (PWA meta tags, service worker reg)
├── vite.config.js                # Vite bundler config
├── package.json                  # Dependencies (React, Tailwind, Vite)
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config for Tailwind
├── eslint.config.js              # ESLint config
├── .planning/                    # Planning documents
│   └── codebase/                 # Architecture analysis
```

## Directory Purposes

**`src/`:**
- Purpose: All application source code
- Contains: Components, data modules, styles
- Key files: `main.jsx` (entry), `App.jsx` (root), components and data subdirs

**`src/components/`:**
- Purpose: React UI components
- Contains: Presentational and container components
- Key files:
  - `InterviewScreen.jsx` - Orchestrates all sub-components, manages interview state
  - `LandingScreen.jsx` - Initial condition selector
  - `QuestionSection.jsx` - Generic question renderer (reused for universal + condition-specific questions)
  - `PhysicalExam.jsx` - Physical exam data entry (condition-gated exam sections)
  - `ClinicalScoring.jsx` - Auto-calculated clinical scores with manual override UI
  - `CodingPanel.jsx` - Code suggestion and selection (multi-condition aware)
  - `NoteGenerator.jsx` + `NoteEditor.jsx` - Final clinical note assembly and editing

**`src/data/`:**
- Purpose: Question definitions, clinical scoring algorithms, coding rules
- Contains: Static data and pure functions (no component code)
- Key files:
  - `interviewData.js` (389 lines) - Question schema for 7 conditions (PAD, Venous, Carotid, Wound, Dialysis, AAA, DVT)
  - `clinicalScoring.js` (600+ lines) - 8 scoring systems with classify/score functions
  - `codingEngine.js` (600+ lines) - ICD-10 (150+ codes), CPT (50+ codes), suggestion algorithms

**`public/`:**
- Purpose: Static assets served as-is
- Contains: Icons, manifest.json, service worker (if present)

**`src/assets/`:**
- Purpose: Imported static resources (SVGs, images)
- Contains: Custom icons, images
- Note: Appears empty or minimal in current repo

## Key File Locations

**Entry Points:**
- `src/main.jsx` - React root mount, service worker registration
- `index.html` - HTML shell with PWA meta tags, root div#root, script loader
- `src/App.jsx` - Root React component (condition selection state)

**Configuration:**
- `vite.config.js` - Vite config (base path for gh-pages deployment)
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS plugins (Tailwind)
- `eslint.config.js` - ESLint rules (JavaScript Standard + React hooks)
- `package.json` - Dependencies, build scripts

**Core Logic:**
- `src/data/interviewData.js` - Question definitions (7 conditions, universal history)
- `src/data/clinicalScoring.js` - Scoring systems (Rutherford, WIfI, CEAP, Wagner, ABI, Carotid, NIHSS, Diabetic Foot)
- `src/data/codingEngine.js` - ICD-10/CPT code databases and suggestion engine
- `src/components/InterviewScreen.jsx` - Main interview container (tabs, state, orchestration)

**Styling:**
- `src/index.css` - Tailwind directives + custom scrollbar, selection styles
- `src/App.css` - Global layout, print styles, touch-friendly tap targets
- `src/components/*.jsx` - Inline Tailwind classes (no separate component CSS files)

## Naming Conventions

**Files:**
- Components: PascalCase (LandingScreen.jsx, QuestionSection.jsx)
- Data modules: camelCase (interviewData.js, clinicalScoring.js, codingEngine.js)
- Styles: lowercase (index.css, App.css)

**Directories:**
- Standard snake_case for non-code dirs (src, public, dist)
- Flat components/ and data/ structure (no nested dirs)

**React Components:**
- Export as named function (function LandingScreen {...})
- Props: camelCase (selectedPatientTypes, onStartInterview)
- State hooks: camelCase (interviewData, setInterviewData)
- Internal state objects: lowercase or camelCase (clinicalScores, expandedSections)

**Data Exports:**
- Constants: UPPER_SNAKE_CASE (ICD10_DATABASE, RUTHERFORD, WIFI, etc.)
- Functions: camelCase (getScoringForType, suggestMultiConditionCodes, calculateRVU)

**CSS Classes:**
- All Tailwind utility classes (no custom class definitions except in App.css, index.css)
- Conditional classes via template literals (bg-red-100 when selected, bg-gray-100 when not)
- Explicit spacing: px-4, py-2, gap-2 (no abbreviations like p-2 for just padding)

## Where to Add New Code

**New Clinical Question:**
1. Add question to `src/data/interviewData.js` in appropriate section (universalQuestions or conditionSpecificQuestions[conditionId].sections)
2. Question schema: `{id: 'unique_id', text: 'Question text?', type: 'checkbox|text|select|multiselect|yesno', options?: [...]}`
3. Answer auto-stored in `interviewData[id]` as {checked, text, value, values}
4. Display handled automatically by QuestionSection component in InterviewScreen

**New Clinical Scoring System:**
1. Add export to `src/data/clinicalScoring.js` (e.g., export const MY_SCORE = {...})
2. Define: name, condition, categories or components
3. Implement: classify(answers) or score(answers) function that reads from answers object
4. Register: Add to getScoringForType(patientType) to conditionally show
5. UI: Add case in ClinicalScoring.jsx ScoringCard to render custom display
6. Example: NIHSS (lines 280-340 in clinicalScoring.js) + NihssDisplay in ClinicalScoring.jsx

**New ICD-10/CPT Code:**
1. Add to ICD10_DATABASE or CPT_DATABASE in `src/data/codingEngine.js`
2. Key pattern: {code: {desc, category: 'pad|venous|carotid|etc', laterality?: 'right|left|bilateral'}}
3. Optional: Add rules to suggestMultiConditionCodes() to auto-include code when certain answers present
4. UI: CodingPanel displays all suggested codes; user can select/deselect

**New Physical Exam Section:**
1. Add to PhysicalExam.jsx state (e.g., useState for new exam type)
2. Map condition → exam sections in conditionExamSections object (line 5)
3. Add SectionWrapper + input fields for exam data
4. Call handleXXXChange callbacks to update parent interviewData
5. PhysicalExam passes exam data up via onDataChange prop

**New Condition Type:**
1. Add to patientTypes array in `src/data/interviewData.js`
2. Add conditionSpecificQuestions[newConditionId] section with question definitions
3. Add condition-specific scoring in clinicalScoring.js + getScoringForType()
4. Add ICD-10 codes in codingEngine.js with category: 'newConditionId'
5. Add color scheme to conditionColors in LandingScreen and InterviewScreen
6. UI automatically routes through existing components; no new component files needed

**New Tab in InterviewScreen:**
1. Add tab button in header section (line 147+)
2. Add state: const [activeTab, setActiveTab] = useState('interview')
3. Add conditional render based on activeTab
4. Component receives props: patientType, selectedConditions, interviewData, setInterviewData
5. Example: VoiceInterview tab (lines 29-30, 174-177)

**Utilities/Helpers:**
- Shared functions: Add to `src/data/codingEngine.js` or create new module in `src/data/`
- Component helpers: Define inside component file (don't extract to separate files unless reused in 3+ places)
- Example: calculateRVU, flatAnswers useMemo

## Special Directories

**`dist/`:**
- Purpose: Build output (gitignored)
- Generated: Yes (npm run build via Vite)
- Committed: No
- Contents: Bundled React app, minified JS/CSS, deployed to gh-pages

**`.planning/codebase/`:**
- Purpose: Architecture analysis documents
- Generated: No (manually created by mapping process)
- Committed: Yes
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md

**`.claude-team/`:**
- Purpose: Claude team collaboration metadata
- Generated: No
- Committed: Yes
- Contents: Project context files

**`reference/vascular-logger/`:**
- Purpose: Previous version of app (reference only)
- Generated: No
- Committed: Yes
- Contents: Legacy codebase (do not modify; reference only)

**`plaud-templates/`:**
- Purpose: Template files for PLAUD AI recorder integration
- Generated: No
- Committed: Yes
- Contents: Configuration or template files for PLAUD
