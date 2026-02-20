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

  // Wound - expanded L97.x by location/severity
  'L97.111': { desc: 'Non-pressure chronic ulcer of right thigh limited to breakdown of skin', category: 'wound', laterality: 'right' },
  'L97.121': { desc: 'Non-pressure chronic ulcer of left thigh limited to breakdown of skin', category: 'wound', laterality: 'left' },
  'L97.211': { desc: 'Non-pressure chronic ulcer of right calf limited to breakdown of skin', category: 'wound', laterality: 'right' },
  'L97.221': { desc: 'Non-pressure chronic ulcer of left calf limited to breakdown of skin', category: 'wound', laterality: 'left' },
  'L97.311': { desc: 'Non-pressure chronic ulcer of right ankle limited to breakdown of skin', category: 'wound', laterality: 'right' },
  'L97.321': { desc: 'Non-pressure chronic ulcer of left ankle limited to breakdown of skin', category: 'wound', laterality: 'left' },
  'L97.411': { desc: 'Non-pressure chronic ulcer of right heel and midfoot limited to breakdown of skin', category: 'wound', laterality: 'right' },
  'L97.421': { desc: 'Non-pressure chronic ulcer of left heel and midfoot limited to breakdown of skin', category: 'wound', laterality: 'left' },
  'L97.512': { desc: 'Non-pressure chronic ulcer of other part of right foot with fat layer exposed', category: 'wound', laterality: 'right' },
  'L97.522': { desc: 'Non-pressure chronic ulcer of other part of left foot with fat layer exposed', category: 'wound', laterality: 'left' },
  'L97.513': { desc: 'Non-pressure chronic ulcer of other part of right foot with necrosis of muscle', category: 'wound', laterality: 'right' },
  'L97.523': { desc: 'Non-pressure chronic ulcer of other part of left foot with necrosis of muscle', category: 'wound', laterality: 'left' },
  'L97.514': { desc: 'Non-pressure chronic ulcer of other part of right foot with necrosis of bone', category: 'wound', laterality: 'right' },
  'L97.524': { desc: 'Non-pressure chronic ulcer of other part of left foot with necrosis of bone', category: 'wound', laterality: 'left' },
  'L89.0':   { desc: 'Pressure ulcer of elbow', category: 'wound' },
  'L89.1':   { desc: 'Pressure ulcer of back', category: 'wound' },
  'L89.3':   { desc: 'Pressure ulcer of buttock', category: 'wound' },
  'L89.5':   { desc: 'Pressure ulcer of ankle', category: 'wound' },
  'L89.6':   { desc: 'Pressure ulcer of heel', category: 'wound' },

  // DVT/PE expanded
  'I82.421': { desc: 'Acute embolism and thrombosis of right iliac vein', category: 'dvt', laterality: 'right' },
  'I82.422': { desc: 'Acute embolism and thrombosis of left iliac vein', category: 'dvt', laterality: 'left' },
  'I82.431': { desc: 'Acute embolism and thrombosis of right popliteal vein', category: 'dvt', laterality: 'right' },
  'I82.432': { desc: 'Acute embolism and thrombosis of left popliteal vein', category: 'dvt', laterality: 'left' },
  'I82.441': { desc: 'Acute embolism and thrombosis of right tibial vein', category: 'dvt', laterality: 'right' },
  'I82.442': { desc: 'Acute embolism and thrombosis of left tibial vein', category: 'dvt', laterality: 'left' },
  'I26.99':  { desc: 'Other pulmonary embolism without acute cor pulmonale', category: 'dvt' },
  'I87.001': { desc: 'Postthrombotic syndrome without complications of right lower extremity', category: 'dvt', laterality: 'right' },
  'I87.002': { desc: 'Postthrombotic syndrome without complications of left lower extremity', category: 'dvt', laterality: 'left' },

  // Venous expanded
  'I83.10':  { desc: 'Varicose veins of unspecified lower extremity with inflammation', category: 'venous' },
  'I83.11':  { desc: 'Varicose veins of right lower extremity with inflammation', category: 'venous', laterality: 'right' },
  'I83.12':  { desc: 'Varicose veins of left lower extremity with inflammation', category: 'venous', laterality: 'left' },
  'I83.811': { desc: 'Varicose veins of right lower extremity with pain', category: 'venous', laterality: 'right' },
  'I83.812': { desc: 'Varicose veins of left lower extremity with pain', category: 'venous', laterality: 'left' },
  'I83.891': { desc: 'Varicose veins of right lower extremity with other complications', category: 'venous', laterality: 'right' },
  'I83.892': { desc: 'Varicose veins of left lower extremity with other complications', category: 'venous', laterality: 'left' },

  // Carotid expanded
  'G45.1':   { desc: 'Carotid artery syndrome (hemispheric)', category: 'carotid' },
  'G45.8':   { desc: 'Other transient cerebral ischemic attacks', category: 'carotid' },
  'I63.031': { desc: 'Cerebral infarction due to thrombosis of right carotid artery', category: 'carotid', laterality: 'right' },
  'I63.032': { desc: 'Cerebral infarction due to thrombosis of left carotid artery', category: 'carotid', laterality: 'left' },
  'H34.11':  { desc: 'Central retinal artery occlusion, right eye', category: 'carotid', laterality: 'right' },
  'H34.12':  { desc: 'Central retinal artery occlusion, left eye', category: 'carotid', laterality: 'left' },

  // PAD expanded
  'I70.219': { desc: 'Atherosclerosis of native arteries of extremities with intermittent claudication, unspecified leg', category: 'pad' },
  'I70.234': { desc: 'Atherosclerosis of native arteries of right leg with ulceration of heel and midfoot', category: 'pad', laterality: 'right' },
  'I70.244': { desc: 'Atherosclerosis of native arteries of left leg with ulceration of heel and midfoot', category: 'pad', laterality: 'left' },
  'I70.263': { desc: 'Atherosclerosis of native arteries of extremities with gangrene, bilateral', category: 'pad', laterality: 'bilateral' },

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

  // Venous ablation / RFA
  '36473': { desc: 'Endovenous ablation, mechanochemical; first vein treated', category: 'venous-procedure', rvu: 8.45 },
  '36474': { desc: 'Endovenous ablation, mechanochemical; subsequent vein', category: 'venous-procedure', rvu: 4.23 },
  '36475': { desc: 'Endovenous ablation, radiofrequency; first vein treated', category: 'venous-procedure', rvu: 9.12 },
  '36476': { desc: 'Endovenous ablation, radiofrequency; subsequent vein', category: 'venous-procedure', rvu: 4.56 },
  '36478': { desc: 'Endovenous ablation, laser; first vein treated', category: 'venous-procedure', rvu: 9.12 },
  '36479': { desc: 'Endovenous ablation, laser; subsequent vein', category: 'venous-procedure', rvu: 4.56 },

  // Varithena / sclerotherapy
  '36465': { desc: 'Injection of non-compounded foam sclerosant; single incompetent vein', category: 'venous-procedure', rvu: 5.67 },
  '36466': { desc: 'Injection of non-compounded foam sclerosant; multiple incompetent veins', category: 'venous-procedure', rvu: 7.89 },
  '36470': { desc: 'Injection of sclerosant; single incompetent vein', category: 'venous-procedure', rvu: 2.34 },
  '36471': { desc: 'Injection of sclerosant; multiple veins', category: 'venous-procedure', rvu: 3.45 },

  // Phlebectomy
  '37765': { desc: 'Stab phlebectomy of varicose veins, one extremity; 10-20', category: 'venous-procedure', rvu: 7.23 },
  '37766': { desc: 'Stab phlebectomy of varicose veins, one extremity; >20', category: 'venous-procedure', rvu: 9.45 },

  // Venography
  '36005': { desc: 'Injection procedure for extremity venography', category: 'venography', rvu: 2.12 },
  '75820': { desc: 'Venography, extremity, unilateral, radiological S&I', category: 'venography', rvu: 1.34 },

  // Dialysis access expanded
  '36820': { desc: 'AV anastomosis, forearm vein transposition', category: 'dialysis-access', rvu: 13.45 },
  '36821': { desc: 'AV anastomosis, upper arm vein transposition', category: 'dialysis-access', rvu: 14.78 },
  '36831': { desc: 'Thrombectomy, AV fistula without revision', category: 'dialysis-access', rvu: 10.23 },
  '36832': { desc: 'Revision, AV fistula', category: 'dialysis-access', rvu: 12.56 },
  '36833': { desc: 'Revision, AV fistula with thrombectomy', category: 'dialysis-access', rvu: 14.89 },
  '36903': { desc: 'Dialysis circuit, with transcatheter stent', category: 'dialysis-access', rvu: 14.56 },

  // Additional revascularization
  '37231': { desc: 'Revascularization, tibial/peroneal; with atherectomy and stent', category: 'revascularization', rvu: 20.12 },
  '37235': { desc: 'Revascularization, additional tibial/peroneal vessel', category: 'revascularization', rvu: 8.45 },
  '37237': { desc: 'Open/percutaneous stent placement, initial vein', category: 'stent', rvu: 10.12 },
  '37239': { desc: 'Open/percutaneous stent placement, additional vein', category: 'stent', rvu: 5.34 },

  // Carotid procedures
  '35302': { desc: 'Thromboendarterectomy, carotid with patch', category: 'endarterectomy', rvu: 27.56 },
  '37215': { desc: 'Transcatheter stent placement, cervical carotid artery', category: 'stent', rvu: 22.34 },
  '37216': { desc: 'Transcatheter stent placement, intrathoracic carotid/innominate', category: 'stent', rvu: 24.56 },

  // Wound debridement
  '97597': { desc: 'Debridement, open wound; first 20 sq cm', category: 'wound-care', rvu: 1.45 },
  '97598': { desc: 'Debridement, open wound; each additional 20 sq cm', category: 'wound-care', rvu: 0.67 },

  // IVC filter
  '37191': { desc: 'Insertion of IVC filter', category: 'dvt-procedure', rvu: 8.34 },
  '37192': { desc: 'Repositioning of IVC filter', category: 'dvt-procedure', rvu: 6.78 },
  '37193': { desc: 'Retrieval of IVC filter', category: 'dvt-procedure', rvu: 7.12 },

  // Thrombectomy/thrombolysis
  '37187': { desc: 'Percutaneous transluminal mechanical thrombectomy, venous', category: 'dvt-procedure', rvu: 12.34 },
  '37211': { desc: 'Transcatheter therapy, arterial infusion for thrombolysis, initial', category: 'revascularization', rvu: 6.78 },
  '37212': { desc: 'Transcatheter therapy, venous infusion for thrombolysis, initial', category: 'dvt-procedure', rvu: 6.78 },

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
 * Helper: extract laterality from interview data
 */
function detectLaterality(interviewData) {
  // Check multiple fields for laterality hints
  const fields = ['pain_location', 'swelling_bilateral', 'affected_side', 'wound_location', 'access_location'];
  for (const field of fields) {
    const val = (interviewData[field]?.text || interviewData[field]?.value || '').toLowerCase();
    if (val.includes('bilateral') || val.includes('both')) return 'bilateral';
    if (val.includes('right') && !val.includes('left')) return 'right';
    if (val.includes('left') && !val.includes('right')) return 'left';
  }
  // Check multiselect pain_location
  const painSel = interviewData.pain_location?.selected;
  if (Array.isArray(painSel)) {
    const joined = painSel.join(' ').toLowerCase();
    if (joined.includes('right')) return 'right';
    if (joined.includes('left')) return 'left';
  }
  return null;
}

/**
 * Suggest ICD-10 codes based on patient type and interview data
 */
export function suggestICD10(patientType, interviewData) {
  const suggestions = [];
  const lat = detectLaterality(interviewData);

  // ─── PAD ────────────────────────────────────────────────────
  if (patientType === 'pad') {
    const hasRestPain = interviewData.rest_pain?.checked || interviewData.night_pain?.checked || interviewData.pain_wakes?.checked || interviewData.hang_leg?.checked;
    const hasWound = interviewData.wounds_present?.text || interviewData.open_wounds?.checked;
    const hasClaudication = interviewData.leg_pain_walking?.checked;
    const hasGangrene = (interviewData.wounds_present?.text || '').toLowerCase().includes('gangrene');

    if (hasGangrene) {
      const code = lat === 'left' ? 'I70.262' : lat === 'bilateral' ? 'I70.263' : 'I70.261';
      suggestions.push({ code, confidence: 'high', reason: 'Gangrene documented' });
    } else if (hasWound) {
      suggestions.push({ code: lat === 'left' ? 'I70.241' : 'I70.231', confidence: 'high', reason: 'PAD with ulceration documented' });
    }
    if (hasRestPain) {
      const code = lat === 'left' ? 'I70.222' : lat === 'right' ? 'I70.221' : lat === 'bilateral' ? 'I70.223' : 'I70.221';
      suggestions.push({ code, confidence: hasWound ? 'medium' : 'high', reason: 'Rest pain documented' });
    }
    if (hasClaudication) {
      const code = lat === 'left' ? 'I70.212' : lat === 'right' ? 'I70.211' : lat === 'bilateral' ? 'I70.213' : 'I70.219';
      suggestions.push({ code, confidence: hasRestPain ? 'medium' : 'high', reason: 'Intermittent claudication documented' });
    }
    if (!hasGangrene && !hasWound && !hasRestPain && !hasClaudication) {
      suggestions.push({ code: 'I70.219', confidence: 'low', reason: 'PAD evaluation — specify symptoms for accurate coding' });
    }
  }

  // ─── Carotid ────────────────────────────────────────────────
  if (patientType === 'carotid') {
    const hasTIA = interviewData.tia_history?.checked || interviewData.stroke_tia?.checked;
    const hasStroke = interviewData.stroke_history?.checked;
    const hasVisionLoss = interviewData.vision_loss?.checked || interviewData.amaurosis_fugax?.text;
    const affectedSide = (interviewData.affected_side?.text || '').toLowerCase();
    const carotidLat = affectedSide.includes('right') ? 'right' : affectedSide.includes('left') ? 'left' : null;

    // Stenosis code based on laterality
    const stenosisCode = carotidLat === 'right' ? 'I65.21' : carotidLat === 'left' ? 'I65.22' : 'I65.29';
    suggestions.push({ code: stenosisCode, confidence: 'high', reason: 'Carotid stenosis evaluation' });

    if (hasStroke) {
      const strokeCode = carotidLat === 'right' ? 'I63.031' : carotidLat === 'left' ? 'I63.032' : 'I63.9';
      suggestions.push({ code: strokeCode, confidence: 'high', reason: 'History of stroke' });
    }
    if (hasTIA) {
      suggestions.push({ code: 'G45.9', confidence: 'high', reason: 'History of TIA' });
    }
    if (hasVisionLoss) {
      const eyeCode = carotidLat === 'right' ? 'H34.11' : carotidLat === 'left' ? 'H34.12' : 'H34.11';
      suggestions.push({ code: eyeCode, confidence: 'medium', reason: 'Amaurosis fugax / vision loss reported' });
    }
  }

  // ─── Venous ─────────────────────────────────────────────────
  if (patientType === 'venous') {
    const hasVaricose = interviewData.visible_veins?.checked || interviewData.varicose_veins?.checked;
    const hasSwelling = interviewData.leg_swelling?.checked;
    const hasPain = interviewData.legs_heavy?.checked || interviewData.veins_bother?.checked;
    const hasDiscoloration = interviewData.discoloration?.checked;
    const hasUlcer = interviewData.ulcers?.text;
    const hasLipo = interviewData.lipodermatosclerosis?.checked;
    const swellingLat = (interviewData.swelling_bilateral?.value || '').toLowerCase();
    const venousLat = swellingLat.includes('both') ? 'bilateral' : swellingLat.includes('right') ? 'right' : swellingLat.includes('left') ? 'left' : lat;

    if (hasUlcer) {
      const code = venousLat === 'left' ? 'I83.011' : 'I83.001';
      suggestions.push({ code, confidence: 'high', reason: 'Varicose veins with ulceration' });
    }
    if (hasVaricose && hasPain) {
      const code = venousLat === 'left' ? 'I83.812' : venousLat === 'right' ? 'I83.811' : 'I83.90';
      suggestions.push({ code, confidence: 'high', reason: 'Symptomatic varicose veins with pain' });
    } else if (hasVaricose) {
      const code = venousLat === 'left' ? 'I83.92' : venousLat === 'right' ? 'I83.91' : 'I83.90';
      suggestions.push({ code, confidence: 'high', reason: 'Varicose veins documented' });
    }
    if (hasSwelling || hasDiscoloration || hasLipo) {
      suggestions.push({ code: 'I87.2', confidence: hasDiscoloration ? 'high' : 'medium', reason: 'Chronic venous insufficiency' });
    }
    if (hasVaricose && (hasDiscoloration || hasLipo)) {
      const code = venousLat === 'left' ? 'I83.12' : venousLat === 'right' ? 'I83.11' : 'I83.10';
      suggestions.push({ code, confidence: 'medium', reason: 'Varicose veins with inflammation/skin changes' });
    }
  }

  // ─── AAA ────────────────────────────────────────────────────
  if (patientType === 'aaa') {
    const sizeText = (interviewData.size?.text || '').replace(/[^0-9.]/g, '');
    const size = parseFloat(sizeText);
    const hasIliac = interviewData.iliac_involvement?.checked;
    const hasPain = interviewData.abdominal_pain?.checked;

    suggestions.push({ code: 'I71.4', confidence: 'high', reason: `AAA${size ? ` (${size} cm)` : ''} — without rupture` });
    if (hasPain) {
      suggestions.push({ code: 'I71.3', confidence: 'low', reason: 'Abdominal pain present — rule out rupture' });
    }
    if (hasIliac) {
      suggestions.push({ code: 'I71.6', confidence: 'medium', reason: 'Iliac involvement noted' });
    }
  }

  // ─── Wound ──────────────────────────────────────────────────
  if (patientType === 'wound') {
    const hasDiabetes = interviewData.diabetes?.checked;
    const hasExposedBone = interviewData.exposed_structures?.checked;
    const woundLoc = (interviewData.wound_location?.text || '').toLowerCase();
    const isRight = woundLoc.includes('right');
    const isLeft = woundLoc.includes('left');
    const isFoot = woundLoc.includes('foot') || woundLoc.includes('toe');
    const isAnkle = woundLoc.includes('ankle');
    const isHeel = woundLoc.includes('heel');
    const isCalf = woundLoc.includes('calf');

    if (hasDiabetes) {
      suggestions.push({ code: isFoot || isHeel ? 'E11.621' : 'E11.622', confidence: 'high', reason: 'Diabetic ulcer' });
    }

    // Select wound code by location and severity
    if (hasExposedBone) {
      suggestions.push({ code: isLeft ? 'L97.524' : 'L97.514', confidence: 'high', reason: 'Wound with bone exposure' });
    } else if (isHeel) {
      suggestions.push({ code: isLeft ? 'L97.421' : 'L97.411', confidence: 'high', reason: 'Heel/midfoot ulcer' });
    } else if (isAnkle) {
      suggestions.push({ code: isLeft ? 'L97.321' : 'L97.311', confidence: 'high', reason: 'Ankle ulcer' });
    } else if (isCalf) {
      suggestions.push({ code: isLeft ? 'L97.221' : 'L97.211', confidence: 'high', reason: 'Calf ulcer' });
    } else if (isFoot) {
      suggestions.push({ code: isLeft ? 'L97.521' : 'L97.511', confidence: 'high', reason: 'Foot ulcer' });
    } else {
      suggestions.push({ code: 'L97.511', confidence: 'medium', reason: 'Non-pressure chronic ulcer — specify location' });
    }

    if (interviewData.foot_infections?.text) {
      suggestions.push({ code: isLeft ? 'L03.116' : 'L03.115', confidence: 'medium', reason: 'Cellulitis / infection history' });
    }
  }

  // ─── Dialysis ───────────────────────────────────────────────
  if (patientType === 'dialysis') {
    suggestions.push({ code: 'N18.6', confidence: 'high', reason: 'ESRD' });
    suggestions.push({ code: 'Z99.2', confidence: 'high', reason: 'Dialysis dependence' });

    const accessWorking = interviewData.access_working?.checked;
    const lowFlows = interviewData.low_flows?.checked;
    if (accessWorking === false || lowFlows) {
      suggestions.push({ code: 'T82.49XA', confidence: 'medium', reason: 'Access dysfunction reported' });
    }
  }

  // ─── DVT/PE ─────────────────────────────────────────────────
  if (patientType === 'dvt') {
    const hasDVT = interviewData.dvt_history?.checked;
    const hasPE = interviewData.pe_history?.checked;
    const dvtLat = lat;

    if (hasDVT !== false) {
      const code = dvtLat === 'left' ? 'I82.402' : 'I82.401';
      suggestions.push({ code, confidence: 'high', reason: 'DVT evaluation' });
    }
    if (hasPE) {
      suggestions.push({ code: 'I26.99', confidence: 'high', reason: 'Pulmonary embolism history' });
    }
    // Post-thrombotic syndrome if chronic
    const eventTiming = (interviewData.event_timing?.text || '').toLowerCase();
    if (eventTiming && (eventTiming.includes('year') || eventTiming.includes('month'))) {
      const ptsCode = dvtLat === 'left' ? 'I87.002' : 'I87.001';
      suggestions.push({ code: ptsCode, confidence: 'medium', reason: 'Consider post-thrombotic syndrome' });
    }
  }

  // ─── Comorbidities (all patient types) ──────────────────────
  if (interviewData.hypertension?.checked) {
    suggestions.push({ code: 'I10', confidence: 'high', reason: 'Hypertension reported' });
  }
  if (interviewData.high_cholesterol?.checked) {
    suggestions.push({ code: 'E78.5', confidence: 'high', reason: 'Dyslipidemia reported' });
  }
  if (interviewData.diabetes?.checked && patientType !== 'wound') {
    suggestions.push({ code: 'E11.9', confidence: 'high', reason: 'Diabetes reported' });
  }
  if (interviewData.smoking_current?.checked) {
    suggestions.push({ code: 'F17.210', confidence: 'high', reason: 'Current smoker' });
  } else if (interviewData.smoking_history?.checked) {
    suggestions.push({ code: 'Z87.891', confidence: 'medium', reason: 'Former smoker' });
  }
  if (interviewData.heart_attack?.checked || interviewData.cad?.text) {
    suggestions.push({ code: 'I25.10', confidence: 'medium', reason: 'Coronary artery disease' });
  }

  // Deduplicate by code
  const seen = new Set();
  const deduped = suggestions.filter(s => {
    if (seen.has(s.code)) return false;
    seen.add(s.code);
    return true;
  });

  return deduped.map(s => ({
    ...s,
    description: ICD10_DATABASE[s.code]?.desc || 'Unknown',
  }));
}

/**
 * Determine E&M level based on medical decision making complexity
 */
export function suggestEMLevel(patientType, interviewData, visitContext = {}) {
  const isNew = visitContext.newPatient || false;
  const problemCount = Object.values(interviewData).filter(v => v?.checked).length;
  const hasTextData = Object.values(interviewData).filter(v => v?.text && v.text.length > 10).length;
  const totalComplexity = problemCount + hasTextData;

  // Severity multiplier by patient type
  const severityBoost = {
    pad: interviewData.night_pain?.checked || interviewData.wounds_present?.text ? 2 : 0,
    carotid: interviewData.stroke_history?.checked || interviewData.tia_history?.checked ? 2 : 0,
    wound: interviewData.exposed_structures?.checked ? 2 : 1,
    dialysis: interviewData.low_flows?.checked ? 1 : 0,
    dvt: interviewData.pe_history?.checked ? 2 : 0,
    aaa: 1,
    venous: 0,
  }[patientType] || 0;

  const score = totalComplexity + severityBoost;

  if (isNew) {
    if (score >= 10) return { code: '99205', confidence: 'medium', reason: `New patient, high complexity (score: ${score})` };
    if (score >= 6) return { code: '99204', confidence: 'high', reason: `New patient, moderate complexity (score: ${score})` };
    if (score >= 3) return { code: '99203', confidence: 'high', reason: `New patient, low complexity (score: ${score})` };
    return { code: '99202', confidence: 'high', reason: 'New patient, straightforward' };
  } else {
    if (score >= 10) return { code: '99215', confidence: 'medium', reason: `Established, high complexity (score: ${score}) — verify with time/MDM` };
    if (score >= 6) return { code: '99214', confidence: 'high', reason: `Established, moderate complexity (score: ${score})` };
    if (score >= 3) return { code: '99213', confidence: 'high', reason: `Established, low complexity (score: ${score})` };
    return { code: '99212', confidence: 'high', reason: 'Established, straightforward' };
  }
}

/**
 * Suggest CPT codes based on patient type and visit context
 */
export function suggestCPT(patientType, interviewData, visitContext = {}) {
  const suggestions = [];

  // E&M level
  const em = suggestEMLevel(patientType, interviewData, visitContext);
  suggestions.push(em);

  // ─── PAD procedures ─────────────────────────────────────────
  if (patientType === 'pad') {
    suggestions.push({ code: '93925', confidence: 'medium', reason: 'Arterial duplex for PAD evaluation' });
    const hasRestPain = interviewData.night_pain?.checked || interviewData.pain_wakes?.checked;
    const hasWound = interviewData.wounds_present?.text;
    if (hasRestPain || hasWound) {
      suggestions.push({ code: '37224', confidence: 'medium', reason: 'Femoral/popliteal angioplasty — if intervention planned' });
      suggestions.push({ code: '37228', confidence: 'low', reason: 'Tibial angioplasty — if tibial disease present' });
    }
  }

  // ─── Carotid procedures ─────────────────────────────────────
  if (patientType === 'carotid') {
    suggestions.push({ code: '93880', confidence: 'high', reason: 'Carotid duplex study' });
    const symptomatic = interviewData.stroke_history?.checked || interviewData.tia_history?.checked || interviewData.vision_loss?.checked;
    if (symptomatic) {
      suggestions.push({ code: '35301', confidence: 'medium', reason: 'Carotid endarterectomy — if high-grade stenosis' });
    }
  }

  // ─── Venous procedures ──────────────────────────────────────
  if (patientType === 'venous') {
    suggestions.push({ code: '93970', confidence: 'medium', reason: 'Venous duplex study' });
    const hasVaricose = interviewData.visible_veins?.checked || interviewData.varicose_veins?.checked;
    const hasPain = interviewData.legs_heavy?.checked || interviewData.veins_bother?.checked;
    const hasUlcer = interviewData.ulcers?.text;
    const priorTx = interviewData.prior_treatment?.text;
    if (hasVaricose && (hasPain || hasUlcer)) {
      suggestions.push({ code: '36475', confidence: 'medium', reason: 'RFA ablation of GSV — if reflux confirmed' });
      suggestions.push({ code: '36465', confidence: 'low', reason: 'Varithena (foam sclerotherapy) — alternative to ablation' });
      suggestions.push({ code: '37765', confidence: 'low', reason: 'Stab phlebectomy — if branch varicosities' });
    }
    if (hasUlcer) {
      suggestions.push({ code: '36005', confidence: 'low', reason: 'Venography — if venous ulcer workup needed' });
    }
  }

  // ─── AAA procedures ─────────────────────────────────────────
  if (patientType === 'aaa') {
    suggestions.push({ code: '93978', confidence: 'medium', reason: 'Aorta/iliac duplex study' });
    const sizeText = (interviewData.size?.text || '').replace(/[^0-9.]/g, '');
    const size = parseFloat(sizeText);
    if (size >= 5.5) {
      suggestions.push({ code: '37236', confidence: 'medium', reason: `AAA ${size}cm ≥5.5 — stent graft likely indicated` });
    }
  }

  // ─── Wound procedures ──────────────────────────────────────
  if (patientType === 'wound') {
    suggestions.push({ code: '97597', confidence: 'medium', reason: 'Wound debridement' });
    suggestions.push({ code: '93925', confidence: 'medium', reason: 'Arterial duplex — assess perfusion' });
  }

  // ─── Dialysis procedures ───────────────────────────────────
  if (patientType === 'dialysis') {
    const accessType = (interviewData.access_type?.value || '').toLowerCase();
    const lowFlows = interviewData.low_flows?.checked;
    const accessWorking = interviewData.access_working?.checked;

    if (!interviewData.on_dialysis?.checked && !accessType) {
      // New access creation
      suggestions.push({ code: '36818', confidence: 'medium', reason: 'AVF creation — if new access needed' });
      suggestions.push({ code: '36821', confidence: 'low', reason: 'Upper arm AVF creation — alternative' });
    }
    if (lowFlows || accessWorking === false) {
      suggestions.push({ code: '36901', confidence: 'high', reason: 'Fistulogram with angioplasty — access dysfunction' });
      suggestions.push({ code: '36902', confidence: 'low', reason: 'Fistulogram with stent — if angioplasty insufficient' });
    }
    if (accessType.includes('graft') || accessType.includes('fistula')) {
      suggestions.push({ code: '36831', confidence: 'low', reason: 'Thrombectomy — if access clotted' });
    }
  }

  // ─── DVT/PE procedures ─────────────────────────────────────
  if (patientType === 'dvt') {
    suggestions.push({ code: '93971', confidence: 'high', reason: 'Venous duplex for DVT evaluation' });
    const hasPE = interviewData.pe_history?.checked;
    if (hasPE) {
      suggestions.push({ code: '37191', confidence: 'low', reason: 'IVC filter — if anticoagulation contraindicated' });
    }
    suggestions.push({ code: '37187', confidence: 'low', reason: 'Mechanical thrombectomy — if acute extensive DVT' });
  }

  return suggestions.map(s => ({
    ...s,
    description: CPT_DATABASE[s.code]?.desc || 'Unknown',
    rvu: CPT_DATABASE[s.code]?.rvu || 0,
  }));
}

/**
 * Suggest codes for MULTIPLE conditions simultaneously.
 * Returns { icd10: [ { code, description, confidence, reason, conditionType, conditionLabel } ], cpt: [...], emLevel: {...} }
 */
export function suggestMultiConditionCodes(conditionTypes, interviewData, visitContext = {}) {
  const allICD10 = [];
  const allCPT = [];
  const seenICD10 = new Set();
  const seenCPT = new Set();

  const conditionLabels = {
    pad: 'PAD', venous: 'Venous', carotid: 'Carotid', wound: 'Wound Care',
    dialysis: 'Dialysis Access', aaa: 'AAA', dvt: 'DVT/PE',
  };

  // Gather codes from each condition
  for (const condType of conditionTypes) {
    const icd10 = suggestICD10(condType, interviewData);
    for (const s of icd10) {
      if (!seenICD10.has(s.code)) {
        seenICD10.add(s.code);
        allICD10.push({ ...s, conditionType: condType, conditionLabel: conditionLabels[condType] || condType });
      }
    }

    const cpt = suggestCPT(condType, interviewData, visitContext);
    for (const s of cpt) {
      // For E&M codes, skip per-condition — we'll compute a unified one below
      if (s.code.startsWith('992')) continue;
      if (!seenCPT.has(s.code)) {
        seenCPT.add(s.code);
        allCPT.push({ ...s, conditionType: condType, conditionLabel: conditionLabels[condType] || condType });
      }
    }
  }

  // Unified E&M: multi-condition complexity boost
  const baseEM = suggestEMLevel(conditionTypes[0] || 'pad', interviewData, visitContext);
  const multiConditionBoost = Math.min(conditionTypes.length - 1, 3); // up to +3 levels of boost
  const emCodes = visitContext.newPatient
    ? ['99202', '99203', '99204', '99205']
    : ['99211', '99212', '99213', '99214', '99215'];
  const baseIdx = emCodes.indexOf(baseEM.code);
  const boostedIdx = Math.min(baseIdx + multiConditionBoost, emCodes.length - 1);
  const boostedEM = {
    code: emCodes[boostedIdx],
    confidence: multiConditionBoost > 0 ? 'high' : baseEM.confidence,
    reason: multiConditionBoost > 0
      ? `${conditionTypes.length} conditions — elevated MDM complexity`
      : baseEM.reason,
    description: CPT_DATABASE[emCodes[boostedIdx]]?.desc || 'Unknown',
    rvu: CPT_DATABASE[emCodes[boostedIdx]]?.rvu || 0,
    conditionType: '_em',
    conditionLabel: 'E&M',
  };

  return {
    icd10: allICD10,
    cpt: [boostedEM, ...allCPT],
    emLevel: boostedEM,
    conditionCount: conditionTypes.length,
  };
}

/**
 * Calculate total RVUs from selected CPT codes
 */
export function calculateRVU(selectedCodes) {
  return selectedCodes.reduce((total, code) => {
    return total + (CPT_DATABASE[code]?.rvu || 0);
  }, 0);
}
