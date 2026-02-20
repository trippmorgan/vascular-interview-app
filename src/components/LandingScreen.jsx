import { useState } from 'react';
import { patientTypes } from '../data/interviewData';

const conditionColors = {
  pad: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800', chip: 'bg-red-500' },
  venous: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800', chip: 'bg-purple-500' },
  carotid: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800', chip: 'bg-blue-500' },
  wound: { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800', chip: 'bg-orange-500' },
  dialysis: { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-800', chip: 'bg-teal-500' },
  aaa: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800', chip: 'bg-green-500' },
  dvt: { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-800', chip: 'bg-pink-500' },
};

const commonCombos = [
  { label: 'PAD + Wound', conditions: ['pad', 'wound'] },
  { label: 'Venous + DVT', conditions: ['venous', 'dvt'] },
  { label: 'Carotid + AAA', conditions: ['carotid', 'aaa'] },
  { label: 'PAD + Carotid + AAA', conditions: ['pad', 'carotid', 'aaa'] },
];

function LandingScreen({ onStartInterview }) {
  const [selected, setSelected] = useState([]);

  const toggleCondition = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const applyCombo = (conditions) => {
    setSelected(conditions);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
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

        {/* Selected Conditions Chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {selected.map(id => {
              const type = patientTypes.find(t => t.id === id);
              const colors = conditionColors[id] || {};
              return (
                <span
                  key={id}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium text-sm ${colors.chip || 'bg-gray-500'}`}
                >
                  {type?.icon} {type?.name?.split('(')[0]?.trim() || type?.name}
                  <button
                    onClick={() => toggleCondition(id)}
                    className="ml-1 hover:bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Patient Type Selection */}
        <div className="card max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Select Patient Conditions
          </h3>
          <p className="text-gray-500 text-center mb-6 text-sm">
            Select one or more conditions — tap to toggle
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientTypes.map((type) => {
              const isSelected = selected.includes(type.id);
              const colors = conditionColors[type.id] || {};
              return (
                <button
                  key={type.id}
                  onClick={() => toggleCondition(type.id)}
                  className={`flex items-center justify-start p-6 border-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md min-h-[88px] text-left ${
                    isSelected
                      ? `${colors.bg} ${colors.border} ${colors.text} ring-2 ring-offset-1 ring-blue-400`
                      : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <span className="text-4xl mr-4">{type.icon}</span>
                  <span className={`text-lg font-medium ${isSelected ? colors.text : 'text-gray-800'}`}>
                    {type.name}
                  </span>
                  {isSelected && (
                    <span className="ml-auto text-2xl">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Common Combos */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3 text-center">Common combinations:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {commonCombos.map((combo) => (
                <button
                  key={combo.label}
                  onClick={() => applyCombo(combo.conditions)}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm font-medium transition-colors"
                >
                  {combo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => onStartInterview(selected)}
              disabled={selected.length === 0}
              className={`px-8 py-4 rounded-xl font-bold text-xl transition-all duration-200 shadow-md ${
                selected.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selected.length === 0
                ? 'Select at least one condition'
                : `Start Interview (${selected.length} condition${selected.length > 1 ? 's' : ''})`}
            </button>
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
