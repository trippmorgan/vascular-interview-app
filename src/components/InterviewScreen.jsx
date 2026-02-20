import { useState, useMemo } from 'react';
import { patientTypes, universalQuestions, conditionSpecificQuestions } from '../data/interviewData';
import QuestionSection from './QuestionSection';
import QuickReference from './QuickReference';
import PhysicalExam from './PhysicalExam';
import Summary from './Summary';
import CodingPanel from './CodingPanel';
import ClinicalScoring from './ClinicalScoring';
import NoteGenerator from './NoteGenerator';
import VoiceInterview from './VoiceInterview';
import NoteEditor from './NoteEditor';

const conditionColors = {
  pad: { accent: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', tab: 'text-red-600 border-red-600' },
  venous: { accent: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', tab: 'text-purple-600 border-purple-600' },
  carotid: { accent: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', tab: 'text-blue-600 border-blue-600' },
  wound: { accent: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', tab: 'text-orange-600 border-orange-600' },
  dialysis: { accent: 'border-teal-500', bg: 'bg-teal-50', text: 'text-teal-700', tab: 'text-teal-600 border-teal-600' },
  aaa: { accent: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700', tab: 'text-green-600 border-green-600' },
  dvt: { accent: 'border-pink-500', bg: 'bg-pink-50', text: 'text-pink-700', tab: 'text-pink-600 border-pink-600' },
};

function InterviewScreen({ patientType, selectedConditions = [], onBack, interviewData, setInterviewData }) {
  // Use selectedConditions if provided, fallback to single patientType
  const conditions = selectedConditions.length > 0 ? selectedConditions : (patientType ? [patientType] : []);

  const [activeTab, setActiveTab] = useState('interview');
  const [activeConditionTab, setActiveConditionTab] = useState(conditions[0] || '');
  const [showQuickRef, setShowQuickRef] = useState(false);
  const [showVoiceInterview, setShowVoiceInterview] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [clinicalScores, setClinicalScores] = useState({});

  // Flatten interviewData for scoring/note components
  const flatAnswers = useMemo(() => {
    const flat = {};
    Object.entries(interviewData).forEach(([key, val]) => {
      if (val?.checked) flat[key] = true;
      if (val?.text) flat[key] = val.text;
      if (val?.value != null) flat[key] = val.value;
      if (Array.isArray(val?.values) && val.values.length > 0) {
        flat[key] = val.values.join(', ');
      }
    });
    return flat;
  }, [interviewData]);

  // Build a set of question IDs that appear in universal to avoid repeats
  const universalQuestionIds = useMemo(() => {
    const ids = new Set();
    Object.values(universalQuestions).forEach(section => {
      section.questions.forEach(q => ids.add(q.id));
    });
    return ids;
  }, []);

  // Deduplicate: track which question IDs we've already shown across conditions
  // so shared questions (like smoking_history) only appear once
  const deduplicatedConditionSections = useMemo(() => {
    const seen = new Set(universalQuestionIds);
    const result = {};

    conditions.forEach(condId => {
      const condData = conditionSpecificQuestions[condId];
      if (!condData) return;
      result[condId] = {};
      Object.entries(condData.sections).forEach(([sKey, section]) => {
        const filteredQuestions = section.questions.filter(q => {
          if (seen.has(q.id)) return false;
          seen.add(q.id);
          return true;
        });
        if (filteredQuestions.length > 0) {
          result[condId][sKey] = { ...section, questions: filteredQuestions };
        }
      });
    });
    return result;
  }, [conditions, universalQuestionIds]);

  // Calculate overall progress
  const { progress, conditionProgress } = useMemo(() => {
    let totalQuestions = 0;
    let answeredQuestions = 0;
    const condProg = {};

    const isAnswered = (qId) => {
      const v = interviewData[qId];
      if (!v) return false;
      return v.checked || !!v.text || v.value != null || (Array.isArray(v.values) && v.values.length > 0);
    };

    // Universal
    Object.values(universalQuestions).forEach(section => {
      section.questions.forEach(q => {
        totalQuestions++;
        if (isAnswered(q.id)) answeredQuestions++;
      });
    });

    // Per-condition
    conditions.forEach(condId => {
      let ct = 0, ca = 0;
      const sections = deduplicatedConditionSections[condId] || {};
      Object.values(sections).forEach(section => {
        section.questions.forEach(q => {
          totalQuestions++; ct++;
          if (isAnswered(q.id)) { answeredQuestions++; ca++; }
        });
      });
      condProg[condId] = ct > 0 ? Math.round((ca / ct) * 100) : 0;
    });

    return {
      progress: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
      conditionProgress: condProg,
    };
  }, [interviewData, conditions, deduplicatedConditionSections]);

  const handleQuestionChange = (questionId, field, value) => {
    setInterviewData(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], [field]: value }
    }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Header: show all selected conditions
  const conditionChips = conditions.map(id => patientTypes.find(pt => pt.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Compact Header */}
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={onBack}
                className="text-white hover:text-blue-200 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                aria-label="Back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {/* Condition chips — compact, horizontally scrollable */}
              <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1 no-scrollbar">
                {conditionChips.map(pt => (
                  <span key={pt.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium whitespace-nowrap flex-shrink-0">
                    {pt.icon} {pt.name.split('(')[0]?.trim() || pt.name}
                  </span>
                ))}
              </div>
              {/* Slim progress indicator */}
              <span className="text-xs text-blue-200 font-mono flex-shrink-0">{progress}%</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setShowVoiceInterview(true)}
                className="inline-flex items-center justify-center w-11 h-11 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                title="Voice Interview"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>
              <a
                href="https://app.plaud.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-11 h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                title="PLAUD AI"
              >
                🎙️
              </a>
              <button
                onClick={() => setShowQuickRef(!showQuickRef)}
                className="inline-flex items-center justify-center w-11 h-11 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs font-medium"
                title="Quick Reference"
              >
                Ref
              </button>
            </div>
          </div>
          {/* Slim progress bar */}
          <div className="bg-blue-800 rounded-full h-1.5 overflow-hidden mt-1.5">
            <div className="bg-green-400 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Tabs — inside header so they're always sticky together */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-2">
            <div className="flex overflow-x-auto no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
              {['interview', 'physical', 'scoring', 'summary', 'coding', 'note', 'editor'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 font-medium capitalize transition-colors min-h-[44px] whitespace-nowrap text-sm flex-shrink-0 ${
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
      </header>

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

            {/* Condition-Specific Questions — Accordion per condition */}
            {conditions.length > 1 ? (
              /* Multi-condition: tabs for each condition */
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-500">
                  Condition-Specific Questions
                </h2>

                {/* Condition tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {conditions.map(condId => {
                    const pt = patientTypes.find(t => t.id === condId);
                    const colors = conditionColors[condId] || {};
                    const isActive = activeConditionTab === condId;
                    const prog = conditionProgress[condId] || 0;
                    return (
                      <button
                        key={condId}
                        onClick={() => setActiveConditionTab(condId)}
                        className={`px-4 py-3 rounded-xl font-medium transition-all border-2 flex items-center gap-2 ${
                          isActive
                            ? `${colors.bg} ${colors.accent} ${colors.text}`
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span>{pt?.icon}</span>
                        <span>{pt?.name?.split('(')[0]?.trim() || pt?.name}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/60' : 'bg-gray-100'}`}>
                          {prog}%
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active condition's sections */}
                {conditions.map(condId => {
                  if (condId !== activeConditionTab) return null;
                  const sections = deduplicatedConditionSections[condId];
                  const condData = conditionSpecificQuestions[condId];
                  if (!sections || !condData) return null;
                  return (
                    <div key={condId} className="space-y-4">
                      {Object.entries(sections).map(([key, section]) => (
                        <QuestionSection
                          key={key}
                          sectionId={`condition-${condId}-${key}`}
                          title={section.title}
                          questions={section.questions}
                          interviewData={interviewData}
                          onQuestionChange={handleQuestionChange}
                          expanded={expandedSections[`condition-${condId}-${key}`]}
                          onToggle={() => toggleSection(`condition-${condId}-${key}`)}
                        />
                      ))}
                      {Object.keys(sections).length === 0 && (
                        <p className="text-gray-500 text-center py-4">All questions for this condition are covered in other sections.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Single condition: original layout */
              conditions.map(condId => {
                const condData = conditionSpecificQuestions[condId];
                if (!condData) return null;
                return (
                  <div key={condId} className="card">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-500">
                      {condData.name} - Specific Questions
                    </h2>
                    <div className="space-y-4">
                      {Object.entries(condData.sections).map(([key, section]) => (
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
                );
              })
            )}
          </div>
        )}

        {activeTab === 'physical' && (
          <PhysicalExam
            interviewData={interviewData}
            onDataChange={setInterviewData}
            selectedConditions={conditions}
          />
        )}

        {activeTab === 'scoring' && (
          <div className="card">
            <ClinicalScoring
              patientType={patientType}
              selectedConditions={conditions}
              answers={flatAnswers}
              onScoresChange={setClinicalScores}
            />
          </div>
        )}

        {activeTab === 'summary' && (
          <Summary
            patientType={patientType}
            selectedConditions={conditions}
            interviewData={interviewData}
          />
        )}

        {activeTab === 'coding' && (
          <CodingPanel
            patientType={patientType}
            selectedConditions={conditions}
            interviewData={interviewData}
          />
        )}

        {activeTab === 'editor' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-500">
              Clinical Note Editor
            </h2>
            <NoteEditor
              patientType={patientType}
              selectedConditions={conditions}
              interviewData={interviewData}
            />
          </div>
        )}

        {activeTab === 'note' && (
          <div className="card">
            <NoteGenerator
              patientType={patientType}
              selectedConditions={conditions}
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

      {/* Voice Interview Modal */}
      {showVoiceInterview && (
        <VoiceInterview
          patientType={patientType}
          onClose={() => setShowVoiceInterview(false)}
          onAutoFill={(mappedData) => {
            setInterviewData(prev => {
              const merged = { ...prev };
              Object.entries(mappedData).forEach(([key, val]) => {
                merged[key] = { ...prev[key], ...val };
              });
              return merged;
            });
          }}
        />
      )}
    </div>
  );
}

export default InterviewScreen;
