import { useState } from 'react';
import { physicalExamTemplate, conditionSpecificQuestions } from '../data/interviewData';

// Map conditions to their relevant exam sections
const conditionExamSections = {
  pad: ['pulses', 'skin', 'edema'],
  venous: ['edema', 'skin'],
  carotid: ['carotid'],
  wound: ['skin', 'pulses'],
  dialysis: ['dialysisAccess'],
  aaa: ['abdominal'],
  dvt: ['edema'],
};

function PhysicalExam({ interviewData, onDataChange, selectedConditions = [] }) {
  const [pulseData, setPulseData] = useState(interviewData.pulses || {});
  const [edemaData, setEdemaData] = useState(interviewData.edema || { left: 'None', right: 'None' });
  const [skinData, setSkinData] = useState(interviewData.skin || {});
  const [carotidData, setCarotidData] = useState(interviewData.carotidExam || {});
  const [abdominalData, setAbdominalData] = useState(interviewData.abdominalExam || {});
  const [dialysisData, setDialysisData] = useState(interviewData.dialysisExam || {});
  const [expandedSections, setExpandedSections] = useState({});

  // Determine which exam sections to show based on selected conditions
  const activeSections = new Set();
  selectedConditions.forEach(c => {
    (conditionExamSections[c] || []).forEach(s => activeSections.add(s));
  });
  // If no conditions provided, show all standard sections
  if (activeSections.size === 0) {
    ['pulses', 'edema', 'skin'].forEach(s => activeSections.add(s));
  }

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePulseChange = (location, side, value) => {
    const newPulseData = { ...pulseData, [`${location}_${side}`]: value };
    setPulseData(newPulseData);
    onDataChange({ ...interviewData, pulses: newPulseData });
  };

  const handleEdemaChange = (side, value) => {
    const newEdemaData = { ...edemaData, [side]: value };
    setEdemaData(newEdemaData);
    onDataChange({ ...interviewData, edema: newEdemaData });
  };

  const handleSkinChange = (checkId, checked) => {
    const newSkinData = { ...skinData, [checkId]: checked };
    setSkinData(newSkinData);
    onDataChange({ ...interviewData, skin: newSkinData });
  };

  const handleCarotidChange = (field, value) => {
    const newData = { ...carotidData, [field]: value };
    setCarotidData(newData);
    onDataChange({ ...interviewData, carotidExam: newData });
  };

  const handleAbdominalChange = (field, value) => {
    const newData = { ...abdominalData, [field]: value };
    setAbdominalData(newData);
    onDataChange({ ...interviewData, abdominalExam: newData });
  };

  const handleDialysisChange = (field, value) => {
    const newData = { ...dialysisData, [field]: value };
    setDialysisData(newData);
    onDataChange({ ...interviewData, dialysisExam: newData });
  };

  const SectionWrapper = ({ id, title, conditionLabel, children }) => {
    const isExpanded = expandedSections[id] !== false; // default open
    return (
      <div className="card">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            {conditionLabel && (
              <span className="text-sm text-gray-500">{conditionLabel}</span>
            )}
          </div>
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded && children}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Vital Signs — always shown */}
      <SectionWrapper id="vitals" title="Vital Signs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['BP (mmHg)', 'HR (bpm)', 'SpO2 (%)', 'Temp (°F)'].map(label => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="text"
                className="input-field w-full"
                value={interviewData[`vital_${label.split(' ')[0].toLowerCase()}`]?.text || ''}
                onChange={e => {
                  const key = `vital_${label.split(' ')[0].toLowerCase()}`;
                  onDataChange({ ...interviewData, [key]: { text: e.target.value } });
                }}
                placeholder={label}
              />
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Pulse Examination */}
      {activeSections.has('pulses') && (
        <SectionWrapper id="pulses" title={physicalExamTemplate.pulses.title} conditionLabel="PAD / Wound">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="p-3 text-left font-semibold">Location</th>
                  <th className="p-3 text-center font-semibold">Left</th>
                  <th className="p-3 text-center font-semibold">Right</th>
                </tr>
              </thead>
              <tbody>
                {physicalExamTemplate.pulses.locations.map((location) => (
                  <tr key={location.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{location.name}</td>
                    {['left', 'right'].map(side => (
                      <td key={side} className="p-3">
                        <div className="flex justify-center space-x-2">
                          {physicalExamTemplate.pulses.options.map((option) => (
                            <button
                              key={`${location.id}_${side}_${option}`}
                              onClick={() => handlePulseChange(location.id, side, option)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] min-w-[100px] ${
                                pulseData[`${location.id}_${side}`] === option
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

      {/* Edema Grading */}
      {activeSections.has('edema') && (
        <SectionWrapper id="edema" title={physicalExamTemplate.edema.title} conditionLabel="Venous / DVT">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['left', 'right'].map(side => (
              <div key={side}>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 capitalize">{side}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {physicalExamTemplate.edema.options.map((option) => (
                    <button
                      key={`${side}_${option}`}
                      onClick={() => handleEdemaChange(side, option)}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors min-h-[60px] ${
                        edemaData[side] === option
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Skin Assessment */}
      {activeSections.has('skin') && (
        <SectionWrapper id="skin" title={physicalExamTemplate.skin.title} conditionLabel="PAD / Wound / Venous">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {physicalExamTemplate.skin.checks.map((check) => (
              <div key={check.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id={check.id}
                  checked={skinData[check.id] || false}
                  onChange={(e) => handleSkinChange(check.id, e.target.checked)}
                  className="checkbox-large"
                />
                <label htmlFor={check.id} className="text-gray-800 font-medium cursor-pointer flex-1">
                  {check.text}
                </label>
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Carotid Exam */}
      {activeSections.has('carotid') && (
        <SectionWrapper id="carotid" title="Carotid Examination" conditionLabel="Carotid Disease">
          <div className="space-y-4">
            {[
              { id: 'carotid_bruit_left', label: 'Left carotid bruit' },
              { id: 'carotid_bruit_right', label: 'Right carotid bruit' },
            ].map(item => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id={item.id}
                  checked={carotidData[item.id] || false}
                  onChange={e => handleCarotidChange(item.id, e.target.checked)}
                  className="checkbox-large"
                />
                <label htmlFor={item.id} className="text-gray-800 font-medium cursor-pointer flex-1">
                  {item.label}
                </label>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Neurologic exam notes</label>
              <textarea
                className="input-field w-full resize-none"
                rows={3}
                value={carotidData.neuro_notes || ''}
                onChange={e => handleCarotidChange('neuro_notes', e.target.value)}
                placeholder="Cranial nerves, motor/sensory, speech..."
              />
            </div>
          </div>
        </SectionWrapper>
      )}

      {/* Abdominal Exam */}
      {activeSections.has('abdominal') && (
        <SectionWrapper id="abdominal" title="Abdominal Examination" conditionLabel="AAA">
          <div className="space-y-4">
            {[
              { id: 'pulsatile_mass', label: 'Pulsatile abdominal mass' },
              { id: 'abdominal_tenderness', label: 'Abdominal tenderness' },
              { id: 'abdominal_bruit', label: 'Abdominal bruit' },
            ].map(item => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id={item.id}
                  checked={abdominalData[item.id] || false}
                  onChange={e => handleAbdominalChange(item.id, e.target.checked)}
                  className="checkbox-large"
                />
                <label htmlFor={item.id} className="text-gray-800 font-medium cursor-pointer flex-1">
                  {item.label}
                </label>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional abdominal exam notes</label>
              <textarea
                className="input-field w-full resize-none"
                rows={3}
                value={abdominalData.notes || ''}
                onChange={e => handleAbdominalChange('notes', e.target.value)}
                placeholder="Bowel sounds, distension, scars..."
              />
            </div>
          </div>
        </SectionWrapper>
      )}

      {/* Dialysis Access Exam */}
      {activeSections.has('dialysisAccess') && (
        <SectionWrapper id="dialysisAccess" title="Dialysis Access Examination" conditionLabel="Dialysis Access">
          <div className="space-y-4">
            {[
              { id: 'thrill_present', label: 'Thrill present' },
              { id: 'bruit_present', label: 'Bruit present' },
              { id: 'arm_edema', label: 'Arm edema / swelling' },
              { id: 'erythema', label: 'Erythema / signs of infection' },
            ].map(item => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id={item.id}
                  checked={dialysisData[item.id] || false}
                  onChange={e => handleDialysisChange(item.id, e.target.checked)}
                  className="checkbox-large"
                />
                <label htmlFor={item.id} className="text-gray-800 font-medium cursor-pointer flex-1">
                  {item.label}
                </label>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access exam notes</label>
              <textarea
                className="input-field w-full resize-none"
                rows={3}
                value={dialysisData.notes || ''}
                onChange={e => handleDialysisChange('notes', e.target.value)}
                placeholder="Access type, location, maturity..."
              />
            </div>
          </div>
        </SectionWrapper>
      )}
    </div>
  );
}

export default PhysicalExam;
