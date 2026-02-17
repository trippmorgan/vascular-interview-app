import { patientTypes, universalQuestions, conditionSpecificQuestions } from '../data/interviewData';

function Summary({ patientType, interviewData }) {
  const patientTypeData = patientTypes.find(pt => pt.id === patientType);
  const conditionData = conditionSpecificQuestions[patientType];

  const generateSummaryText = () => {
    let summary = `VASCULAR SURGERY CLINICAL INTERVIEW\n`;
    summary += `Date: ${new Date().toLocaleDateString()}\n`;
    summary += `Patient Type: ${patientTypeData?.name}\n\n`;
    summary += `================================================\n\n`;

    // Universal Questions
    summary += `UNIVERSAL HISTORY\n`;
    summary += `================================================\n\n`;
    
    Object.entries(universalQuestions).forEach(([key, section]) => {
      const answeredQuestions = section.questions.filter(q => 
        interviewData[q.id]?.checked || interviewData[q.id]?.text
      );
      
      if (answeredQuestions.length > 0) {
        summary += `${section.title}\n`;
        summary += `-`.repeat(section.title.length) + `\n`;
        answeredQuestions.forEach(q => {
          if (interviewData[q.id]?.checked) {
            summary += `☑ ${q.text}\n`;
          }
          if (interviewData[q.id]?.text) {
            summary += `  Notes: ${interviewData[q.id].text}\n`;
          }
        });
        summary += `\n`;
      }
    });

    // Condition-Specific Questions
    if (conditionData) {
      summary += `\n${conditionData.name.toUpperCase()}\n`;
      summary += `================================================\n\n`;
      
      Object.entries(conditionData.sections).forEach(([key, section]) => {
        const answeredQuestions = section.questions.filter(q => 
          interviewData[q.id]?.checked || interviewData[q.id]?.text
        );
        
        if (answeredQuestions.length > 0) {
          summary += `${section.title}\n`;
          summary += `-`.repeat(section.title.length) + `\n`;
          answeredQuestions.forEach(q => {
            if (interviewData[q.id]?.checked) {
              summary += `☑ ${q.text}\n`;
            }
            if (interviewData[q.id]?.text) {
              summary += `  Notes: ${interviewData[q.id].text}\n`;
            }
          });
          summary += `\n`;
        }
      });
    }

    // Physical Exam
    if (interviewData.pulses || interviewData.edema || interviewData.skin) {
      summary += `\nPHYSICAL EXAMINATION\n`;
      summary += `================================================\n\n`;

      if (interviewData.pulses) {
        summary += `Pulse Examination:\n`;
        Object.entries(interviewData.pulses).forEach(([key, value]) => {
          if (value) {
            summary += `  ${key.replace('_', ' ')}: ${value}\n`;
          }
        });
        summary += `\n`;
      }

      if (interviewData.edema) {
        summary += `Edema:\n`;
        summary += `  Left: ${interviewData.edema.left}\n`;
        summary += `  Right: ${interviewData.edema.right}\n\n`;
      }

      if (interviewData.skin) {
        const skinFindings = Object.entries(interviewData.skin)
          .filter(([key, value]) => value)
          .map(([key]) => key.replace(/_/g, ' '));
        
        if (skinFindings.length > 0) {
          summary += `Skin Assessment:\n`;
          skinFindings.forEach(finding => {
            summary += `  ☑ ${finding}\n`;
          });
        }
      }
    }

    return summary;
  };

  const handleCopyToClipboard = () => {
    const summaryText = generateSummaryText();
    navigator.clipboard.writeText(summaryText).then(() => {
      alert('Summary copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    });
  };

  const handlePrint = () => {
    const summaryText = generateSummaryText();
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Interview Summary</title>');
    printWindow.document.write('<style>body { font-family: monospace; white-space: pre-wrap; padding: 20px; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(summaryText);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const summaryText = generateSummaryText();
  const hasData = summaryText.includes('☑');

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="card">
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleCopyToClipboard}
            disabled={!hasData}
            className={`btn-primary flex items-center space-x-2 ${!hasData && 'opacity-50 cursor-not-allowed'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy to Clipboard</span>
          </button>
          
          <button
            onClick={handlePrint}
            disabled={!hasData}
            className={`btn-secondary flex items-center space-x-2 ${!hasData && 'opacity-50 cursor-not-allowed'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Summary Display */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Interview Summary</h2>
        
        {hasData ? (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
              {summaryText}
            </pre>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg">No data entered yet</p>
            <p className="text-sm mt-2">Complete the interview and physical exam to generate a summary</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Summary;
