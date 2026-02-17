import { quickReference } from '../data/interviewData';

function QuickReference({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-900 text-white p-6 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold">Quick Reference</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Clinical Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Carotid */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-blue-900 mb-3">{quickReference.carotidThresholds.title}</h3>
              <div className="space-y-2">
                {quickReference.carotidThresholds.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.label}:</span>
                    <span className="text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PAD */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-blue-900 mb-3">{quickReference.padThresholds.title}</h3>
              <div className="space-y-2">
                {quickReference.padThresholds.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.label}:</span>
                    <span className="text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AAA */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-blue-900 mb-3">{quickReference.aaaThresholds.title}</h3>
              <div className="space-y-2">
                {quickReference.aaaThresholds.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.label}:</span>
                    <span className="text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Venous */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-blue-900 mb-3">{quickReference.venousThresholds.title}</h3>
              <div className="space-y-2">
                {quickReference.venousThresholds.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.label}:</span>
                    <span className="text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The Big Five */}
          <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
            <h3 className="text-xl font-bold text-green-900 mb-3">{quickReference.bigFive.title}</h3>
            <div className="space-y-2">
              {quickReference.bigFive.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="font-semibold text-gray-800">{item.label}:</span>
                  <span className="text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags */}
          <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50">
            <h3 className="text-xl font-bold text-red-900 mb-3">{quickReference.redFlags.title}</h3>
            <ul className="space-y-2">
              {quickReference.redFlags.items.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-red-600 mr-2 font-bold">⚠️</span>
                  <span className="text-gray-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient Education */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-xl font-bold text-blue-900 mb-3">{quickReference.patientEducation.title}</h3>
            <div className="space-y-3">
              {quickReference.patientEducation.items.map((item, idx) => (
                <div key={idx} className="border-l-4 border-blue-300 pl-4">
                  <p className="font-semibold text-gray-800">{item.term}</p>
                  <p className="text-gray-600 text-sm italic">"{item.explanation}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickReference;
