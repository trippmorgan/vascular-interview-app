# Coding Conventions

**Analysis Date:** 2026-03-26

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `VoiceRecorder.jsx`, `InterviewScreen.jsx`, `ClinicalScoring.jsx`)
- Data/utility modules: camelCase (e.g., `clinicalScoring.js`, `interviewData.js`, `codingEngine.js`)
- Styles: inline or Tailwind classes; no separate CSS files per component

**Functions:**
- camelCase for all functions (handlers, utils, utilities)
- Event handlers: `handle{Action}` pattern (e.g., `handlePatientTypeSelect`, `handleBack`, `handleManualScore`)
- Computed values: plain camelCase (e.g., `autoResult`, `flatAnswers`, `multiResult`)

**Variables:**
- camelCase throughout
- State variables: descriptive names (e.g., `selectedPatientTypes`, `interviewData`, `expandedSections`)
- Boolean flags: `is{State}` or `{state}` (e.g., `isRecording`, `isProcessing`, `error`)
- Collections: plural nouns (e.g., `conditions`, `clinicalScores`, `selectedICD10`)

**Types:**
- Objects representing data structures: plain object literals with UPPERCASE_SNAKE_CASE keys for constants
- Example: `ICD10_DATABASE`, `CPT_DATABASE`, `RUTHERFORD`, `CONDITION_COLORS`, `TRANSCRIBE_ENDPOINTS`

**Constants:**
- UPPERCASE_SNAKE_CASE for module-level constants (e.g., `ICD10_DATABASE`, `CONDITION_COLORS`, `TRANSCRIBE_ENDPOINTS`)
- camelCase for local state constants within functions

## Code Style

**Formatting:**
- No explicit formatter configured (no `.prettierrc`, no `prettier` in devDependencies)
- Code uses consistent indentation: 2 spaces
- Line length: varies, no strict limit enforced
- Semicolons: present throughout (not optional)

**Linting:**
- ESLint configured in `/home/tripp/Documents/vascular-interview-app/eslint.config.js`
- Config uses ESLint flat config format
- Key rules:
  - `no-unused-vars`: Error, with pattern `^[A-Z_]` to ignore uppercase/underscore-prefixed vars (React components, constants)
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Target: browser globals, ES2020+ syntax

## Import Organization

**Order:**
1. React core imports (`import React`, `import { useState, useMemo }`)
2. External dependencies (other npm packages)
3. Relative imports from `../data` or `./components`
4. Styles (imported CSS or Tailwind setup)

**Examples:**
- `import { useState, useMemo, useCallback, useEffect } from 'react';` (VoiceRecorder.jsx)
- `import { RUTHERFORD, WIFI, CEAP, WAGNER, ABI_INTERPRETATION, getScoringForType } from '../data/clinicalScoring';` (ClinicalScoring.jsx)
- `import { patientTypes, universalQuestions, conditionSpecificQuestions } from '../data/interviewData';` (InterviewScreen.jsx)

**Path Aliases:**
- Not detected. All imports use relative paths (`../data`, `./components`)

## Error Handling

**Patterns:**
- Try-catch for async operations (e.g., `startDragonRecording` in `VoiceRecorder.jsx`)
- Error state management: useState hook for error messages displayed to user
- Fallback mechanisms: if Dragon transcription fails, auto-switch to Web Speech API (VoiceRecorder.jsx)
- Navigator API errors logged to user via `setError()` state
- Example: `if (!response.ok) throw new Error(\`HTTP ${response.status}\`)` (VoiceRecorder.jsx, line 136)
- Clipboard fallback for older browsers using `document.execCommand('copy')` (NoteGenerator.jsx, lines 21-29)

## Logging

**Framework:** `console` (no dedicated logger imported)

**Patterns:**
- Minimal logging visible in code; mostly error states shown to user
- No `console.log()` calls for debugging found in main code
- User feedback via state (error messages, success alerts with `alert()`)

## Comments

**When to Comment:**
- Section dividers: used liberally for visual organization
  - Format: `// ─── {Section Name} ──────────────────────────────` (VoiceRecorder.jsx, clinicalScoring.js)
  - Format: `/* ── {Section} ────────────────────────────────────── */` (QuestionSection.jsx)
- Inline clarification: explain non-obvious logic
  - Example: `// Accept both array (multi-select) and string (legacy single)` (App.jsx, line 12)
  - Example: `// Deduplicate: track which question IDs we've already shown across conditions` (InterviewScreen.jsx, line 57)
- State documentation: describe what mutable state tracks
- Data structure notes: explain complex nested objects

**JSDoc/TSDoc:**
- Used selectively for exported functions in data modules
- Format: `/** description */` above function definitions
- Example from `NoteGenerator.jsx`:
  ```javascript
  /**
   * NoteGenerator
   *
   * Generates a copy-paste-ready clinical note from interview answers,
   * physical exam findings, clinical scores, and coding suggestions.
   * Output is formatted for direct paste into Athena.
   */
  export default function NoteGenerator({ ... }) { ... }
  ```
- Example from `ClinicalScoring.jsx`:
  ```javascript
  /**
   * Clinical Scoring Panel
   *
   * Auto-calculates scores from interview answers + allows manual override.
   * Shows applicable scoring systems based on patient type.
   */
  ```

## Function Design

**Size:** Functions range from ~20 to ~100+ lines; longer functions group related logic (e.g., `startDragonRecording` ~20 lines, `generateNote` helper ~100+ lines)

**Parameters:**
- Destructured props in components (e.g., `function InterviewScreen({ patientType, selectedConditions = [], onBack, interviewData, setInterviewData })`)
- Default values used (e.g., `compact = false`)
- Objects passed as single parameter for multiple related values

**Return Values:**
- Components return JSX
- Utility functions return objects, arrays, primitives, or `null`
- Early returns used to bail on invalid states (e.g., `if (applicableSystems.length === 0) return null;`)

## Module Design

**Exports:**
- Data modules export named constants and utility functions (e.g., `export const RUTHERFORD = { ... }; export function getScoringForType(patientType) { ... }`)
- Component modules use `export default function {ComponentName}() { ... }`
- Named exports used for utility functions and databases

**Barrel Files:**
- Not detected. Each component/module imported individually with full relative path

## Styling Conventions

**Framework:** Tailwind CSS utility classes (no custom CSS files per component)

**Patterns:**
- All styles applied via className strings
- Conditional classes using template literals:
  ```javascript
  className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
    isRecording ? 'bg-red-600 animate-pulse' : isProcessing ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600 active:scale-95'
  }`}
  ```
- Inline styles used in some places (e.g., NoteGenerator.jsx uses both Tailwind and style prop for spacing/colors)
- Component-level color maps: CONDITION_COLORS, confidenceColor helpers (CodingPanel.jsx)
- Responsive classes: minimal use detected (layout mostly works on mobile)

## React Hooks Usage

**Patterns:**
- `useState` for local state (answers, tab selections, errors)
- `useMemo` for expensive calculations (flattened interview data, deduplication)
- `useCallback` for stable function references in event handlers (toggleICD10, toggleCPT)
- `useRef` for imperative API access (media recorder, speech recognition, timers)
- `useEffect` for cleanup on unmount (VoiceRecorder cleanup)

**Hooks Rule:** Conditional returns used but no conditional hook calls detected (safe)

---

*Convention analysis: 2026-03-26*
