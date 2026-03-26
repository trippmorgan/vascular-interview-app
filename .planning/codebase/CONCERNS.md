# Codebase Concerns

**Analysis Date:** 2026-03-26

## Tech Debt

**Large monolithic files:**
- Files: `src/data/codingEngine.js` (672 lines), `src/components/InterviewScreen.jsx` (423 lines), `src/components/CodingPanel.jsx` (414 lines)
- Issue: Complexity and cognitive load. `codingEngine.js` contains full ICD-10/CPT databases plus all suggestion logic in a single file. InterviewScreen manages 7 tabs, multiple state objects, and complex conditional rendering.
- Impact: Difficult to test individual functions. Harder to maintain specific code paths. Onboarding new developers is harder. Changes to one feature risk breaking others.
- Fix approach: Extract `codingEngine.js` into modules: `icd10Database.js`, `cptDatabase.js`, `suggestICD10.js`, `suggestCPT.js`, `calculateRVU.js`. Split InterviewScreen into smaller tab-specific components.

**Inconsistent state management:**
- Files: `src/App.jsx`, `src/components/InterviewScreen.jsx`, `src/components/CodingPanel.jsx`, `src/components/VoiceInterview.jsx`
- Issue: State is managed at multiple levels (App.jsx holds patientType/interviewData, then passed as props through 6+ levels). Voice features manage their own extracted data in local state. No context API or state machine pattern.
- Impact: Prop drilling creates fragility. If a prop name changes, multiple files break. Data flow is hard to trace. Voice extraction doesn't merge with main state cleanly.
- Fix approach: Use React Context for interviewData and patientType. Create a custom hook for voice extraction that returns standardized mapped data that can be merged into main state.

**Manual code mapping with string matching:**
- Files: `src/components/VoiceInterview.jsx` (lines 109-150)
- Issue: The `mapToInterviewData()` function maps AI-extracted fields to form fields using hardcoded string matching and complex nested conditionals. If field IDs change in `interviewData.js`, mapping breaks silently.
- Impact: AI extraction can populate wrong fields or miss data. No type safety. Regex-based medication matching is fragile (lines 147-148 checks for exact medication names).
- Fix approach: Create a `fieldMappingEngine.js` with explicit mappings (e.g., `{ aiField: 'smoking_status', formField: 'smoking_history', transform: (val) => val.includes('current') }`). Use a schema validator for extracted data.

**No persistent data storage:**
- Files: Entire codebase - no localStorage, sessionStorage, or backend API
- Issue: Interview data exists only in React state. Refreshing the page loses all data. Users cannot save progress or resume sessions.
- Impact: Unusable for real clinical workflows where data entry takes 20+ minutes. No audit trail. No multi-device access.
- Fix approach: Add localStorage with debounced saves (e.g., save every 10 seconds of inactivity). Create export/import feature (JSON or PDF). Eventually add backend API for persistent storage.

**Global hardcoded URLs:**
- Files: `src/components/VoiceRecorder.jsx` (lines 4-8), `src/components/VoiceInterview.jsx` (lines 4-8)
- Issue: Transcription and AI endpoints are hardcoded as arrays of HTTP URLs specific to one office network (10.66.19.163, Voldemort server on Tailscale/LAN). No environment configuration.
- Impact: Cannot deploy to multiple environments. Changing servers requires code edit + rebuild. URLs are visible in built JS (security concern if credentials were embedded). Tests cannot mock endpoints.
- Fix approach: Move endpoints to environment config: `VITE_TRANSCRIBE_ENDPOINTS`, `VITE_OLLAMA_URLS` in .env.local. Add endpoint selection UI or auto-discovery.

**Weak error handling:**
- Files: `src/components/VoiceRecorder.jsx` (line 68 comment `/* already started */`), `src/components/VoiceInterview.jsx` (line 103), `src/components/NoteGenerator.jsx` (line 20 silent catch)
- Issue: Many try-catch blocks silently swallow errors or show generic messages. Line 142 in VoiceRecorder shows "Dragon offline...Switching to browser speech" but doesn't log why Dragon failed. User gets no actionable feedback on which step failed.
- Impact: Hard to debug production issues. Users don't know if their voice wasn't loud enough, mic permission was denied, or server is down. Silent failures in data mapping could corrupt records.
- Fix approach: Create error handler utility that logs with context (endpoint, timeout value, response status), shows user-appropriate messages (retry/switch/manual entry), and tracks error frequency for monitoring.

---

## Known Bugs

**Voice transcription fallback chain incomplete:**
- Symptoms: User starts recording, all Dragon endpoints fail, falls back to Web Speech API mid-session. User expected continuous recording but API resets.
- Files: `src/components/VoiceRecorder.jsx` (lines 148-161)
- Trigger: Record audio → all three TRANSCRIBE_ENDPOINTS timeout/fail → mode switches from 'dragon' to 'speech' → user continues speaking but recognitionRef is null or stale
- Workaround: Restart recording after mode switch (not obvious to user)

**AI extraction JSON parsing is brittle:**
- Symptoms: "AI extraction failed" error with valid transcript
- Files: `src/components/VoiceInterview.jsx` (line 97)
- Cause: Ollama sometimes returns JSON without markdown backticks or with extra whitespace. Regex `/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/` fails if response is just `{...}` or has comments. Parser throws uncaught error.
- Trigger: Transcribe → extract → response format unexpected
- Workaround: None - user must restart and try again

**Medication deduplication in voice mapping not applied to manual entry:**
- Symptoms: User manually enters same medication twice, both appear in all_medications field
- Files: `src/components/VoiceInterview.jsx` (lines 141-148), but issue is in main form state management
- Cause: Voice extraction maps medications to `all_medications` text field. Form allows manual edit/duplication. No deduplication on merge.
- Trigger: Voice fills medications → user manually adds duplicate via note editor
- Workaround: Manually delete from text

**Multi-condition selection shows duplicate questions:**
- Symptoms: When selecting PAD + Carotid, a question that's in both conditions might appear twice or section counts might be off
- Files: `src/components/InterviewScreen.jsx` (lines 57-79, deduplicatedConditionSections logic)
- Cause: The deduplication Set is built at render time. If conditions array includes same condition twice (edge case), or if a question ID is in both universal AND condition-specific, the seen set logic might not handle correctly.
- Trigger: Select same condition twice or use unusual condition combinations
- Workaround: Don't repeat conditions in selection

---

## Security Considerations

**API endpoints exposed in browser JavaScript:**
- Risk: Hardcoded URLs like `http://10.66.19.163:8888/api/chat` are visible in compiled dist/assets/*.js and network tab. If credentials were in URL (they're not currently, but could be added), they'd leak.
- Files: `src/components/VoiceRecorder.jsx`, `src/components/VoiceInterview.jsx`
- Current mitigation: No auth tokens in URLs. All connections are HTTP to internal IPs (office network).
- Recommendations: Move URLs to environment variables. Use header-based auth if credentials needed. Add CORS validation on backend. Consider adding API key rotation to backend endpoints.

**No input validation on code entry:**
- Risk: User can manually enter arbitrary text as ICD-10/CPT codes (line 76 in CodingPanel: `// Allow unknown codes with manual entry`). Could lead to incorrect billing codes being used.
- Files: `src/components/CodingPanel.jsx` (lines 66-81)
- Current mitigation: Manual codes are marked as `type: 'unknown'` in UI.
- Recommendations: Validate against known code formats (ICD-10: ^[A-Z]{1}\d{2}(\.\d{1,2})?$). Warn if code format looks invalid. Add "unknown code" warning on export.

**No sanitization of AI-extracted text:**
- Risk: If Ollama prompt injection succeeds, extracted data could contain HTML/script. When displayed in textarea or note, could execute.
- Files: `src/components/VoiceInterview.jsx` (lines 113-150)
- Current mitigation: React auto-escapes text in JSX. Text is in textarea/pre elements, not rendered as HTML.
- Recommendations: Validate extracted data shape before using it. Reject any data with HTML tags or script patterns. Add Content Security Policy header.

**Clinical data in browser memory only:**
- Risk: Patient health information stays in browser RAM. Not encrypted in transit (HTTP), no HTTPS mandate.
- Files: Entire app
- Current mitigation: App is on internal network only (10.x.x.x), HTTPS not enforced
- Recommendations: Require HTTPS for production (even internal). Add localStorage encryption if implementing offline caching. Never send PII to third-party APIs. Add session timeout and data clearance.

---

## Performance Bottlenecks

**Large ICD-10/CPT database in memory:**
- Problem: `codingEngine.js` loads 300+ ICD-10 codes and 150+ CPT codes into memory at app startup. Database is never lazy-loaded or indexed.
- Files: `src/data/codingEngine.js` (lines 9-233)
- Cause: Full object lookup is O(1) but bundle size increases ~50KB. If database grows to 10K+ codes, bundle will be slow to download and parse on slow mobile networks.
- Improvement path: Split database into separate files per category (pad-codes.js, carotid-codes.js). Use dynamic imports for code suggestions only when tab is opened. Add binary search or indexed lookup if database grows.

**Suggest functions iterate full database:**
- Problem: Every call to `suggestICD10()` or `suggestCPT()` loops through entire database (or all codes of relevant category). No caching, no memoization.
- Files: `src/data/codingEngine.js` (lines 262-400+), called from `src/components/CodingPanel.jsx` (line 35)
- Cause: Re-renders call suggestion function on every patientType/interviewData change
- Improvement path: Use useMemo in CodingPanel to cache suggestions. Build category indices at startup (one-time cost). Use faster filtering: `Object.entries(ICD10_DATABASE).filter(([_, entry]) => entry.category === patientType)`.

**Full interview re-render on small state change:**
- Problem: Changing one question answer re-renders all 200+ questions in InterviewScreen
- Files: `src/components/InterviewScreen.jsx` (entire file, no React.memo on QuestionSection)
- Cause: Parent component re-renders, all children re-render. Interview data change triggers flatAnswers and deduplicatedConditionSections useMemo (lines 35-79), then all QuestionSections re-render even if their props didn't change.
- Improvement path: Wrap QuestionSection in React.memo(). Memoize section data structures separately. Split tabs into separate components that only render when active.

**Summary and Note generation not memoized:**
- Problem: Users see lag when switching to Summary or Note tabs for first time (or when data changes). Generation runs on render with no caching.
- Files: `src/components/Summary.jsx`, `src/components/NoteGenerator.jsx`
- Cause: Complex text generation (formatNote, generateNote functions) runs synchronously on each render
- Improvement path: All generation uses useMemo already (NoteGenerator line 12, Summary likely similar), so lag is likely from Initial render. Move generation to useEffect if rendering during tab switch is laggy.

---

## Fragile Areas

**Voice mode fallback logic:**
- Files: `src/components/VoiceRecorder.jsx` (lines 20, 148-161)
- Why fragile: Mode is set based on `isSecureContext && hasSpeechRecognition` at init time. If user switches from HTTP to HTTPS mid-session, mode doesn't update. If Dragon is unavailable at init but comes online, app won't switch to Dragon.
- Safe modification: If changing mode-switching logic, test both: (1) start on HTTP, (2) start on HTTPS with no Dragon available, (3) Dragon comes online during session. Add logs for mode changes.
- Test coverage: No tests. Impossible to test without real Dragon server and different network conditions.

**Clinical scoring system selection:**
- Files: `src/data/clinicalScoring.js`, `src/components/ClinicalScoring.jsx` (line 11)
- Why fragile: `getScoringForType(patientType)` returns array of scoring systems based on patient type. If new scoring system is added to database but not mapped in `getScoringForType()`, it's never shown. If question answer fields expected by scorer don't exist (e.g., NIHSS expects `nihss_*` fields), scorer fails silently.
- Safe modification: Before adding new scorer, (1) add to clinicalScoring.js, (2) add mapping in getScoringForType(), (3) ensure all required question IDs exist in interviewData.js, (4) test manually with that patient type selected.
- Test coverage: No automated tests. Scorer availability depends on data consistency that's not validated.

**Medical code suggestion confidence logic:**
- Files: `src/data/codingEngine.js` (lines 262-400+)
- Why fragile: Suggestions assign confidence (high/medium/low) based on heuristics (e.g., line 281: `hasWound ? 'medium' : 'high'`). If question IDs change or interview data structure changes, confidence becomes wrong.
- Safe modification: Before changing interview question IDs, grep entire codebase for references in suggestion logic. If adding new condition, add new `if (patientType === 'newcond')` block with explicit confidence rules. Document why each confidence level is chosen.
- Test coverage: No tests. Suggests use hardcoded decision trees that are error-prone.

**Interview data shape assumptions:**
- Files: `src/components/VoiceInterview.jsx` (mapToInterviewData), `src/components/InterviewScreen.jsx` (flatAnswers computation), `src/data/codingEngine.js` (all suggestion functions)
- Why fragile: Code assumes interviewData shape: `{ questionId: { checked: bool, text: string, value: any, values: array } }`. If a question stores data differently (e.g., nested objects, different property names), multiple parts of the app break.
- Safe modification: Before changing how a question stores data, search for all uses: grep all components and codingEngine for `interviewData[questionId]`. Update all 5-10 places that touch that field.
- Test coverage: No tests. Data shape validation would catch this.

---

## Scaling Limits

**Local state only:**
- Current capacity: Interview data for 1 patient in 1 browser session
- Limit: App resets on page refresh, only 1 user per browser, no multi-session tracking
- Scaling path: Implement localStorage (step 1), then add backend API to store sessions. Allow users to load previous sessions. Add multi-user support with role-based access control.

**No database:**
- Current capacity: No persistent data
- Limit: Cannot run reports, cannot audit who entered what, cannot track patient histories
- Scaling path: Add backend database (Firebase, PostgreSQL). Store interview transcripts, extracted codes, user edits. Create reporting dashboard.

**Hardcoded AI endpoints:**
- Current capacity: 1 Ollama instance in office
- Limit: If load increases, single endpoint becomes bottleneck
- Scaling path: Implement endpoint load balancing. Add queue if Ollama is slow. Consider cloud API (OpenAI, Anthropic) as fallback.

---

## Dependencies at Risk

**React 19.2.0 - very new, potential stability issues:**
- Risk: React 19 was released mid-2024, still rapid iteration. Future updates might have breaking changes. Few real-world apps at scale yet.
- Impact: Updates might require code changes. Less Stack Overflow help available for edge cases.
- Migration plan: Lock to ^19.2.0 for now. Monitor React GitHub for breaking changes. When 20.x is stable (1+ year), plan migration.

**No testing framework - all manual testing:**
- Risk: Growing codebase without tests means regression bugs will appear as features are added.
- Impact: Can't confidently refactor. Each code change risks breaking something else.
- Migration plan: Add Vitest (already in devDeps but not configured). Start with critical path tests (voice extraction, code suggestion).

**No type checking - using JavaScript not TypeScript:**
- Risk: No compile-time errors for prop types, function signatures, object shapes. Refactoring is error-prone.
- Impact: Missing props cause runtime crashes. Renamed fields break silently. Difficult to refactor large files.
- Migration plan: Install TypeScript, gradually migrate files (start with utils and data files). Use JSDoc for immediate type hints if full migration blocked.

---

## Missing Critical Features

**No data export:**
- Problem: User completes interview but can't save it to EHR or file. Generated note is copy-paste only.
- Blocks: Integration with hospital workflow, billing system, patient charts
- Solution: Add "Export as PDF" (use jsPDF library), "Export as JSON" (for backup), "Copy full note" already exists

**No user authentication:**
- Problem: No login system. Anyone with link can see/edit patient data.
- Blocks: HIPAA compliance, multi-user access, audit trail
- Solution: Add auth provider (Auth0, Firebase Auth). Store data server-side with user ownership.

**No template system for custom intakes:**
- Problem: Interview questions are hardcoded. Different clinic/provider might want different questions.
- Blocks: Customization for different surgical teams, research studies, other use cases
- Solution: Create admin interface to build custom questionnaires. Store template versions.

**No voice recording playback:**
- Problem: Transcript exists but user can't hear original audio to verify. Trust in AI extraction is low.
- Blocks: Quality control, dispute resolution
- Solution: Store audio blob (localStorage or backend), add playback UI with seek bar

**No offline mode:**
- Problem: App requires network for transcription/AI. If Dragon/Ollama goes down, can't record.
- Blocks: Mobile clinic visits with poor network
- Solution: Implement Web Speech API fallback more robustly. Add offline mode flag. Allow resuming on different device.

---

## Test Coverage Gaps

**No unit tests for suggestion engines:**
- What's not tested: `suggestICD10()`, `suggestCPT()`, `suggestMultiConditionCodes()` from codingEngine.js
- Files: `src/data/codingEngine.js`
- Risk: Code changes to suggestion logic could produce wrong diagnoses/codes without anyone knowing. Confidence levels are unvalidated.
- Priority: **High** — Wrong codes affect billing and clinical documentation

**No tests for voice extraction mapping:**
- What's not tested: `mapToInterviewData()` function that translates AI JSON to form data
- Files: `src/components/VoiceInterview.jsx` (lines 109-150)
- Risk: If question IDs in interviewData.js are renamed, mapping breaks silently. Medications might map to wrong fields.
- Priority: **High** — Wrong mappings corrupt interview data

**No tests for clinical scoring:**
- What's not tested: Rutherford, WIfI, CEAP, Wagner, NIHSS classification functions
- Files: `src/data/clinicalScoring.js`, `src/components/ClinicalScoring.jsx`
- Risk: Scoring is used clinically. Wrong score calculation could misclassify patient severity.
- Priority: **Critical** — Direct patient care impact

**No integration tests for interview → coding → note flow:**
- What's not tested: Full user journey: fill interview → code suggestions appear → copy note
- Files: Entire codebase
- Risk: Changes to data flow between components could break entire workflow without being caught
- Priority: **High** — Core feature

**No tests for voice mode fallback:**
- What's not tested: Dragon endpoint fails → switches to Web Speech API
- Files: `src/components/VoiceRecorder.jsx`
- Risk: Fallback logic is untested. If mode switch doesn't work, users get stuck
- Priority: **Medium** — Feature robustness

---

*Concerns audit: 2026-03-26*
