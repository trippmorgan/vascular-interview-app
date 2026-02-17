import { useState, useMemo } from 'react';
import { suggestICD10, suggestCPT, calculateRVU, ICD10_DATABASE, CPT_DATABASE } from '../data/codingEngine';

function CodingPanel({ patientType, interviewData }) {
  const [visitContext, setVisitContext] = useState({ newPatient: false });
  const [selectedICD10, setSelectedICD10] = useState(new Set());
  const [selectedCPT, setSelectedCPT] = useState(new Set());
  const [manualCode, setManualCode] = useState('');

  const icd10Suggestions = useMemo(
    () => suggestICD10(patientType, interviewData),
    [patientType, interviewData]
  );

  const cptSuggestions = useMemo(
    () => suggestCPT(patientType, interviewData, visitContext),
    [patientType, interviewData, visitContext]
  );

  const totalRVU = useMemo(
    () => calculateRVU([...selectedCPT]),
    [selectedCPT]
  );

  const toggleICD10 = (code) => {
    setSelectedICD10(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const toggleCPT = (code) => {
    setSelectedCPT(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const addManualCode = () => {
    const code = manualCode.trim().toUpperCase();
    if (!code) return;
    if (ICD10_DATABASE[code]) {
      setSelectedICD10(prev => new Set([...prev, code]));
    } else if (CPT_DATABASE[code]) {
      setSelectedCPT(prev => new Set([...prev, code]));
    }
    setManualCode('');
  };

  const confidenceColor = (c) => {
    if (c === 'high') return 'bg-green-100 text-green-800 border-green-300';
    if (c === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-600 border-gray-300';
  };

  const generateCodingSummary = () => {
    let text = 'CODING SUMMARY\n';
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;

    text += 'ICD-10 DIAGNOSES:\n';
    [...selectedICD10].forEach(code => {
      text += `  ${code} — ${ICD10_DATABASE[code]?.desc || 'Unknown'}\n`;
    });

    text += '\nCPT PROCEDURES:\n';
    [...selectedCPT].forEach(code => {
      text += `  ${code} — ${CPT_DATABASE[code]?.desc || 'Unknown'} (RVU: ${CPT_DATABASE[code]?.rvu || '?'})\n`;
    });

    text += `\nTOTAL RVU: ${totalRVU.toFixed(2)}\n`;
    return text;
  };

  const handleCopyCoding = () => {
    navigator.clipboard.writeText(generateCodingSummary()).then(() => {
      alert('Coding summary copied!');
    });
  };

  return (
    <div className="space-y-6">
      {/* Visit Context */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🏷️</span> Visit Context
        </h2>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visitContext.newPatient}
              onChange={(e) => setVisitContext({ ...visitContext, newPatient: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600"
            />
            <span className="text-base">New Patient</span>
          </label>
        </div>
      </div>

      {/* ICD-10 Suggestions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔍</span> ICD-10 Diagnosis Codes
          <span className="ml-auto text-sm font-normal text-gray-500">
            {selectedICD10.size} selected
          </span>
        </h2>

        {icd10Suggestions.length === 0 ? (
          <p className="text-gray-500 italic">Complete the interview to see code suggestions</p>
        ) : (
          <div className="space-y-2">
            {icd10Suggestions.map((s) => (
              <div
                key={s.code}
                onClick={() => toggleICD10(s.code)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedICD10.has(s.code)
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{s.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${confidenceColor(s.confidence)}`}>
                        {s.confidence}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{s.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">💡 {s.reason}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                    selectedICD10.has(s.code) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                  }`}>
                    {selectedICD10.has(s.code) && '✓'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CPT Suggestions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">💲</span> CPT Procedure Codes
          <span className="ml-auto text-sm font-normal text-gray-500">
            {selectedCPT.size} selected · {totalRVU.toFixed(2)} RVU
          </span>
        </h2>

        {cptSuggestions.length === 0 ? (
          <p className="text-gray-500 italic">Complete the interview to see code suggestions</p>
        ) : (
          <div className="space-y-2">
            {cptSuggestions.map((s) => (
              <div
                key={s.code}
                onClick={() => toggleCPT(s.code)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedCPT.has(s.code)
                    ? 'bg-green-50 border-green-400 ring-2 ring-green-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-green-700">{s.code}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        RVU: {s.rvu}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${confidenceColor(s.confidence)}`}>
                        {s.confidence}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{s.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">💡 {s.reason}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                    selectedCPT.has(s.code) ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'
                  }`}>
                    {selectedCPT.has(s.code) && '✓'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Code Entry */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Add Code Manually</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addManualCode()}
            placeholder="Enter ICD-10 or CPT code..."
            className="flex-1 p-3 border border-gray-300 rounded-lg text-base font-mono"
          />
          <button onClick={addManualCode} className="btn-primary px-6">
            Add
          </button>
        </div>
      </div>

      {/* RVU Summary */}
      {selectedCPT.size > 0 && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Total RVU</h3>
              <p className="text-sm text-gray-500">{selectedCPT.size} procedures selected</p>
            </div>
            <div className="text-4xl font-bold text-green-700">
              {totalRVU.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="card">
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCopyCoding}
            disabled={selectedICD10.size === 0 && selectedCPT.size === 0}
            className={`btn-primary flex items-center gap-2 ${
              (selectedICD10.size === 0 && selectedCPT.size === 0) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            📋 Copy Coding Summary
          </button>
        </div>
      </div>
    </div>
  );
}

export default CodingPanel;
