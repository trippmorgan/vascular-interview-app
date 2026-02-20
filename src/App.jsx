import { useState } from 'react';
import LandingScreen from './components/LandingScreen';
import InterviewScreen from './components/InterviewScreen';
import './App.css';

function App() {
  // Now an array of condition type ids (e.g. ['pad', 'carotid'])
  const [selectedPatientTypes, setSelectedPatientTypes] = useState(null);
  const [interviewData, setInterviewData] = useState({});

  const handlePatientTypeSelect = (typeIds) => {
    // Accept both array (multi-select) and string (legacy single)
    const types = Array.isArray(typeIds) ? typeIds : [typeIds];
    setSelectedPatientTypes(types);
    setInterviewData({});
  };

  const handleBack = () => {
    setSelectedPatientTypes(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {!selectedPatientTypes || selectedPatientTypes.length === 0 ? (
        <LandingScreen onStartInterview={handlePatientTypeSelect} />
      ) : (
        <InterviewScreen
          patientType={selectedPatientTypes[0]}
          selectedConditions={selectedPatientTypes}
          onBack={handleBack}
          interviewData={interviewData}
          setInterviewData={setInterviewData}
        />
      )}
    </div>
  );
}

export default App;
