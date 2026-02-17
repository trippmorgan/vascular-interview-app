import { useState } from 'react';
import { physicalExamTemplate } from '../data/interviewData';

function PhysicalExam({ interviewData, onDataChange }) {
  const [pulseData, setPulseData] = useState(interviewData.pulses || {});
  const [edemaData, setEdemaData] = useState(interviewData.edema || { left: 'None', right: 'None' });
  const [skinData, setSkinData] = useState(interviewData.skin || {});

  const handlePulseChange = (location, side, value) => {
    const newPulseData = {
      ...pulseData,
      [`${location}_${side}`]: value
    };
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

  return (
    <div className="space-y-6">
      {/* Pulse Examination */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {physicalExamTemplate.pulses.title}
        </h2>
        
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
                  <td className="p-3">
                    <div className="flex justify-center space-x-2">
                      {physicalExamTemplate.pulses.options.map((option) => (
                        <button
                          key={`${location.id}_left_${option}`}
                          onClick={() => handlePulseChange(location.id, 'left', option)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] min-w-[100px] ${
                            pulseData[`${location.id}_left`] === option
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center space-x-2">
                      {physicalExamTemplate.pulses.options.map((option) => (
                        <button
                          key={`${location.id}_right_${option}`}
                          onClick={() => handlePulseChange(location.id, 'right', option)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] min-w-[100px] ${
                            pulseData[`${location.id}_right`] === option
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edema Grading */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {physicalExamTemplate.edema.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Left</h3>
            <div className="grid grid-cols-3 gap-2">
              {physicalExamTemplate.edema.options.map((option) => (
                <button
                  key={`left_${option}`}
                  onClick={() => handleEdemaChange('left', option)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors min-h-[60px] ${
                    edemaData.left === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Right */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Right</h3>
            <div className="grid grid-cols-3 gap-2">
              {physicalExamTemplate.edema.options.map((option) => (
                <button
                  key={`right_${option}`}
                  onClick={() => handleEdemaChange('right', option)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors min-h-[60px] ${
                    edemaData.right === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skin Assessment */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {physicalExamTemplate.skin.title}
        </h2>
        
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
      </div>
    </div>
  );
}

export default PhysicalExam;
