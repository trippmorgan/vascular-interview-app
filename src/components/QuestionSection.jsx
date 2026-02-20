// QuestionSection.jsx — handles checkbox, text, yesno, select, multiselect question types

function QuestionField({ question, value, onChange }) {
  const data = value || {};

  switch (question.type) {
    // ── Big toggle switch ──────────────────────────────────────────────────────
    case 'checkbox':
      return (
        <div className="flex items-center gap-4">
          <button
            onClick={() => onChange('checked', !data.checked)}
            className={`relative inline-flex h-8 w-16 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              data.checked ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={!!data.checked}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                data.checked ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
          <span
            className={`text-lg font-bold select-none ${data.checked ? 'text-blue-700' : 'text-gray-400'}`}
          >
            {data.checked ? 'YES' : 'NO'}
          </span>
        </div>
      );

    // ── YES / NO big tap buttons ───────────────────────────────────────────────
    case 'yesno':
      return (
        <div className="flex gap-3">
          <button
            onClick={() => onChange('value', data.value === 'yes' ? null : 'yes')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all min-h-[56px] ${
              data.value === 'yes'
                ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-400 ring-offset-1'
                : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
            }`}
          >
            ✓ YES
          </button>
          <button
            onClick={() => onChange('value', data.value === 'no' ? null : 'no')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all min-h-[56px] ${
              data.value === 'no'
                ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-400 ring-offset-1'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            ✗ NO
          </button>
        </div>
      );

    // ── Single-select radio-style list ────────────────────────────────────────
    case 'select':
      return (
        <div className="space-y-2">
          {(question.options || []).map((option) => {
            const selected = data.value === option;
            return (
              <button
                key={option}
                onClick={() => onChange('value', selected ? null : option)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all min-h-[52px] font-medium flex items-center gap-3 ${
                  selected
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <span
                  className={`w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selected ? 'border-blue-500 bg-blue-500' : 'border-gray-400 bg-white'
                  }`}
                >
                  {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      );

    // ── Multi-select checkbox list ────────────────────────────────────────────
    case 'multiselect': {
      const selectedValues = data.values || [];
      return (
        <div className="space-y-2">
          {(question.options || []).map((option) => {
            const isSelected = selectedValues.includes(option);
            return (
              <button
                key={option}
                onClick={() => {
                  const newValues = isSelected
                    ? selectedValues.filter((v) => v !== option)
                    : [...selectedValues, option];
                  onChange('values', newValues);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all min-h-[52px] font-medium flex items-center gap-3 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <span
                  className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400 bg-white'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      );
    }

    // ── Plain textarea ─────────────────────────────────────────────────────────
    case 'text':
    default:
      return (
        <textarea
          value={data.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          placeholder={question.placeholder || 'Notes...'}
          className="input-field text-base resize-none w-full"
          rows={2}
        />
      );
  }
}

function QuestionSection({ sectionId, title, questions, interviewData, onQuestionChange, expanded, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header — large tap target for mobile */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[56px]"
      >
        <h3 className="text-base md:text-lg font-semibold text-gray-800 text-left">{title}</h3>
        <svg
          className={`w-7 h-7 text-gray-600 transition-transform flex-shrink-0 ml-2 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Questions */}
      {expanded && (
        <div className="p-4 space-y-5 bg-white">
          {questions.map((question) => (
            <div key={question.id} className="border-l-4 border-blue-300 pl-4 py-2">
              <p className="text-gray-800 font-semibold mb-3 text-base leading-snug">
                {question.text}
              </p>
              <QuestionField
                question={question}
                value={interviewData[question.id]}
                onChange={(key, val) => onQuestionChange(question.id, key, val)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuestionSection;
