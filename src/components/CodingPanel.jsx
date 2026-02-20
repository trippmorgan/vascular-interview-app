import { useState, useMemo, useCallback } from 'react';
import {
  suggestMultiConditionCodes,
  calculateRVU,
  ICD10_DATABASE,
  CPT_DATABASE,
} from '../data/codingEngine';

const CONDITION_COLORS = {
  pad:      { bg: 'bg-red-50',    border: 'border-red-300',    badge: 'bg-red-100 text-red-800' },
  venous:   { bg: 'bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-800' },
  carotid:  { bg: 'bg-blue-50',   border: 'border-blue-300',   badge: 'bg-blue-100 text-blue-800' },
  wound:    { bg: 'bg-orange-50', border: 'border-orange-300',  badge: 'bg-orange-100 text-orange-800' },
  dialysis: { bg: 'bg-teal-50',   border: 'border-teal-300',   badge: 'bg-teal-100 text-teal-800' },
  aaa:      { bg: 'bg-pink-50',   border: 'border-pink-300',   badge: 'bg-pink-100 text-pink-800' },
  dvt:      { bg: 'bg-indigo-50', border: 'border-indigo-300', badge: 'bg-indigo-100 text-indigo-800' },
  _em:      { bg: 'bg-gray-50',   border: 'border-gray-300',   badge: 'bg-gray-100 text-gray-800' },
  comorbidity: { bg: 'bg-yellow-50', border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-800' },
};

const confidenceColor = (c) => {
  if (c === 'high') return 'bg-green-100 text-green-800 border-green-300';
  if (c === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-red-100 text-red-700 border-red-300';
};

function CodingPanel({ patientType, patientTypes: conditionTypes = [patientType], interviewData }) {
  const [visitContext, setVisitContext] = useState({ newPatient: false });
  const [selectedICD10, setSelectedICD10] = useState(new Set());
  const [selectedCPT, setSelectedCPT] = useState(new Set());
  const [manualCode, setManualCode] = useState('');
  const [manualCodes, setManualCodes] = useState([]); // { code, type: 'icd10'|'cpt' }
  const [copied, setCopied] = useState(false);

  const multiResult = useMemo(
    () => suggestMultiConditionCodes(conditionTypes, interviewData, visitContext),
    [conditionTypes, interviewData, visitContext]
  );

  const totalRVU = useMemo(
    () => calculateRVU([...selectedCPT]),
    [selectedCPT]
  );

  const toggleICD10 = useCallback((code) => {
    setSelectedICD10(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  }, []);

  const toggleCPT = useCallback((code) => {
    setSelectedCPT(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  }, []);

  const selectAllICD10 = () => setSelectedICD10(new Set(multiResult.icd10.map(s => s.code)));
  const selectAllCPT = () => setSelectedCPT(new Set(multiResult.cpt.map(s => s.code)));
  const clearAllICD10 = () => setSelectedICD10(new Set());
  const clearAllCPT = () => setSelectedCPT(new Set());

  const addManualCode = () => {
    const code = manualCode.trim().toUpperCase();
    if (!code) return;
    if (ICD10_DATABASE[code]) {
      setSelectedICD10(prev => new Set([...prev, code]));
      setManualCodes(prev => [...prev, { code, type: 'icd10', desc: ICD10_DATABASE[code].desc }]);
    } else if (CPT_DATABASE[code]) {
      setSelectedCPT(prev => new Set([...prev, code]));
      setManualCodes(prev => [...prev, { code, type: 'cpt', desc: CPT_DATABASE[code].desc }]);
    } else {
      // Allow unknown codes with manual entry
      setManualCodes(prev => [...prev, { code, type: 'unknown', desc: 'Manually entered' }]);
      setSelectedICD10(prev => new Set([...prev, code]));
    }
    setManualCode('');
  };

  const removeManualCode = (code) => {
    setManualCodes(prev => prev.filter(m => m.code !== code));
    setSelectedICD10(prev => { const n = new Set(prev); n.delete(code); return n; });
    setSelectedCPT(prev => { const n = new Set(prev); n.delete(code); return n; });
  };

  const generateCodingSummary = () => {
    const lines = [];
    lines.push('═══════════════════════════════════════');
    lines.push('  CODING SUMMARY');
    lines.push(`  Date: ${new Date().toLocaleDateString()}`);
    lines.push(`  Conditions: ${conditionTypes.join(', ').toUpperCase()}`);
    lines.push('═══════════════════════════════════════');
    lines.push('');

    lines.push('ICD-10 DIAGNOSES:');
    [...selectedICD10].forEach(code => {
      const desc = ICD10_DATABASE[code]?.desc || manualCodes.find(m => m.code === code)?.desc || 'Unknown';
      lines.push(`  ${code}  ${desc}`);
    });
    lines.push('');

    lines.push('CPT PROCEDURES:');
    [...selectedCPT].forEach(code => {
      const info = CPT_DATABASE[code];
      lines.push(`  ${code}  ${info?.desc || 'Unknown'}${info?.rvu ? ` (RVU: ${info.rvu})` : ''}`);
    });
    lines.push('');

    if (manualCodes.length > 0) {
      const extraManual = manualCodes.filter(m => !selectedICD10.has(m.code) && !selectedCPT.has(m.code));
      if (extraManual.length > 0) {
        lines.push('ADDITIONAL MANUAL CODES:');
        extraManual.forEach(m => lines.push(`  ${m.code}  ${m.desc}`));
        lines.push('');
      }
    }

    lines.push(`TOTAL RVU: ${totalRVU.toFixed(2)}`);
    lines.push('═══════════════════════════════════════');
    return lines.join('\n');
  };

  const handleCopyCoding = async () => {
    try {
      await navigator.clipboard.writeText(generateCodingSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = generateCodingSummary();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Group ICD-10 by condition
  const icd10Groups = useMemo(() => {
    const groups = {};
    for (const s of multiResult.icd10) {
      const key = s.conditionType || 'other';
      if (!groups[key]) groups[key] = { label: s.conditionLabel || key, items: [] };
      groups[key].items.push(s);
    }
    return groups;
  }, [multiResult.icd10]);

  // Group CPT by condition
  const cptGroups = useMemo(() => {
    const groups = {};
    for (const s of multiResult.cpt) {
      const key = s.conditionType || 'other';
      if (!groups[key]) groups[key] = { label: s.conditionLabel || key, items: [] };
      groups[key].items.push(s);
    }
    return groups;
  }, [multiResult.cpt]);

  // Tailwind can't detect dynamic class names — use explicit mappings
  const CodeCard = ({ s, isSelected, onToggle, type = 'icd10' }) => {
    const colors = CONDITION_COLORS[s.conditionType] || CONDITION_COLORS._em;
    const isICD = type === 'icd10';
    return (
      <div
        onClick={() => onToggle(s.code)}
        className={`p-3 rounded-lg border cursor-pointer transition-all active:scale-[0.98] ${
          isSelected
            ? isICD
              ? `${colors.bg} ${colors.border} ring-2 ring-blue-200`
              : `${colors.bg} ${colors.border} ring-2 ring-green-200`
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-mono font-bold text-base ${isICD ? 'text-blue-700' : 'text-green-700'}`}>{s.code}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${confidenceColor(s.confidence)}`}>
                {s.confidence}
              </span>
              {s.rvu != null && s.rvu > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  RVU: {s.rvu}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-1 leading-snug">{s.description}</p>
            <p className="text-xs text-gray-400 mt-0.5">💡 {s.reason}</p>
          </div>
          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 transition-colors ${
            isSelected
              ? isICD ? 'bg-blue-600 border-blue-600 text-white' : 'bg-green-600 border-green-600 text-white'
              : 'border-gray-300'
          }`}>
            {isSelected && '✓'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Multi-condition badge bar */}
      {conditionTypes.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-600">Conditions:</span>
          {conditionTypes.map(ct => {
            const colors = CONDITION_COLORS[ct] || CONDITION_COLORS._em;
            return (
              <span key={ct} className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.badge}`}>
                {ct.toUpperCase()}
              </span>
            );
          })}
        </div>
      )}

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
          {multiResult.emLevel && (
            <div className="ml-auto text-right">
              <span className="text-sm text-gray-500">Suggested E&M: </span>
              <span className="font-mono font-bold text-lg text-blue-700">{multiResult.emLevel.code}</span>
              <p className="text-xs text-gray-400">{multiResult.emLevel.reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* ICD-10 Suggestions — grouped by condition */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">🔍</span> ICD-10 Diagnosis Codes
            <span className="ml-3 text-sm font-normal text-gray-500">
              {selectedICD10.size} selected
            </span>
          </h2>
          <div className="flex gap-2">
            <button onClick={selectAllICD10} className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1">
              Select All
            </button>
            <button onClick={clearAllICD10} className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1">
              Clear
            </button>
          </div>
        </div>

        {multiResult.icd10.length === 0 ? (
          <p className="text-gray-500 italic">Complete the interview to see code suggestions</p>
        ) : (
          <div className="space-y-5">
            {Object.entries(icd10Groups).map(([groupKey, group]) => {
              const colors = CONDITION_COLORS[groupKey] || CONDITION_COLORS._em;
              return (
                <div key={groupKey}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="space-y-2">
                    {group.items.map((s) => (
                      <CodeCard
                        key={s.code}
                        s={s}
                        isSelected={selectedICD10.has(s.code)}
                        onToggle={toggleICD10}
                        accentColor="blue"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CPT Suggestions — grouped by condition */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">💲</span> CPT Procedure Codes
            <span className="ml-3 text-sm font-normal text-gray-500">
              {selectedCPT.size} selected · {totalRVU.toFixed(2)} RVU
            </span>
          </h2>
          <div className="flex gap-2">
            <button onClick={selectAllCPT} className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1">
              Select All
            </button>
            <button onClick={clearAllCPT} className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1">
              Clear
            </button>
          </div>
        </div>

        {multiResult.cpt.length === 0 ? (
          <p className="text-gray-500 italic">Complete the interview to see code suggestions</p>
        ) : (
          <div className="space-y-5">
            {Object.entries(cptGroups).map(([groupKey, group]) => {
              const colors = CONDITION_COLORS[groupKey] || CONDITION_COLORS._em;
              return (
                <div key={groupKey}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="space-y-2">
                    {group.items.map((s) => (
                      <CodeCard
                        key={s.code}
                        s={s}
                        isSelected={selectedCPT.has(s.code)}
                        onToggle={toggleCPT}
                        accentColor="green"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
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
            className="flex-1 p-3 border border-gray-300 rounded-lg text-base font-mono focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
          />
          <button onClick={addManualCode} className="btn-primary px-6 min-h-[48px]">
            Add
          </button>
        </div>
        {manualCodes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {manualCodes.map(m => (
              <span key={m.code} className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm font-mono">
                {m.code}
                <button onClick={() => removeManualCode(m.code)} className="text-gray-400 hover:text-red-500 ml-1">✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* RVU Summary */}
      {selectedCPT.size > 0 && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Total RVU</h3>
              <p className="text-sm text-gray-500">{selectedCPT.size} procedure{selectedCPT.size !== 1 ? 's' : ''} selected</p>
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
            className={`btn-primary flex items-center gap-2 min-h-[48px] px-8 text-base ${
              (selectedICD10.size === 0 && selectedCPT.size === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {copied ? '✅ Copied!' : '📋 Copy Coding Summary'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CodingPanel;
