import { useState, useEffect, useMemo } from 'react';
import { patientTypes, universalQuestions, conditionSpecificQuestions } from '../data/interviewData';
import QuestionSection from './QuestionSection';
import QuickReference from './QuickReference';
import PhysicalExam from './PhysicalExam';
import Summary from './Summary';
import CodingPanel from './CodingPanel';
import ClinicalScoring from './ClinicalScoring';
import NoteGenerator from './NoteGenerator';

function InterviewScreen({ patientType, onBack, interviewData, setInterviewData }) {
  const [activeTab, setActiveTab] = useState('interview');
  const [showQuickRef, setShowQuickRef] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [clinicalScores, setClinicalScores] = useState({});

  // Flatten interviewData for scoring/note components
  // interviewData is { questionId: { checked?, text?, value?, values? } }
  // scoring/note expects { questionId: value }
  const flatAnswers = useMemo(() => {
    const flat = {};
    Object.entries(interviewData).forEach(([key, val]) => {
      if (val?.checked) flat[key] = true;
      if (val?.text) flat[key] = val.text;
      // select / yesno
      if (val?.value != null) flat[key] = val.value;
      // multiselect — join to readable string
      if (Array.isArray(val?.values) && val.values.length > 0) {
        flat[key] = val.values.join(', ');
      }
    });
    return flat;
  }, [interviewData]);

  const patientTypeData = patientTypes.find(pt => pt.id === patientType);
  const conditionData = conditionSpecificQuestions[patientType];

  // Calculate progress
  const calculateProgress = () => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    const isAnswered = (qId) => {
      const v = interviewData[qId];
      if (!v) return false;
      return v.checked || !!v.text || v.value != null || (Array.isArray(v.values) && v.values.length > 0);
    };

    // Count universal questions
    Object.values(universalQuestions).forEach(section => {
      section.questions.forEach(q => {
        totalQuestions++;
        if (isAnswered(q.id)) answeredQuestions++;
      });
    });

    // Count condition-specific questions
    if (conditionData) {
      Object.values(conditionData.sections).forEach(section => {
        section.questions.forEach(q => {
          totalQuestions++;
          if (isAnswered(q.id)) answeredQuestions++;
        });
      });
    }

    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  };

  const progress = calculateProgress();

  const handleQuestionChange = (questionId, field, value) => {
    setInterviewData(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-white hover:text-blue-200 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  {patientTypeData?.icon} {patientTypeData?.name}
                </h1>
                <p className="text-blue-200 text-sm">{conditionData?.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="https://app.plaud.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-sm transition-colors"
              >
                🎙️ PLAUD AI
              </a>
              <button
                onClick={() => setShowQuickRef(!showQuickRef)}
                className="btn-secondary text-sm"
              >
                Quick Ref
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-blue-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-400 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-blue-200 text-sm mt-1">Progress: {progress}%</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[120px] z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {['interview', 'physical', 'scoring', 'summary', 'coding', 'note'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors min-h-[44px] ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {activeTab === 'interview' && (
          <div className="space-y-6">
            {/* Universal Questions */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                Universal Questions (All Patients)
              </h2>
              <div className="space-y-4">
                {Object.entries(universalQuestions).map(([key, section]) => (
                  <QuestionSection
                    key={key}
                    sectionId={`universal-${key}`}
                    title={section.title}
                    questions={section.questions}
                    interviewData={interviewData}
                    onQuestionChange={handleQuestionChange}
                    expanded={expandedSections[`universal-${key}`]}
                    onToggle={() => toggleSection(`universal-${key}`)}
                  />
                ))}
              </div>
            </div>

            {/* Condition-Specific Questions */}
            {conditionData && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-500">
                  {conditionData.name} - Specific Questions
                </h2>
                <div className="space-y-4">
                  {Object.entries(conditionData.sections).map(([key, section]) => (
                    <QuestionSection
                      key={key}
                      sectionId={`condition-${key}`}
                      title={section.title}
                      questions={section.questions}
                      interviewData={interviewData}
                      onQuestionChange={handleQuestionChange}
                      expanded={expandedSections[`condition-${key}`]}
                      onToggle={() => toggleSection(`condition-${key}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'physical' && (
          <PhysicalExam
            interviewData={interviewData}
            onDataChange={setInterviewData}
          />
        )}

        {activeTab === 'scoring' && (
          <div className="card">
            <ClinicalScoring
              patientType={patientType}
              answers={flatAnswers}
              onScoresChange={setClinicalScores}
            />
          </div>
        )}

        {activeTab === 'summary' && (
          <Summary
            patientType={patientType}
            interviewData={interviewData}
          />
        )}

        {activeTab === 'coding' && (
          <CodingPanel
            patientType={patientType}
            interviewData={interviewData}
          />
        )}

        {activeTab === 'note' && (
          <div className="card">
            <NoteGenerator
              patientType={patientType}
              answers={flatAnswers}
              examFindings={interviewData._examFindings || {}}
              scores={clinicalScores}
              suggestedCodes={[]}
            />
          </div>
        )}
      </main>

      {/* Quick Reference Drawer */}
      {showQuickRef && (
        <QuickReference onClose={() => setShowQuickRef(false)} />
      )}
    </div>
  );
}

export default InterviewScreen;
