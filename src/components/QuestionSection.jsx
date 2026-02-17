function QuestionSection({ sectionId, title, questions, interviewData, onQuestionChange, expanded, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors min-h-[60px]"
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <svg
          className={`w-6 h-6 text-gray-600 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Questions */}
      {expanded && (
        <div className="p-4 space-y-4 bg-white">
          {questions.map((question) => (
            <div key={question.id} className="border-l-4 border-blue-300 pl-4 py-2">
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  id={question.id}
                  checked={interviewData[question.id]?.checked || false}
                  onChange={(e) => onQuestionChange(question.id, 'checked', e.target.checked)}
                  className="checkbox-large mt-1 cursor-pointer"
                />
                
                {/* Question Text */}
                <label htmlFor={question.id} className="flex-1 cursor-pointer">
                  <p className="text-gray-800 font-medium mb-2">{question.text}</p>
                  
                  {/* Notes Field */}
                  <textarea
                    value={interviewData[question.id]?.text || ''}
                    onChange={(e) => onQuestionChange(question.id, 'text', e.target.value)}
                    placeholder="Notes..."
                    className="input-field text-sm resize-none"
                    rows="2"
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuestionSection;
