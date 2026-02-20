import { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';

const OLLAMA_URLS = [
  'http://10.66.19.163:8888/api/chat',          // Office proxy (Precision)
  'http://100.101.184.20:11434/v1/chat/completions',  // Direct Voldemort (Tailscale)
  'http://192.168.0.125:11434/v1/chat/completions',   // Direct Voldemort (home LAN)
];

const EXTRACTION_PROMPT = `You are a medical scribe AI. Extract structured clinical data from this dictated patient interview transcript. Return ONLY valid JSON with the following structure. Use empty strings for missing data, not null.

{
  "chief_complaint": "",
  "hpi": "",
  "symptoms": [],
  "duration": "",
  "severity": "",
  "past_medical_history": [],
  "past_surgical_history": [],
  "medications": [],
  "allergies": [],
  "social_history": {
    "smoking_status": "",
    "smoking_details": "",
    "alcohol": "",
    "drugs": ""
  },
  "physical_exam": {},
  "cardiovascular": {
    "heart_attack": false,
    "heart_stents": false,
    "stroke_tia": false,
    "dvt_history": false,
    "hypertension": false,
    "high_cholesterol": false,
    "cad_notes": ""
  },
  "diabetes": {
    "has_diabetes": false,
    "a1c": "",
    "management": ""
  },
  "walking": {
    "has_leg_pain_walking": false,
    "distance": "",
    "pain_location": [],
    "relieved_by_rest": false
  }
}`;

function VoiceInterview({ onAutoFill, onClose, patientType, selectedConditions = [] }) {
  const [transcription, setTranscription] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('record');
  const [minimized, setMinimized] = useState(false);

  const conditions = selectedConditions.length > 0 ? selectedConditions : (patientType ? [patientType] : []);
  const conditionLabel = conditions.map(c => c.toUpperCase()).join(', ');

  const handleTranscription = (text) => {
    setTranscription(text);
    setStep('review');
  };

  const extractClinicalData = async () => {
    setIsExtracting(true);
    setError(null);

    const conditionContext = conditions.length > 0
      ? `This patient has: ${conditionLabel}. Extract findings relevant to all conditions.`
      : '';

    let lastErr = null;
    for (const url of OLLAMA_URLS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3:8b',
            messages: [
              { role: 'system', content: EXTRACTION_PROMPT },
              { role: 'user', content: `${conditionContext}\n\nExtract clinical data from this transcript:\n\n${transcription}` }
            ],
            temperature: 0.1,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        const parsed = JSON.parse(jsonMatch[1].trim());
        setExtractedData(parsed);
        setStep('extracted');
        setIsExtracting(false);
        return;
      } catch (err) { lastErr = err; }
    }
    setError(`AI extraction failed: ${lastErr?.message}. Connect to home network.`);
    setIsExtracting(false);
  };

  const mapToInterviewData = () => {
    if (!extractedData) return;
    const mapped = {};

    if (extractedData.chief_complaint) mapped.chief_complaint = { text: extractedData.chief_complaint };
    if (extractedData.hpi) mapped.presenting_symptoms = { text: extractedData.hpi };

    const cv = extractedData.cardiovascular || {};
    if (cv.heart_attack) mapped.heart_attack = { checked: true };
    if (cv.heart_stents) mapped.heart_stents = { checked: true };
    if (cv.stroke_tia) mapped.stroke_tia = { checked: true };
    if (cv.dvt_history) mapped.dvt_history = { checked: true };
    if (cv.hypertension) mapped.hypertension = { checked: true };
    if (cv.high_cholesterol) mapped.high_cholesterol = { checked: true };
    if (cv.cad_notes) mapped.cad = { text: cv.cad_notes };

    const dm = extractedData.diabetes || {};
    if (dm.has_diabetes) mapped.diabetes = { checked: true };
    if (dm.a1c) mapped.diabetes_a1c = { text: dm.a1c };
    if (dm.management) {
      const m = dm.management.toLowerCase();
      if (m.includes('insulin') && m.includes('oral')) mapped.diabetes_insulin = { value: 'Insulin + oral medications' };
      else if (m.includes('insulin')) mapped.diabetes_insulin = { value: 'Insulin only' };
      else if (m.includes('oral') || m.includes('pill')) mapped.diabetes_insulin = { value: 'Oral medications only' };
      else if (m.includes('diet')) mapped.diabetes_insulin = { value: 'Diet controlled' };
    }

    const sh = extractedData.social_history || {};
    if (sh.smoking_status?.toLowerCase().includes('current')) { mapped.smoking_current = { checked: true }; mapped.smoking_history = { checked: true }; }
    else if (sh.smoking_status?.toLowerCase().includes('former') || sh.smoking_status?.toLowerCase().includes('quit')) { mapped.smoking_history = { checked: true }; }
    if (sh.smoking_details) mapped.smoking_details = { text: sh.smoking_details };

    if (extractedData.medications?.length > 0) {
      mapped.all_medications = { text: extractedData.medications.join(', ') };
      const meds = extractedData.medications.map(m => m.toLowerCase());
      if (meds.some(m => m.includes('aspirin'))) mapped.aspirin = { checked: true };
      if (meds.some(m => m.includes('plavix') || m.includes('clopidogrel'))) mapped.plavix = { checked: true };
      if (meds.some(m => m.includes('statin') || m.includes('atorvastatin') || m.includes('rosuvastatin'))) mapped.statins = { checked: true };
      const acMeds = { 'coumadin': 'Coumadin (Warfarin)', 'warfarin': 'Coumadin (Warfarin)', 'eliquis': 'Eliquis (Apixaban)', 'apixaban': 'Eliquis (Apixaban)', 'xarelto': 'Xarelto (Rivaroxaban)', 'rivaroxaban': 'Xarelto (Rivaroxaban)' };
      for (const med of meds) { for (const [key, val] of Object.entries(acMeds)) { if (med.includes(key)) mapped.anticoagulation = { value: val }; } }
    }

    if (extractedData.allergies?.length > 0) mapped.allergies = { text: extractedData.allergies.join(', ') };

    const w = extractedData.walking || {};
    if (w.has_leg_pain_walking) mapped.leg_pain_walking = { checked: true };
    if (w.distance) mapped.walking_distance = { text: w.distance };
    if (w.pain_location?.length > 0) mapped.pain_location = { values: w.pain_location };
    if (w.relieved_by_rest) mapped.pain_relief = { checked: true };

    onAutoFill(mapped);
  };

  // Minimized floating pill
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-900 text-white rounded-full shadow-xl hover:bg-blue-800 transition-all min-h-[48px]"
        >
          <span className="text-lg">🎙️</span>
          <span className="font-medium text-sm">
            {step === 'record' && 'Voice Interview'}
            {step === 'review' && '📝 Review Ready'}
            {step === 'extracted' && '✅ Data Extracted'}
          </span>
          {isExtracting && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
        </button>
        <button onClick={onClose} className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-600">✕</button>
      </div>
    );
  }

  // Bottom sheet (not blocking — slides up from bottom)
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
      <div className="bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 max-h-[70vh] overflow-y-auto">
        {/* Handle bar + Header */}
        <div className="sticky top-0 bg-blue-900 text-white rounded-t-2xl">
          <div className="flex justify-center pt-2"><div className="w-10 h-1 bg-white/30 rounded-full" /></div>
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-lg font-bold flex items-center gap-2">🎙️ Voice Interview</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setMinimized(true)} className="p-2 hover:bg-blue-800 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-sm">▼ Min</button>
              <button onClick={onClose} className="p-2 hover:bg-blue-800 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">✕</button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Steps */}
          <div className="flex items-center justify-center gap-2 text-xs">
            {['Record', 'Review', 'Extract'].map((s, i) => {
              const stepIdx = ['record', 'review', 'extracted'].indexOf(step);
              return (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    i === stepIdx ? 'bg-blue-600 text-white' : i < stepIdx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>{i < stepIdx ? '✓' : i + 1}</div>
                  <span className="font-medium text-gray-600">{s}</span>
                  {i < 2 && <div className="w-6 h-0.5 bg-gray-300" />}
                </div>
              );
            })}
          </div>

          {/* Record */}
          {step === 'record' && (
            <div className="text-center space-y-3">
              <p className="text-gray-500 text-sm">Dictate the patient interview naturally</p>
              <VoiceRecorder onTranscription={handleTranscription} />
            </div>
          )}

          {/* Review */}
          {step === 'review' && (
            <div className="space-y-3">
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500"
                placeholder="Transcription will appear here..."
              />
              <div className="flex gap-2">
                <button onClick={() => { setTranscription(''); setStep('record'); }} className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium text-sm">🔄 Re-record</button>
                <button
                  onClick={extractClinicalData}
                  disabled={isExtracting || !transcription.trim()}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm text-white ${isExtracting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isExtracting ? '⏳ Extracting...' : '🧠 Extract Data'}
                </button>
              </div>
            </div>
          )}

          {/* Extracted */}
          {step === 'extracted' && extractedData && (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg border p-3 space-y-2 max-h-48 overflow-y-auto text-xs">
                {extractedData.chief_complaint && <div><b className="text-blue-800">CC:</b> {extractedData.chief_complaint}</div>}
                {extractedData.hpi && <div><b className="text-blue-800">HPI:</b> {extractedData.hpi}</div>}
                {extractedData.past_medical_history?.length > 0 && <div><b className="text-blue-800">PMH:</b> {extractedData.past_medical_history.join(', ')}</div>}
                {extractedData.medications?.length > 0 && <div><b className="text-blue-800">Meds:</b> {extractedData.medications.join(', ')}</div>}
                {extractedData.allergies?.length > 0 && <div><b className="text-blue-800">Allergies:</b> {extractedData.allergies.join(', ')}</div>}
                {extractedData.social_history?.smoking_status && <div><b className="text-blue-800">Smoking:</b> {extractedData.social_history.smoking_status}</div>}
                {extractedData.cardiovascular && <div><b className="text-blue-800">CV:</b> {Object.entries(extractedData.cardiovascular).filter(([,v]) => v === true).map(([k]) => k.replace(/_/g, ' ')).join(', ') || 'None'}</div>}
                {extractedData.diabetes?.has_diabetes && <div><b className="text-blue-800">DM:</b> A1C {extractedData.diabetes.a1c || '?'}, {extractedData.diabetes.management || '?'}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('review')} className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium text-sm">← Back</button>
                <button onClick={() => { mapToInterviewData(); onClose(); }} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm">✅ Auto-Fill</button>
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">{error}</div>}
        </div>
      </div>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default VoiceInterview;
