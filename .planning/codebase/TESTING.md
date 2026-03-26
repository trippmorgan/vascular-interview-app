# Testing Patterns

**Analysis Date:** 2026-03-26

## Test Framework

**Status:** Not implemented

No testing frameworks, assertion libraries, or test files detected in the project. Analysis includes:
- No test runner packages in `package.json` (checked for jest, vitest, mocha, testing-library)
- No test configuration files (`jest.config.js`, `vitest.config.ts`, `.mocharc.js`, etc.)
- No test files found in codebase (no `*.test.js`, `*.spec.js` files outside `node_modules`)
- No test scripts in `package.json` (only `dev`, `build`, `lint`, `preview`, `deploy`)

## Recommended Testing Setup

If testing were to be added, here's what would suit this codebase:

**Runner:** Vitest
- Modern, ESM-native (project uses `"type": "module"` in package.json)
- Excellent React component testing via React Testing Library
- Fast, drop-in Jest replacement

**Assertion Library:** Vitest built-in or Chai
- Vitest comes with built-in expect() compatible with Jest syntax

**React Testing:** React Testing Library
- Avoid testing implementation details (state/hooks directly)
- Test user interactions and rendered output

## Suggested Test File Organization

**Location:** Co-located with source files
- Pattern: `ComponentName.test.jsx` next to `ComponentName.jsx`
- Pattern: `utility.test.js` next to `utility.js`
- Directory structure:
  ```
  src/
  ├── components/
  │   ├── VoiceRecorder.jsx
  │   ├── VoiceRecorder.test.jsx
  │   ├── InterviewScreen.jsx
  │   ├── InterviewScreen.test.jsx
  │   └── ...
  ├── data/
  │   ├── clinicalScoring.js
  │   ├── clinicalScoring.test.js
  │   ├── codingEngine.js
  │   ├── codingEngine.test.js
  │   └── ...
  └── ...
  ```

**Naming:** `{Module}.test.jsx` or `{Module}.test.js`

## Unit Test Patterns for This Codebase

### Data/Utility Testing

Example test structure for `clinicalScoring.js` functions:

```javascript
import { describe, it, expect } from 'vitest';
import { RUTHERFORD, WIFI, ABI_INTERPRETATION, getScoringForType } from './clinicalScoring';

describe('RUTHERFORD', () => {
  it('classify should return category 0 for asymptomatic PAD', () => {
    const answers = {};
    expect(RUTHERFORD.classify(answers)).toBe(0);
  });

  it('classify should return category 4 (rest pain) when night_pain is true', () => {
    const answers = { night_pain: true };
    expect(RUTHERFORD.classify(answers)).toBe(4);
  });

  it('classify should return category 6 (major tissue loss) for gangrene above TM', () => {
    const answers = { gangrene_above_tm: true };
    expect(RUTHERFORD.classify(answers)).toBe(6);
  });
});

describe('ABI_INTERPRETATION', () => {
  it('interpret should return normal for ABI 1.0-1.3', () => {
    const result = ABI_INTERPRETATION.interpret(1.15);
    expect(result.interpretation).toBe('Normal');
    expect(result.severity).toBe('normal');
  });

  it('interpret should return critical for ABI < 0.3', () => {
    const result = ABI_INTERPRETATION.interpret(0.25);
    expect(result.severity).toBe('critical');
  });
});

describe('getScoringForType', () => {
  it('should return applicable systems for PAD patients', () => {
    const systems = getScoringForType('pad');
    expect(systems).toContainEqual(RUTHERFORD);
    expect(systems).toContainEqual(ABI_INTERPRETATION);
  });
});
```

### Component Testing

Example test structure for `VoiceRecorder.jsx`:

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import VoiceRecorder from './VoiceRecorder';

describe('VoiceRecorder', () => {
  const mockOnTranscription = vi.fn();

  beforeEach(() => {
    mockOnTranscription.mockClear();
    // Mock Web Speech API if needed
  });

  it('should render record button in compact mode', () => {
    render(<VoiceRecorder onTranscription={mockOnTranscription} compact={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should call onTranscription callback when recording completes', async () => {
    render(<VoiceRecorder onTranscription={mockOnTranscription} />);
    // Simulate start/stop recording interaction
    // Assert callback was called with transcribed text
  });

  it('should display error when microphone access denied', async () => {
    // Mock getUserMedia to throw permission error
    render(<VoiceRecorder onTranscription={mockOnTranscription} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/Mic denied/)).toBeInTheDocument();
    });
  });
});
```

Example test structure for `InterviewScreen.jsx`:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InterviewScreen from './InterviewScreen';

describe('InterviewScreen', () => {
  const mockOnBack = vi.fn();
  const defaultProps = {
    patientType: 'pad',
    selectedConditions: ['pad'],
    onBack: mockOnBack,
    interviewData: {},
    setInterviewData: vi.fn(),
  };

  it('should render interview tabs based on selected conditions', () => {
    render(<InterviewScreen {...defaultProps} />);
    expect(screen.getByText(/interview/i)).toBeInTheDocument();
  });

  it('should show back button and call onBack when clicked', () => {
    render(<InterviewScreen {...defaultProps} />);
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should deduplicate shared questions across conditions', () => {
    const props = { ...defaultProps, selectedConditions: ['pad', 'wound'] };
    render(<InterviewScreen {...props} />);
    // Assert smoking_history appears only once despite both conditions having it
  });
});
```

## Testing Data Structures

**What to Test:**
- Classification logic in `clinicalScoring.js` (RUTHERFORD.classify, WIFI.amputationRisk, etc.)
- Code suggestion logic in `codingEngine.js` (ICD-10 suggestions, CPT recommendations)
- Data validation: ensure question structures have required fields (id, text, type)
- Edge cases: null/undefined inputs, boundary values (ABI 0.3, distances in claudication)

**What NOT to Test:**
- Direct testing of component state hooks (test behavior instead)
- Implementation details of memoization (test outputs)
- Tailwind class application (test rendered output, not className strings)

## Mocking Patterns

**External APIs to Mock:**
- `navigator.mediaDevices.getUserMedia` (VoiceRecorder audio access)
- `window.SpeechRecognition` / `window.webkitSpeechRecognition` (Web Speech API)
- `fetch()` calls to Dragon transcription endpoints
- `navigator.clipboard.writeText()` (copy-to-clipboard operations)

**Example Vitest setup file:**

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
  },
});

// vitest.setup.js
import { vi } from 'vitest';

// Mock Web Speech API
global.SpeechRecognition = vi.fn(() => ({
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: vi.fn(),
};
```

## Fixtures and Factories

**Test Data Location:** Should create `src/__fixtures__/` or `src/data/__mocks__/`

**Example fixture for interview answers:**

```javascript
// src/__fixtures__/interviewAnswers.js
export const padPatientAnswers = {
  chief_complaint: 'Leg pain with walking',
  leg_pain_walking: { checked: true },
  walking_distance: { text: '100 ft' },
  pain_relief: { checked: true },
  smoking_current: { checked: true },
};

export const carotidPatientAnswers = {
  chief_complaint: 'Recent TIA',
  stroke_tia: { checked: true },
  right_carotid_stenosis: { value: '75%' },
};
```

**Factory pattern for component props:**

```javascript
// src/__fixtures__/factories.js
export function createInterviewScreenProps(overrides = {}) {
  return {
    patientType: 'pad',
    selectedConditions: ['pad'],
    onBack: vi.fn(),
    interviewData: {},
    setInterviewData: vi.fn(),
    ...overrides,
  };
}
```

## Coverage Gaps

**Untested Areas (High Priority):**
- `codingEngine.js`: ICD-10/CPT suggestion logic and RVU calculations — critical for coding accuracy
- `VoiceRecorder.jsx`: Fallback from Dragon to Web Speech API, endpoint retry logic
- `NoteGenerator.jsx`: Note formatting and field extraction from interview data
- `InterviewScreen.jsx`: Multi-condition deduplication, progress calculation
- `clinicalScoring.js`: All classification functions (Rutherford, WIfI, Wagner, etc.)

**Untested Areas (Medium Priority):**
- `ClinicalScoring.jsx`: Component rendering of scoring systems, manual override logic
- `CodingPanel.jsx`: Code selection, RVU display, copy-to-clipboard functionality
- `NoteEditor.jsx`: Markdown parsing and re-serialization

**Untested Areas (Low Priority):**
- UI components: QuestionSection, PhysicalExam (low failure risk — mostly UI rendering)
- LandingScreen, Summary, QuickReference (mostly display logic)

## Recommended Test Coverage Target

- **Unit tests:** clinicalScoring, codingEngine (aim for 80%+)
- **Component tests:** VoiceRecorder, InterviewScreen, CodingPanel (aim for 60%+)
- **Integration tests:** Full interview flow, note generation, code export (basic happy path)
- **E2E:** Not recommended for this app (Vite-based, no headless browser setup)

## Run Commands (If Testing Were Implemented)

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
npm run test -- VoiceRecorder  # Run tests for specific file
```

---

*Testing analysis: 2026-03-26*
