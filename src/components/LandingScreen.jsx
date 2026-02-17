import { patientTypes } from '../data/interviewData';

function LandingScreen({ onSelectPatientType }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Vascular Surgery
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-2">
            Clinical Interview Guide
          </h2>
          <p className="text-gray-600 text-lg">
            Based on 275 patient encounters
          </p>
        </div>

        {/* Patient Type Selection */}
        <div className="card max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Select Patient Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onSelectPatientType(type.id)}
                className="flex items-center justify-start p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md min-h-[88px] text-left"
              >
                <span className="text-4xl mr-4">{type.icon}</span>
                <span className="text-lg font-medium text-gray-800">
                  {type.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* PLAUD AI Link */}
        <div className="text-center mt-8">
          <a
            href="https://app.plaud.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-lg"
          >
            🎙️ Open PLAUD AI
          </a>
          <p className="text-gray-500 text-sm mt-2">Start recording before entering the room</p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Professional medical interview tool for clinical staff</p>
          <p className="mt-1">iPad optimized • Works offline</p>
        </div>
      </div>
    </div>
  );
}

export default LandingScreen;
