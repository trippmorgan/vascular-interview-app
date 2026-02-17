import { useState } from 'react';
import LandingScreen from './components/LandingScreen';
import InterviewScreen from './components/InterviewScreen';
import './App.css';

function App() {
  const [selectedPatientType, setSelectedPatientType] = useState(null);
  const [interviewData, setInterviewData] = useState({});

  const handlePatientTypeSelect = (typeId) => {
    setSelectedPatientType(typeId);
    setInterviewData({});
  };

  const handleBack = () => {
    setSelectedPatientType(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {!selectedPatientType ? (
        <LandingScreen onSelectPatientType={handlePatientTypeSelect} />
      ) : (
        <InterviewScreen
          patientType={selectedPatientType}
          onBack={handleBack}
          interviewData={interviewData}
          setInterviewData={setInterviewData}
        />
      )}
    </div>
  );
}

export default App;
