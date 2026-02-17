import React, { useMemo } from 'react';
import { RUTHERFORD, WIFI, CEAP, WAGNER, ABI_INTERPRETATION, getScoringForType } from '../data/clinicalScoring';

/**
 * NoteGenerator
 * 
 * Generates a copy-paste-ready clinical note from interview answers,
 * physical exam findings, clinical scores, and coding suggestions.
 * Output is formatted for direct paste into Athena.
 */
export default function NoteGenerator({ patientType, answers, examFindings, scores, suggestedCodes }) {
  const note = useMemo(() =>
    generateNote(patientType, answers || {}, examFindings || {}, scores || {}, suggestedCodes || []),
    [patientType, answers, examFindings, scores, suggestedCodes]
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(note).then(() => {
      alert('Note copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = note;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Note copied to clipboard!');
    });
  };

  const copyCodesOnly = () => {
    const codesText = (suggestedCodes || [])
      .map(c => `${c.code} - ${c.description}`)
      .join('\n');
    navigator.clipboard.writeText(codesText).then(() => {
      alert('Codes copied!');
    });
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: '#1a365d' }}>📝 Generated Note</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={copyCodesOnly}
            style={{
              padding: '6px 14px',
              background: '#38a169',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📋 Copy Codes
          </button>
          <button
            onClick={copyToClipboard}
            style={{
              padding: '6px 14px',
              background: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📋 Copy Full Note
          </button>
        </div>
      </div>

      <pre style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: 16,
        fontSize: 13,
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        maxHeight: 500,
        overflow: 'auto',
        lineHeight: 1.5
      }}>
        {note}
      </pre>
    </div>
  );
}

function generateNote(patientType, answers, exam, scores, codes) {
  const sections = [];
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  // ─── Header ───
  sections.push(`CLINICAL INTAKE NOTE`);
  sections.push(`Date: ${today}`);
  sections.push(`Patient Type: ${patientType?.toUpperCase() || 'GENERAL'}`);
  sections.push('');

  // ─── Chief Complaint ───
  if (answers.chief_complaint) {
    sections.push('CHIEF COMPLAINT:');
    sections.push(answers.chief_complaint);
    sections.push('');
  }

  // ─── HPI ───
  sections.push('HISTORY OF PRESENT ILLNESS:');
  const hpiParts = buildHPI(patientType, answers);
  sections.push(hpiParts || '[See interview answers below]');
  sections.push('');

  // ─── Past Medical History ───
  sections.push('PAST MEDICAL HISTORY:');
  const pmh = [];
  if (answers.hypertension) pmh.push('Hypertension');
  if (answers.high_cholesterol) pmh.push('Dyslipidemia');
  if (answers.diabetes) pmh.push(`Diabetes mellitus type 2${answers.diabetes_a1c ? ' (A1C: ' + answers.diabetes_a1c + ')' : ''}`);
  if (answers.heart_attack) pmh.push('History of myocardial infarction');
  if (answers.heart_stents) pmh.push('Coronary stents');
  if (answers.cad) pmh.push('Coronary artery disease: ' + answers.cad);
  if (answers.stroke_tia) pmh.push('History of stroke/TIA');
  if (answers.dvt_history) pmh.push('History of DVT');
  if (answers.smoking_current) pmh.push('Current smoker');
  else if (answers.smoking_history) pmh.push(`Former smoker${answers.smoking_details ? ' (' + answers.smoking_details + ')' : ''}`);
  sections.push(pmh.length > 0 ? pmh.map(p => '- ' + p).join('\n') : '- None reported');
  sections.push('');

  // ─── Surgical History ───
  sections.push('PAST SURGICAL HISTORY:');
  const surg = [];
  if (answers.knee_hip_surgery) surg.push('Knee/hip surgery');
  if (!answers.gallbladder) surg.push('Cholecystectomy');
  if (!answers.appendix) surg.push('Appendectomy');
  if (answers.hysterectomy) surg.push('Hysterectomy');
  if (answers.previous_amputations) surg.push('Amputation: ' + answers.previous_amputations);
  sections.push(surg.length > 0 ? surg.map(s => '- ' + s).join('\n') : '- None reported');
  sections.push('');

  // ─── Medications ───
  sections.push('MEDICATIONS:');
  const meds = [];
  if (answers.aspirin) meds.push('Aspirin');
  if (answers.plavix) meds.push('Clopidogrel (Plavix)');
  if (answers.anticoagulation) meds.push(answers.anticoagulation);
  if (answers.statins) meds.push('Statin');
  if (answers.diabetes_insulin) meds.push('Insulin: ' + answers.diabetes_insulin);
  if (answers.all_medications) meds.push(answers.all_medications);
  sections.push(meds.length > 0 ? meds.map(m => '- ' + m).join('\n') : '- None reported');
  sections.push('');

  // ─── Allergies ───
  if (answers.allergies) {
    sections.push('ALLERGIES:');
    sections.push(answers.allergies);
    sections.push('');
  }

  // ─── Physical Exam ───
  sections.push('PHYSICAL EXAMINATION:');
  if (exam && Object.keys(exam).length > 0) {
    Object.entries(exam).forEach(([key, val]) => {
      if (val) sections.push(`- ${key}: ${val}`);
    });
  } else {
    sections.push('[Physical exam findings to be documented]');
  }
  sections.push('');

  // ─── Clinical Scoring ───
  const scoringLines = buildScoringSection(patientType, scores, answers);
  if (scoringLines) {
    sections.push('CLINICAL SCORING:');
    sections.push(scoringLines);
    sections.push('');
  }

  // ─── Assessment / Plan ───
  sections.push('ASSESSMENT:');
  const assessment = buildAssessment(patientType, answers, scores);
  sections.push(assessment);
  sections.push('');

  sections.push('PLAN:');
  const plan = buildPlan(patientType, answers, scores);
  sections.push(plan);
  sections.push('');

  // ─── ICD-10 Codes ───
  if (codes && codes.length > 0) {
    sections.push('ICD-10 CODES:');
    codes.forEach(c => {
      sections.push(`- ${c.code}: ${c.description}`);
    });
    sections.push('');
  }

  // ─── Footer ───
  sections.push('---');
  sections.push('AI-assisted documentation from clinical intake interview.');
  sections.push('Reviewed and approved by: _________________________ Date: _________');

  return sections.join('\n');
}

function buildHPI(patientType, answers) {
  const parts = [];

  if (answers.presenting_symptoms) {
    parts.push(answers.presenting_symptoms);
  }

  if (patientType === 'pad') {
    if (answers.leg_pain_walking) {
      parts.push(`Patient reports claudication${answers.pain_location ? ' in the ' + answers.pain_location : ''}.`);
      if (answers.walking_distance) parts.push(`Walking distance limited to ${answers.walking_distance}.`);
      if (answers.pain_relief) parts.push('Pain resolves with rest.');
      if (answers.relief_time) parts.push(`Relief in ${answers.relief_time}.`);
    }
    if (answers.night_pain) parts.push('Reports rest pain at night.');
    if (answers.hang_leg) parts.push('Has to dangle leg off bed for relief.');
    if (answers.wounds_present) parts.push(`Wounds/tissue loss: ${answers.wounds_present}.`);
  }

  if (patientType === 'venous') {
    if (answers.leg_swelling) parts.push(`Patient reports leg swelling${answers.swelling_bilateral ? ' (' + answers.swelling_bilateral + ')' : ''}.`);
    if (answers.swelling_timing) parts.push('Worse at end of day.');
    if (answers.elevation_helps) parts.push('Improves with elevation.');
    if (answers.legs_heavy) parts.push('Describes legs as heavy/achy.');
    if (answers.varicose_veins) parts.push('Visible varicose veins present.');
  }

  if (patientType === 'wound') {
    if (answers.wounds_present) parts.push(`Wound: ${answers.wounds_present}.`);
    if (answers.wound_duration) parts.push(`Duration: ${answers.wound_duration}.`);
  }

  if (patientType === 'carotid') {
    if (answers.stroke_tia) parts.push('History of stroke/TIA.');
    if (answers.amaurosis) parts.push('History of amaurosis fugax.');
    if (answers.stenosis_percent) parts.push(`Carotid stenosis: ${answers.stenosis_percent}%.`);
  }

  return parts.join(' ') || null;
}

function buildScoringSection(patientType, scores, answers) {
  const lines = [];

  if (scores?.rutherford !== undefined) {
    const cat = RUTHERFORD.categories.find(c => c.category === scores.rutherford);
    if (cat) lines.push(`- Rutherford: Category ${cat.category} (${cat.label}) — ${cat.description}`);
  }

  if (scores?.wifi) {
    const { w, i, fi } = scores.wifi;
    lines.push(`- WIfI: W${w}-I${i}-fI${fi} | Amputation Risk: ${WIFI.amputationRisk(w, i, fi)} | Revasc Benefit: ${WIFI.revascBenefit(w, i, fi)}`);
  }

  if (scores?.ceap) {
    const c = CEAP.clinical.find(cl => cl.class === scores.ceap);
    if (c) lines.push(`- CEAP: ${c.class} — ${c.description}`);
  }

  if (scores?.wagner !== undefined) {
    const g = WAGNER.grades[scores.wagner];
    if (g) lines.push(`- Wagner: Grade ${g.grade} — ${g.description}`);
  }

  if (scores?.abi) {
    if (scores.abi.right) {
      const interp = ABI_INTERPRETATION.interpret(scores.abi.right);
      lines.push(`- ABI Right: ${scores.abi.right}${interp ? ' (' + interp.interpretation + ')' : ''}`);
    }
    if (scores.abi.left) {
      const interp = ABI_INTERPRETATION.interpret(scores.abi.left);
      lines.push(`- ABI Left: ${scores.abi.left}${interp ? ' (' + interp.interpretation + ')' : ''}`);
    }
  }

  if (scores?.carotidGrading) {
    const g = CAROTID_GRADING.grades.find(gr => gr.range === scores.carotidGrading);
    if (g) lines.push(`- Carotid Stenosis (NASCET): ${g.range} — ${g.recommendation}`);
  }

  return lines.length > 0 ? lines.join('\n') : null;
}

function buildAssessment(patientType, answers, scores) {
  const parts = [];

  const typeNames = {
    pad: 'Peripheral arterial disease',
    venous: 'Venous insufficiency',
    carotid: 'Carotid artery disease',
    wound: 'Non-healing wound / diabetic foot',
    dialysis: 'End-stage renal disease requiring dialysis access',
    aaa: 'Abdominal aortic aneurysm',
    dvt: 'Deep vein thrombosis / pulmonary embolism'
  };

  parts.push(`1. ${typeNames[patientType] || patientType}`);

  // Add comorbidities
  let num = 2;
  if (answers.hypertension) parts.push(`${num++}. Hypertension`);
  if (answers.diabetes) parts.push(`${num++}. Diabetes mellitus type 2`);
  if (answers.high_cholesterol) parts.push(`${num++}. Dyslipidemia`);
  if (answers.smoking_current) parts.push(`${num++}. Active tobacco use`);
  if (answers.cad || answers.heart_attack) parts.push(`${num++}. Coronary artery disease`);

  return parts.join('\n');
}

function buildPlan(patientType, answers, scores) {
  const plans = [];

  if (patientType === 'pad') {
    plans.push('1. Obtain arterial duplex ultrasound bilateral lower extremities');
    if (scores?.rutherford >= 3) {
      plans.push('2. Schedule peripheral angiography with possible intervention');
    } else {
      plans.push('2. Initiate supervised exercise therapy');
    }
    plans.push('3. Start/optimize antiplatelet therapy (aspirin 81mg daily)');
    plans.push('4. Statin therapy for LDL goal <70');
    if (answers.smoking_current) plans.push('5. Smoking cessation counseling');
  }

  if (patientType === 'venous') {
    plans.push('1. Obtain venous duplex ultrasound bilateral lower extremities');
    plans.push('2. Trial of compression stockings (20-30 mmHg)');
    plans.push('3. Leg elevation when possible');
    plans.push('4. Follow up in 4-6 weeks with ultrasound results');
  }

  if (patientType === 'carotid') {
    plans.push('1. Obtain carotid duplex ultrasound');
    plans.push('2. Optimize medical management (antiplatelet, statin, BP control)');
    if (answers.stroke_tia) plans.push('3. Neurology referral for symptom evaluation');
  }

  if (patientType === 'wound') {
    plans.push('1. Wound care: debridement as needed, offloading');
    plans.push('2. Obtain arterial duplex to assess perfusion');
    plans.push('3. Optimize glycemic control');
    plans.push('4. Follow up in 1-2 weeks for wound check');
    if (answers.diabetes) plans.push('5. Diabetic shoe evaluation');
  }

  if (patientType === 'dialysis') {
    plans.push('1. Vein mapping ultrasound bilateral upper extremities');
    plans.push('2. Discuss access options (AVF preferred over AVG)');
    plans.push('3. Coordinate with nephrology');
  }

  if (patientType === 'aaa') {
    plans.push('1. Obtain CTA abdomen/pelvis with contrast');
    plans.push('2. Optimize cardiovascular risk factors');
    plans.push('3. Surveillance schedule based on diameter');
  }

  if (patientType === 'dvt') {
    plans.push('1. Obtain venous duplex ultrasound');
    plans.push('2. Initiate/continue anticoagulation therapy');
    plans.push('3. Compression stockings for symptom management');
    plans.push('4. Follow up in 2-4 weeks');
  }

  return plans.length > 0 ? plans.join('\n') : '1. [Plan to be determined based on workup results]';
}
