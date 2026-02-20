import { useState, useRef } from 'react';
import VoiceRecorder from './VoiceRecorder';

const OLLAMA_URL = 'http://100.101.184.20:11434/v1/chat/completions';

const DEFAULT_SECTIONS = {
  hpi: { title: 'History of Present Illness', content: '' },
  pmh: { title: 'Past Medical History', content: '' },
  psh: { title: 'Past Surgical History', content: '' },
  medications: { title: 'Medications', content: '' },
  allergies: { title: 'Allergies', content: '' },
  social: { title: 'Social History', content: '' },
  exam: { title: 'Physical Examination', content: '' },
  assessment: { title: 'Assessment & Plan', content: '' },
};

function NoteEditor({ patientType, interviewData }) {
  const [sections, setSections] = useState(() => initializeSections(interviewData));
  const [regeneratingSection, setRegeneratingSection] = useState(null);
  const [voiceSection, setVoiceSection] = useState(null);

  function initializeSections(data) {
    const s = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
    if (!data) return s;

    // Build initial note content from interview data
    const get = (id) => {
      const v = data[id];
      if (!v) return '';
      return v.text || (v.checked ? 'Yes' : '') || v.value || (v.values?.join(', ')) || '';
    };

    if (get('chief_complaint') || get('presenting_symptoms')) {
      s.hpi.content = [get('chief_complaint'), get('presenting_symptoms')].filter(Boolean).join('\n');
    }

    // PMH from checkboxes
    const pmhItems = [];
    if (data.heart_attack?.checked) pmhItems.push('History of MI');
    if (data.heart_stents?.checked) pmhItems.push('Cardiac stents');
    if (data.stroke_tia?.checked) pmhItems.push('History of stroke/TIA');
    if (data.dvt_history?.checked) pmhItems.push('History of DVT');
    if (data.hypertension?.checked) pmhItems.push('Hypertension');
    if (data.high_cholesterol?.checked) pmhItems.push('Hyperlipidemia');
    if (data.diabetes?.checked) pmhItems.push(`Diabetes${get('diabetes_a1c') ? ` (A1C: ${get('diabetes_a1c')})` : ''}`);
    if (get('cad')) pmhItems.push(`CAD: ${get('cad')}`);
    s.pmh.content = pmhItems.join('\n') || '';

    // PSH
    const pshItems = [];
    if (data.knee_hip_surgery?.checked) pshItems.push('Knee/hip surgery');
    if (data.gallbladder?.checked) pshItems.push('Cholecystectomy');
    if (data.hysterectomy?.checked) pshItems.push('Hysterectomy');
    s.psh.content = pshItems.join('\n') || '';

    // Medications
    s.medications.content = get('all_medications');

    // Allergies
    s.allergies.content = get('allergies') || 'NKDA';

    // Social
    const socialItems = [];
    if (data.smoking_current?.checked) socialItems.push(`Current smoker${get('smoking_details') ? `: ${get('smoking_details')}` : ''}`);
    else if (data.smoking_history?.checked) socialItems.push(`Former smoker${get('smoking_details') ? `: ${get('smoking_details')}` : ''}`);
    else socialItems.push('Non-smoker');
    s.social.content = socialItems.join('\n');

    return s;
  }

  const updateSection = (key, content) => {
    setSections(prev => ({
      ...prev,
      [key]: { ...prev[key], content }
    }));
  };

  const regenerateSection = async (key) => {
    setRegeneratingSection(key);
    try {
      const sectionTitle = sections[key].title;
      const allContent = Object.entries(sections)
        .map(([k, v]) => `${v.title}:\n${v.content}`)
        .join('\n\n');

      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3:8b',
          messages: [
            {
              role: 'system',
              content: `You are a vascular surgery medical scribe. Rewrite ONLY the "${sectionTitle}" section of this clinical note in proper medical documentation format. Be concise, professional, and use standard medical terminology. Return only the section content, no headers.`
            },
            {
              role: 'user',
              content: `Full note context:\n${allContent}\n\nRewrite the "${sectionTitle}" section:`
            }
          ],
          temperature: 0.2,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || sections[key].content;
      updateSection(key, content.trim());
    } catch (err) {
      console.error('Regenerate failed:', err);
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleVoiceEdit = (key, text) => {
    updateSection(key, sections[key].content + (sections[key].content ? '\n' : '') + text);
    setVoiceSection(null);
  };

  const handlePrint = () => {
    const content = Object.entries(sections)
      .map(([k, v]) => `${v.title.toUpperCase()}\n${'─'.repeat(40)}\n${v.content || '(none)'}`)
      .join('\n\n');

    const w = window.open('', '', 'height=800,width=700');
    w.document.write(`<html><head><title>Clinical Note</title>
      <style>body{font-family:Georgia,serif;padding:40px;line-height:1.6;font-size:12pt}
      h2{font-size:13pt;border-bottom:1px solid #333;padding-bottom:4px;margin-top:20px}
      pre{white-space:pre-wrap;font-family:inherit}</style></head><body>`);
    w.document.write(`<h1 style="font-size:14pt;text-align:center">VASCULAR SURGERY CLINICAL NOTE</h1>`);
    w.document.write(`<p style="text-align:center;color:#666">${new Date().toLocaleDateString()}</p>`);
    Object.entries(sections).forEach(([k, v]) => {
      w.document.write(`<h2>${v.title}</h2><pre>${v.content || '(none)'}</pre>`);
    });
    w.document.write('</body></html>');
    w.document.close();
    w.print();
  };

  const handleExport = () => {
    const content = `VASCULAR SURGERY CLINICAL NOTE\nDate: ${new Date().toLocaleDateString()}\n\n` +
      Object.entries(sections)
        .map(([k, v]) => `${v.title.toUpperCase()}\n${'─'.repeat(40)}\n${v.content || '(none)'}`)
        .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-note-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm">
          🖨️ Print
        </button>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
          📄 Export
        </button>
      </div>

      {/* Sections */}
      {Object.entries(sections).map(([key, section]) => (
        <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-800">{section.title}</h3>
            <div className="flex items-center gap-2">
              {/* Voice edit button */}
              <button
                onClick={() => setVoiceSection(voiceSection === key ? null : key)}
                className={`p-2 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors ${
                  voiceSection === key ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 text-gray-500'
                }`}
                title="Dictate edits"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>
              {/* Regenerate button */}
              <button
                onClick={() => regenerateSection(key)}
                disabled={regeneratingSection === key}
                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Regenerate with AI"
              >
                {regeneratingSection === key ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Voice recorder for this section */}
          {voiceSection === key && (
            <div className="p-4 bg-red-50 border-b">
              <VoiceRecorder onTranscription={(text) => handleVoiceEdit(key, text)} />
            </div>
          )}

          <textarea
            value={section.content}
            onChange={(e) => updateSection(key, e.target.value)}
            placeholder={`Enter ${section.title.toLowerCase()}...`}
            className="w-full p-4 text-base resize-none border-0 focus:ring-0 focus:outline-none min-h-[100px]"
            rows={Math.max(3, (section.content.split('\n').length || 1) + 1)}
          />
        </div>
      ))}
    </div>
  );
}

export default NoteEditor;
