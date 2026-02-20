import { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';

const OLLAMA_URL = 'http://100.101.184.20:11434/v1/chat/completions';

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

function VoiceInterview({ onAutoFill, onClose, patientType }) {
  const [transcription, setTranscription] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('record'); // record | review | extracted

  const handleTranscription = async (text) => {
    setTranscription(text);
    setStep('review');
  };

  const extractClinicalData = async () => {
    setIsExtracting(true);
    setError(null);

    try {
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3:8b',
          messages: [
            { role: 'system', content: EXTRACTION_PROMPT },
            { role: 'user', content: `Extract clinical data from this transcript:\n\n${transcription}` }
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Parse JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const parsed = JSON.parse(jsonMatch[1].trim());
      setExtractedData(parsed);
      setStep('extracted');
    } catch (err) {
      setError(`AI extraction failed: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const mapToInterviewData = () => {
    if (!extractedData) return;

    const mapped = {};

    // Chief complaint
    if (extractedData.chief_complaint) {
      mapped.chief_complaint = { text: extractedData.chief_complaint };
    }
    if (extractedData.hpi) {
      mapped.presenting_symptoms = { text: extractedData.hpi };
    }

    // Cardiovascular
    const cv = extractedData.cardiovascular || {};
    if (cv.heart_attack) mapped.heart_attack = { checked: true };
    if (cv.heart_stents) mapped.heart_stents = { checked: true };
    if (cv.stroke_tia) mapped.stroke_tia = { checked: true };
    if (cv.dvt_history) mapped.dvt_history = { checked: true };
    if (cv.hypertension) mapped.hypertension = { checked: true };
    if (cv.high_cholesterol) mapped.high_cholesterol = { checked: true };
    if (cv.cad_notes) mapped.cad = { text: cv.cad_notes };

    // Diabetes
    const dm = extractedData.diabetes || {};
    if (dm.has_diabetes) mapped.diabetes = { checked: true };
    if (dm.a1c) mapped.diabetes_a1c = { text: dm.a1c };
    if (dm.management) {
      const mgmt = dm.management.toLowerCase();
      if (mgmt.includes('insulin') && mgmt.includes('oral')) mapped.diabetes_insulin = { value: 'Insulin + oral medications' };
      else if (mgmt.includes('insulin')) mapped.diabetes_insulin = { value: 'Insulin only' };
      else if (mgmt.includes('oral') || mgmt.includes('pill')) mapped.diabetes_insulin = { value: 'Oral medications only' };
      else if (mgmt.includes('diet')) mapped.diabetes_insulin = { value: 'Diet controlled' };
    }

    // Smoking
    const sh = extractedData.social_history || {};
    if (sh.smoking_status?.toLowerCase().includes('current')) {
      mapped.smoking_current = { checked: true };
      mapped.smoking_history = { checked: true };
    } else if (sh.smoking_status?.toLowerCase().includes('former') || sh.smoking_status?.toLowerCase().includes('quit')) {
      mapped.smoking_history = { checked: true };
    }
    if (sh.smoking_details) mapped.smoking_details = { text: sh.smoking_details };

    // Medications
    if (extractedData.medications?.length > 0) {
      mapped.all_medications = { text: extractedData.medications.join(', ') };
      const meds = extractedData.medications.map(m => m.toLowerCase());
      if (meds.some(m => m.includes('aspirin'))) mapped.aspirin = { checked: true };
      if (meds.some(m => m.includes('plavix') || m.includes('clopidogrel'))) mapped.plavix = { checked: true };
      if (meds.some(m => m.includes('statin') || m.includes('atorvastatin') || m.includes('rosuvastatin') || m.includes('lipitor') || m.includes('crestor'))) mapped.statins = { checked: true };

      const acMeds = { 'coumadin': 'Coumadin (Warfarin)', 'warfarin': 'Coumadin (Warfarin)', 'eliquis': 'Eliquis (Apixaban)', 'apixaban': 'Eliquis (Apixaban)', 'xarelto': 'Xarelto (Rivaroxaban)', 'rivaroxaban': 'Xarelto (Rivaroxaban)' };
      for (const m of meds) {
        for (const [key, val] of Object.entries(acMeds)) {
          if (m.includes(key)) mapped.anticoagulation = { value: val };
        }
      }
    }

    // Allergies
    if (extractedData.allergies?.length > 0) {
      mapped.allergies = { text: extractedData.allergies.join(', ') };
    }

    // Walking / PAD
    const w = extractedData.walking || {};
    if (w.has_leg_pain_walking) mapped.leg_pain_walking = { checked: true };
    if (w.distance) mapped.walking_distance = { text: w.distance };
    if (w.pain_location?.length > 0) mapped.pain_location = { values: w.pain_location };
    if (w.relieved_by_rest) mapped.pain_relief = { checked: true };

    onAutoFill(mapped);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-900 text-white rounded-t-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🎙️ Voice Clinical Interview
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-800 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 text-sm">
            {['Record', 'Review', 'Extract'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === ['record', 'review', 'extracted'].indexOf(step)
                    ? 'bg-blue-600 text-white'
                    : i < ['record', 'review', 'extracted'].indexOf(step)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < ['record', 'review', 'extracted'].indexOf(step) ? '✓' : i + 1}
                </div>
                <span className="font-medium text-gray-700">{s}</span>
                {i < 2 && <div className="w-8 h-0.5 bg-gray-300" />}
              </div>
            ))}
          </div>

          {/* Step: Record */}
          {step === 'record' && (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Dictate the patient interview. Speak naturally — the AI will extract structured data.
              </p>
              <VoiceRecorder onTranscription={handleTranscription} />
            </div>
          )}

          {/* Step: Review transcription */}
          {step === 'review' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 text-lg">Review Transcription</h3>
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="w-full h-48 p-4 border border-gray-300 rounded-lg text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setTranscription(''); setStep('record'); }}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium min-h-[52px]"
                >
                  🔄 Re-record
                </button>
                <button
                  onClick={extractClinicalData}
                  disabled={isExtracting || !transcription.trim()}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold min-h-[52px] text-white ${
                    isExtracting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isExtracting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Extracting...
                    </span>
                  ) : '🧠 Extract Clinical Data'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Extracted data */}
          {step === 'extracted' && extractedData && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 text-lg">Extracted Clinical Data</h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3 max-h-96 overflow-y-auto text-sm">
                {extractedData.chief_complaint && (
                  <div><span className="font-semibold text-blue-800">Chief Complaint:</span> {extractedData.chief_complaint}</div>
                )}
                {extractedData.hpi && (
                  <div><span className="font-semibold text-blue-800">HPI:</span> {extractedData.hpi}</div>
                )}
                {extractedData.past_medical_history?.length > 0 && (
                  <div><span className="font-semibold text-blue-800">PMH:</span> {extractedData.past_medical_history.join(', ')}</div>
                )}
                {extractedData.past_surgical_history?.length > 0 && (
                  <div><span className="font-semibold text-blue-800">PSH:</span> {extractedData.past_surgical_history.join(', ')}</div>
                )}
                {extractedData.medications?.length > 0 && (
                  <div><span className="font-semibold text-blue-800">Medications:</span> {extractedData.medications.join(', ')}</div>
                )}
                {extractedData.allergies?.length > 0 && (
                  <div><span className="font-semibold text-blue-800">Allergies:</span> {extractedData.allergies.join(', ')}</div>
                )}
                {extractedData.social_history?.smoking_status && (
                  <div><span className="font-semibold text-blue-800">Smoking:</span> {extractedData.social_history.smoking_status} {extractedData.social_history.smoking_details}</div>
                )}
                {extractedData.cardiovascular && (
                  <div>
                    <span className="font-semibold text-blue-800">Cardiovascular:</span>{' '}
                    {Object.entries(extractedData.cardiovascular).filter(([k,v]) => v === true).map(([k]) => k.replace(/_/g, ' ')).join(', ') || 'None noted'}
                  </div>
                )}
                {extractedData.diabetes?.has_diabetes && (
                  <div><span className="font-semibold text-blue-800">Diabetes:</span> A1C: {extractedData.diabetes.a1c || 'unknown'}, {extractedData.diabetes.management || 'management unknown'}</div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium min-h-[52px]"
                >
                  ← Back
                </button>
                <button
                  onClick={() => { mapToInterviewData(); onClose(); }}
                  className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold min-h-[52px]"
                >
                  ✅ Auto-Fill Interview
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceInterview;
