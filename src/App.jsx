import { useState } from 'react';
import LandingScreen from './components/LandingScreen';
import InterviewScreen from './components/InterviewScreen';
import VascularReportAssistant from './components/VascularReportAssistant';
import './App.css';

function App() {
  // Now an array of condition type ids (e.g. ['pad', 'carotid'])
  const [selectedPatientTypes, setSelectedPatientTypes] = useState(null);
  const [interviewData, setInterviewData] = useState({});
  const [screen, setScreen] = useState('landing'); // 'landing' | 'interview' | 'ultrasound'

  const handlePatientTypeSelect = (typeIds) => {
    // Accept both array (multi-select) and string (legacy single)
    const types = Array.isArray(typeIds) ? typeIds : [typeIds];
    setSelectedPatientTypes(types);
    setInterviewData({});
    setScreen('interview');
  };

  const handleBack = () => {
    setSelectedPatientTypes(null);
    setScreen('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {screen === 'ultrasound' ? (
        <VascularReportAssistant onBack={handleBack} />
      ) : screen === 'interview' && selectedPatientTypes?.length > 0 ? (
        <InterviewScreen
          patientType={selectedPatientTypes[0]}
          selectedConditions={selectedPatientTypes}
          onBack={handleBack}
          interviewData={interviewData}
          setInterviewData={setInterviewData}
        />
      ) : (
        <LandingScreen
          onStartInterview={handlePatientTypeSelect}
          onOpenUltrasound={() => setScreen('ultrasound')}
        />
      )}
    </div>
  );
}

export default App;
