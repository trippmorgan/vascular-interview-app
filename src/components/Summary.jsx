import { patientTypes, universalQuestions, conditionSpecificQuestions } from '../data/interviewData';

function Summary({ patientType, selectedConditions = [], interviewData }) {
  const conditions = selectedConditions.length > 0 ? selectedConditions : (patientType ? [patientType] : []);

  const generateSummaryText = () => {
    let summary = `VASCULAR SURGERY CLINICAL INTERVIEW\n`;
    summary += `Date: ${new Date().toLocaleDateString()}\n`;
    summary += `Conditions: ${conditions.map(c => {
      const pt = patientTypes.find(t => t.id === c);
      return pt ? pt.name : c;
    }).join(', ')}\n\n`;
    summary += `================================================\n\n`;

    const formatAnswer = (q) => {
      const d = interviewData[q.id];
      if (!d) return null;
      const parts = [];
      if (d.checked) parts.push(`☑ ${q.text}`);
      if (d.text) parts.push(`  Notes: ${d.text}`);
      if (d.value != null) parts.push(`  → ${d.value}`);
      if (Array.isArray(d.values) && d.values.length > 0) parts.push(`  → ${d.values.join(', ')}`);
      return parts.length > 0 ? parts.join('\n') : null;
    };

    const hasAnswer = (q) => {
      const d = interviewData[q.id];
      if (!d) return false;
      return d.checked || !!d.text || d.value != null || (Array.isArray(d.values) && d.values.length > 0);
    };

    // Universal Questions
    summary += `UNIVERSAL HISTORY\n`;
    summary += `================================================\n\n`;

    Object.entries(universalQuestions).forEach(([key, section]) => {
      const answered = section.questions.filter(q => hasAnswer(q));
      if (answered.length > 0) {
        summary += `${section.title}\n`;
        summary += `-`.repeat(section.title.length) + `\n`;
        answered.forEach(q => {
          const txt = formatAnswer(q);
          if (txt) summary += txt + '\n';
        });
        summary += `\n`;
      }
    });

    // Condition-Specific Questions — one section per condition
    conditions.forEach(condId => {
      const condData = conditionSpecificQuestions[condId];
      if (!condData) return;

      summary += `\n${condData.name.toUpperCase()}\n`;
      summary += `================================================\n\n`;

      Object.entries(condData.sections).forEach(([key, section]) => {
        const answered = section.questions.filter(q => hasAnswer(q));
        if (answered.length > 0) {
          summary += `${section.title}\n`;
          summary += `-`.repeat(section.title.length) + `\n`;
          answered.forEach(q => {
            const txt = formatAnswer(q);
            if (txt) summary += txt + '\n';
          });
          summary += `\n`;
        }
      });
    });

    // Physical Exam
    if (interviewData.pulses || interviewData.edema || interviewData.skin ||
        interviewData.carotidExam || interviewData.abdominalExam || interviewData.dialysisExam) {
      summary += `\nPHYSICAL EXAMINATION\n`;
      summary += `================================================\n\n`;

      if (interviewData.pulses) {
        summary += `Pulse Examination:\n`;
        Object.entries(interviewData.pulses).forEach(([key, value]) => {
          if (value) summary += `  ${key.replace('_', ' ')}: ${value}\n`;
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
          .filter(([, value]) => value)
          .map(([key]) => key.replace(/_/g, ' '));
        if (skinFindings.length > 0) {
          summary += `Skin Assessment:\n`;
          skinFindings.forEach(f => summary += `  ☑ ${f}\n`);
          summary += `\n`;
        }
      }

      if (interviewData.carotidExam) {
        summary += `Carotid Examination:\n`;
        const ce = interviewData.carotidExam;
        if (ce.carotid_bruit_left) summary += `  ☑ Left carotid bruit\n`;
        if (ce.carotid_bruit_right) summary += `  ☑ Right carotid bruit\n`;
        if (ce.neuro_notes) summary += `  Neuro: ${ce.neuro_notes}\n`;
        summary += `\n`;
      }

      if (interviewData.abdominalExam) {
        summary += `Abdominal Examination:\n`;
        const ae = interviewData.abdominalExam;
        if (ae.pulsatile_mass) summary += `  ☑ Pulsatile abdominal mass\n`;
        if (ae.abdominal_tenderness) summary += `  ☑ Abdominal tenderness\n`;
        if (ae.abdominal_bruit) summary += `  ☑ Abdominal bruit\n`;
        if (ae.notes) summary += `  Notes: ${ae.notes}\n`;
        summary += `\n`;
      }

      if (interviewData.dialysisExam) {
        summary += `Dialysis Access Examination:\n`;
        const de = interviewData.dialysisExam;
        if (de.thrill_present) summary += `  ☑ Thrill present\n`;
        if (de.bruit_present) summary += `  ☑ Bruit present\n`;
        if (de.arm_edema) summary += `  ☑ Arm edema\n`;
        if (de.erythema) summary += `  ☑ Erythema\n`;
        if (de.notes) summary += `  Notes: ${de.notes}\n`;
        summary += `\n`;
      }
    }

    // Assessment section
    summary += `\nASSESSMENT\n`;
    summary += `================================================\n`;
    conditions.forEach(condId => {
      const pt = patientTypes.find(t => t.id === condId);
      if (pt) summary += `• ${pt.name}\n`;
    });
    summary += `\n`;

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
  const hasData = summaryText.includes('☑') || summaryText.includes('Notes:') || summaryText.includes('→');

  return (
    <div className="space-y-6">
      {/* Action Buttons — prominent, full-width on mobile */}
      <div className="card no-print">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopyToClipboard}
            disabled={!hasData}
            className={`btn-primary flex items-center justify-center gap-2 text-lg py-4 min-h-[56px] ${!hasData && 'opacity-50 cursor-not-allowed'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!hasData}
            className={`btn-secondary flex items-center justify-center gap-2 text-lg py-4 min-h-[56px] ${!hasData && 'opacity-50 cursor-not-allowed'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
