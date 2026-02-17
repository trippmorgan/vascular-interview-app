/**
 * Vascular Surgery Coding Engine
 *
 * Suggests ICD-10 and CPT codes based on interview data,
 * physical exam findings, and patient type.
 */

// ─── ICD-10 Code Database ───────────────────────────────────────────────
export const ICD10_DATABASE = {
  // PAD
  'I70.211': { desc: 'Atherosclerosis of native arteries of extremities with intermittent claudication, right leg', category: 'pad', laterality: 'right' },
  'I70.212': { desc: 'Atherosclerosis of native arteries of extremities with intermittent claudication, left leg', category: 'pad', laterality: 'left' },
  'I70.213': { desc: 'Atherosclerosis of native arteries of extremities with intermittent claudication, bilateral', category: 'pad', laterality: 'bilateral' },
  'I70.221': { desc: 'Atherosclerosis of native arteries of extremities with rest pain, right leg', category: 'pad', laterality: 'right' },
  'I70.222': { desc: 'Atherosclerosis of native arteries of extremities with rest pain, left leg', category: 'pad', laterality: 'left' },
  'I70.223': { desc: 'Atherosclerosis of native arteries of extremities with rest pain, bilateral', category: 'pad', laterality: 'bilateral' },
  'I70.231': { desc: 'Atherosclerosis of native arteries of right leg with ulceration of thigh', category: 'pad', laterality: 'right' },
  'I70.232': { desc: 'Atherosclerosis of native arteries of right leg with ulceration of calf', category: 'pad', laterality: 'right' },
  'I70.233': { desc: 'Atherosclerosis of native arteries of right leg with ulceration of ankle', category: 'pad', laterality: 'right' },
  'I70.241': { desc: 'Atherosclerosis of native arteries of left leg with ulceration of thigh', category: 'pad', laterality: 'left' },
  'I70.242': { desc: 'Atherosclerosis of native arteries of left leg with ulceration of calf', category: 'pad', laterality: 'left' },
  'I70.243': { desc: 'Atherosclerosis of native arteries of left leg with ulceration of ankle', category: 'pad', laterality: 'left' },
  'I70.261': { desc: 'Atherosclerosis of native arteries of extremities with gangrene, right leg', category: 'pad', laterality: 'right' },
  'I70.262': { desc: 'Atherosclerosis of native arteries of extremities with gangrene, left leg', category: 'pad', laterality: 'left' },
  'I70.25':  { desc: 'Atherosclerosis of native arteries of other extremities with ulceration', category: 'pad' },

  // Carotid
  'I65.21': { desc: 'Occlusion and stenosis of right carotid artery', category: 'carotid', laterality: 'right' },
  'I65.22': { desc: 'Occlusion and stenosis of left carotid artery', category: 'carotid', laterality: 'left' },
  'I65.23': { desc: 'Occlusion and stenosis of bilateral carotid arteries', category: 'carotid', laterality: 'bilateral' },
  'I65.29': { desc: 'Occlusion and stenosis of unspecified carotid artery', category: 'carotid' },
  'G45.9':  { desc: 'Transient cerebral ischemic attack, unspecified', category: 'carotid' },
  'I63.9':  { desc: 'Cerebral infarction, unspecified', category: 'carotid' },

  // Venous
  'I83.001': { desc: 'Varicose veins of right lower extremity with ulcer of thigh', category: 'venous', laterality: 'right' },
  'I83.011': { desc: 'Varicose veins of left lower extremity with ulcer of thigh', category: 'venous', laterality: 'left' },
  'I83.90':  { desc: 'Asymptomatic varicose veins of unspecified lower extremity', category: 'venous' },
  'I83.91':  { desc: 'Asymptomatic varicose veins of right lower extremity', category: 'venous', laterality: 'right' },
  'I83.92':  { desc: 'Asymptomatic varicose veins of left lower extremity', category: 'venous', laterality: 'left' },
  'I87.2':   { desc: 'Venous insufficiency (chronic)(peripheral)', category: 'venous' },
  'I82.401': { desc: 'Acute embolism and thrombosis of unspecified deep veins of right lower extremity', category: 'dvt', laterality: 'right' },
  'I82.402': { desc: 'Acute embolism and thrombosis of unspecified deep veins of left lower extremity', category: 'dvt', laterality: 'left' },
  'I82.411': { desc: 'Acute embolism and thrombosis of right femoral vein', category: 'dvt', laterality: 'right' },
  'I82.412': { desc: 'Acute embolism and thrombosis of left femoral vein', category: 'dvt', laterality: 'left' },
  'I87.011': { desc: 'Postthrombotic syndrome with ulcer of right lower extremity', category: 'dvt', laterality: 'right' },
  'I87.012': { desc: 'Postthrombotic syndrome with ulcer of left lower extremity', category: 'dvt', laterality: 'left' },

  // AAA
  'I71.4':  { desc: 'Abdominal aortic aneurysm, without rupture', category: 'aaa' },
  'I71.3':  { desc: 'Abdominal aortic aneurysm, ruptured', category: 'aaa' },
  'I71.6':  { desc: 'Thoracoabdominal aortic aneurysm, without rupture', category: 'aaa' },

  // Wound / Diabetic Foot
  'E11.621': { desc: 'Type 2 diabetes mellitus with foot ulcer', category: 'wound' },
  'E11.622': { desc: 'Type 2 diabetes mellitus with other skin ulcer', category: 'wound' },
  'L97.511': { desc: 'Non-pressure chronic ulcer of other part of right foot limited to breakdown of skin', category: 'wound', laterality: 'right' },
  'L97.521': { desc: 'Non-pressure chronic ulcer of other part of left foot limited to breakdown of skin', category: 'wound', laterality: 'left' },
  'L03.115': { desc: 'Cellulitis of right lower limb', category: 'wound', laterality: 'right' },
  'L03.116': { desc: 'Cellulitis of left lower limb', category: 'wound', laterality: 'left' },

  // Dialysis
  'N18.6':  { desc: 'End stage renal disease', category: 'dialysis' },
  'Z99.2':  { desc: 'Dependence on renal dialysis', category: 'dialysis' },
  'T82.41XA': { desc: 'Breakdown (mechanical) of vascular dialysis catheter, initial encounter', category: 'dialysis' },
  'T82.49XA': { desc: 'Other complication of vascular dialysis catheter, initial encounter', category: 'dialysis' },

  // Common comorbidities
  'I10':    { desc: 'Essential (primary) hypertension', category: 'comorbidity' },
  'E78.5':  { desc: 'Dyslipidemia, unspecified', category: 'comorbidity' },
  'E11.9':  { desc: 'Type 2 diabetes mellitus without complications', category: 'comorbidity' },
  'E11.65': { desc: 'Type 2 diabetes mellitus with hyperglycemia', category: 'comorbidity' },
  'F17.210':{ desc: 'Nicotine dependence, cigarettes, uncomplicated', category: 'comorbidity' },
  'Z87.891':{ desc: 'Personal history of nicotine dependence', category: 'comorbidity' },
  'E66.01': { desc: 'Morbid (severe) obesity due to excess calories', category: 'comorbidity' },
  'I25.10': { desc: 'Atherosclerotic heart disease of native coronary artery without angina pectoris', category: 'comorbidity' },
};

// ─── CPT Code Database ──────────────────────────────────────────────────
export const CPT_DATABASE = {
  // E&M
  '99202': { desc: 'New patient, straightforward', category: 'E&M', rvu: 0.93 },
  '99203': { desc: 'New patient, low complexity', category: 'E&M', rvu: 1.6 },
  '99204': { desc: 'New patient, moderate complexity', category: 'E&M', rvu: 2.6 },
  '99205': { desc: 'New patient, high complexity', category: 'E&M', rvu: 3.5 },
  '99211': { desc: 'Established patient, minimal', category: 'E&M', rvu: 0.18 },
  '99212': { desc: 'Established patient, straightforward', category: 'E&M', rvu: 0.7 },
  '99213': { desc: 'Established patient, low complexity', category: 'E&M', rvu: 1.3 },
  '99214': { desc: 'Established patient, moderate complexity', category: 'E&M', rvu: 1.92 },
  '99215': { desc: 'Established patient, high complexity', category: 'E&M', rvu: 2.8 },

  // Vascular procedures
  '36245': { desc: 'Selective catheter placement, arterial, 1st order', category: 'catheter', rvu: 4.13 },
  '36246': { desc: 'Selective catheter placement, arterial, 2nd order', category: 'catheter', rvu: 5.32 },
  '37220': { desc: 'Revascularization, iliac, initial vessel; transluminal angioplasty', category: 'revascularization', rvu: 12.54 },
  '37221': { desc: 'Revascularization, iliac, initial vessel; with stent', category: 'revascularization', rvu: 14.67 },
  '37224': { desc: 'Revascularization, femoral/popliteal; transluminal angioplasty', category: 'revascularization', rvu: 13.87 },
  '37225': { desc: 'Revascularization, femoral/popliteal; with atherectomy', category: 'revascularization', rvu: 15.23 },
  '37226': { desc: 'Revascularization, femoral/popliteal; with stent', category: 'revascularization', rvu: 16.45 },
  '37227': { desc: 'Revascularization, femoral/popliteal; with atherectomy and stent', category: 'revascularization', rvu: 18.12 },
  '37228': { desc: 'Revascularization, tibial/peroneal; transluminal angioplasty', category: 'revascularization', rvu: 15.34 },
  '37229': { desc: 'Revascularization, tibial/peroneal; with atherectomy', category: 'revascularization', rvu: 17.56 },
  '37230': { desc: 'Revascularization, tibial/peroneal; with stent', category: 'revascularization', rvu: 18.78 },
  '37236': { desc: 'Open/percutaneous stent placement, initial artery', category: 'stent', rvu: 11.23 },
  '37238': { desc: 'Open/percutaneous stent placement, additional artery', category: 'stent', rvu: 5.67 },
  '35301': { desc: 'Thromboendarterectomy, carotid', category: 'endarterectomy', rvu: 25.34 },
  '35371': { desc: 'Thromboendarterectomy, common femoral', category: 'endarterectomy', rvu: 22.45 },
  '35556': { desc: 'Bypass graft, femoral-popliteal', category: 'bypass', rvu: 28.67 },
  '35566': { desc: 'Bypass graft, femoral-anterior tibial', category: 'bypass', rvu: 32.45 },
  '35583': { desc: 'Bypass graft, femoral-popliteal, in-situ vein', category: 'bypass', rvu: 30.12 },
  '36818': { desc: 'Arteriovenous anastomosis, direct', category: 'dialysis-access', rvu: 12.34 },
  '36819': { desc: 'Arteriovenous anastomosis, with bridge graft', category: 'dialysis-access', rvu: 14.56 },
  '36901': { desc: 'Dialysis circuit, with angioplasty', category: 'dialysis-access', rvu: 9.87 },
  '36902': { desc: 'Dialysis circuit, with stent', category: 'dialysis-access', rvu: 12.34 },

  // Diagnostic
  '93880': { desc: 'Duplex scan of extracranial arteries, complete bilateral', category: 'diagnostic', rvu: 3.14 },
  '93925': { desc: 'Duplex scan of lower extremity arteries, complete bilateral', category: 'diagnostic', rvu: 3.07 },
  '93926': { desc: 'Duplex scan of lower extremity arteries, limited', category: 'diagnostic', rvu: 1.93 },
  '93970': { desc: 'Duplex scan of extremity veins, complete bilateral', category: 'diagnostic', rvu: 2.56 },
  '93971': { desc: 'Duplex scan of extremity veins, unilateral or limited', category: 'diagnostic', rvu: 1.89 },
  '93978': { desc: 'Duplex scan of aorta, IVC, iliac vasculature', category: 'diagnostic', rvu: 2.78 },
};

// ─── Coding Engine ──────────────────────────────────────────────────────

/**
 * Suggest ICD-10 codes based on patient type and interview data
 */
export function suggestICD10(patientType, interviewData) {
  const suggestions = [];

  // Primary diagnosis based on patient type and findings
  if (patientType === 'pad') {
    const hasRestPain = interviewData.rest_pain?.checked || interviewData.night_pain?.checked;
    const hasWound = interviewData.open_wounds?.checked;
    const hasClaudication = interviewData.leg_pain_walking?.checked;
    // Try to determine laterality
    const painLoc = (interviewData.pain_location?.text || '').toLowerCase();
    const lat = painLoc.includes('right') ? 'right' : painLoc.includes('left') ? 'left' : painLoc.includes('bilat') ? 'bilateral' : null;

    if (hasWound) {
      suggestions.push({ code: lat === 'left' ? 'I70.241' : 'I70.231', confidence: 'high', reason: 'PAD with ulceration documented' });
    } else if (hasRestPain) {
      const code = lat === 'left' ? 'I70.222' : lat === 'right' ? 'I70.221' : 'I70.223';
      suggestions.push({ code, confidence: 'high', reason: 'Rest pain documented' });
    } else if (hasClaudication) {
      const code = lat === 'left' ? 'I70.212' : lat === 'right' ? 'I70.211' : 'I70.213';
      suggestions.push({ code, confidence: 'high', reason: 'Intermittent claudication documented' });
    }
  }

  if (patientType === 'carotid') {
    const hasTIA = interviewData.stroke_tia?.checked;
    suggestions.push({ code: 'I65.29', confidence: 'high', reason: 'Carotid stenosis evaluation' });
    if (hasTIA) {
      suggestions.push({ code: 'G45.9', confidence: 'high', reason: 'History of TIA' });
    }
  }

  if (patientType === 'venous') {
    const hasVaricose = interviewData.varicose_veins?.checked;
    const hasSwelling = interviewData.leg_swelling?.checked;
    if (hasVaricose) suggestions.push({ code: 'I83.90', confidence: 'high', reason: 'Varicose veins documented' });
    if (hasSwelling) suggestions.push({ code: 'I87.2', confidence: 'medium', reason: 'Chronic venous insufficiency suspected' });
  }

  if (patientType === 'aaa') {
    suggestions.push({ code: 'I71.4', confidence: 'high', reason: 'AAA evaluation' });
  }

  if (patientType === 'wound') {
    const hasDiabetes = interviewData.diabetes?.checked;
    if (hasDiabetes) {
      suggestions.push({ code: 'E11.621', confidence: 'high', reason: 'Diabetic foot ulcer' });
    }
    suggestions.push({ code: 'L97.511', confidence: 'medium', reason: 'Non-pressure chronic ulcer' });
  }

  if (patientType === 'dialysis') {
    suggestions.push({ code: 'N18.6', confidence: 'high', reason: 'ESRD' });
    suggestions.push({ code: 'Z99.2', confidence: 'high', reason: 'Dialysis dependence' });
  }

  if (patientType === 'dvt') {
    suggestions.push({ code: 'I82.401', confidence: 'high', reason: 'DVT evaluation' });
  }

  // Comorbidities from universal questions
  if (interviewData.hypertension?.checked) {
    suggestions.push({ code: 'I10', confidence: 'high', reason: 'Hypertension reported' });
  }
  if (interviewData.high_cholesterol?.checked) {
    suggestions.push({ code: 'E78.5', confidence: 'high', reason: 'Dyslipidemia reported' });
  }
  if (interviewData.diabetes?.checked) {
    suggestions.push({ code: 'E11.9', confidence: 'high', reason: 'Diabetes reported' });
  }
  if (interviewData.smoking_current?.checked) {
    suggestions.push({ code: 'F17.210', confidence: 'high', reason: 'Current smoker' });
  } else if (interviewData.smoking_history?.checked) {
    suggestions.push({ code: 'Z87.891', confidence: 'medium', reason: 'Former smoker' });
  }

  // Add descriptions
  return suggestions.map(s => ({
    ...s,
    description: ICD10_DATABASE[s.code]?.desc || 'Unknown',
  }));
}

/**
 * Suggest CPT codes based on patient type and visit context
 */
export function suggestCPT(patientType, interviewData, visitContext = {}) {
  const suggestions = [];
  const isNew = visitContext.newPatient || false;
  const problemCount = Object.values(interviewData).filter(v => v?.checked).length;

  // E&M level based on complexity
  if (isNew) {
    if (problemCount >= 8) suggestions.push({ code: '99204', confidence: 'high', reason: 'New patient, moderate-high complexity' });
    else if (problemCount >= 4) suggestions.push({ code: '99203', confidence: 'high', reason: 'New patient, low-moderate complexity' });
    else suggestions.push({ code: '99202', confidence: 'high', reason: 'New patient, straightforward' });
  } else {
    if (problemCount >= 8) suggestions.push({ code: '99215', confidence: 'medium', reason: 'Established, high complexity (verify with time/MDM)' });
    else if (problemCount >= 5) suggestions.push({ code: '99214', confidence: 'high', reason: 'Established, moderate complexity' });
    else suggestions.push({ code: '99213', confidence: 'high', reason: 'Established, low complexity' });
  }

  // Diagnostic studies likely to be ordered
  if (patientType === 'pad') {
    suggestions.push({ code: '93925', confidence: 'medium', reason: 'Arterial duplex for PAD evaluation' });
  }
  if (patientType === 'carotid') {
    suggestions.push({ code: '93880', confidence: 'high', reason: 'Carotid duplex study' });
  }
  if (patientType === 'venous') {
    suggestions.push({ code: '93970', confidence: 'medium', reason: 'Venous duplex study' });
  }
  if (patientType === 'aaa') {
    suggestions.push({ code: '93978', confidence: 'medium', reason: 'Aorta/iliac duplex study' });
  }
  if (patientType === 'dvt') {
    suggestions.push({ code: '93971', confidence: 'high', reason: 'Venous duplex for DVT evaluation' });
  }

  return suggestions.map(s => ({
    ...s,
    description: CPT_DATABASE[s.code]?.desc || 'Unknown',
    rvu: CPT_DATABASE[s.code]?.rvu || 0,
  }));
}

/**
 * Calculate total RVUs from selected CPT codes
 */
export function calculateRVU(selectedCodes) {
  return selectedCodes.reduce((total, code) => {
    return total + (CPT_DATABASE[code]?.rvu || 0);
  }, 0);
}
