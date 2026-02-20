/**
 * Clinical Scoring Systems for Vascular Surgery
 * 
 * Standardized scoring tools that auto-calculate from interview + exam data.
 * Results feed into note generation and coding suggestions.
 */

// ─── Rutherford Classification (PAD) ───────────────────────────────────
// The gold standard for PAD severity classification
export const RUTHERFORD = {
  name: 'Rutherford Classification',
  condition: 'pad',
  categories: [
    { grade: 0, category: 0, label: 'Asymptomatic', description: 'No symptoms, abnormal ABI only', icd10Hint: 'I70.219' },
    { grade: 1, category: 1, label: 'Mild Claudication', description: 'Completes treadmill test, AP after exercise >50mmHg but >25mmHg less than resting', icd10Hint: 'I70.211' },
    { grade: 1, category: 2, label: 'Moderate Claudication', description: 'Between mild and severe', icd10Hint: 'I70.212' },
    { grade: 1, category: 3, label: 'Severe Claudication', description: 'Cannot complete treadmill test, AP after exercise <50mmHg', icd10Hint: 'I70.213' },
    { grade: 2, category: 4, label: 'Ischemic Rest Pain', description: 'Rest pain, AP at rest <40mmHg, flat or barely pulsatile PVR', icd10Hint: 'I70.221' },
    { grade: 3, category: 5, label: 'Minor Tissue Loss', description: 'Nonhealing ulcer, focal gangrene with diffuse pedal ischemia', icd10Hint: 'I70.231' },
    { grade: 3, category: 6, label: 'Major Tissue Loss', description: 'Extending above TM level, functional foot no longer salvageable', icd10Hint: 'I70.261' },
  ],

  /**
   * Auto-suggest Rutherford category from interview answers
   */
  classify(answers) {
    // Major tissue loss
    if (answers.gangrene_above_tm || answers.unsalvageable_foot) return 6;
    // Minor tissue loss
    if (answers.wounds_present || answers.gangrene || answers.nonhealing_ulcer) return 5;
    // Rest pain
    if (answers.night_pain || answers.hang_leg || answers.pain_wakes) return 4;
    // Claudication severity
    if (answers.leg_pain_walking) {
      const distance = parseInt(answers.walking_distance) || 0;
      if (answers.walking_distance && distance > 0) {
        if (distance < 100) return 3; // Severe: <1 block
        if (distance < 400) return 2; // Moderate: 1-4 blocks
        return 1; // Mild: >4 blocks
      }
      return 2; // Default moderate if distance not specified
    }
    return 0; // Asymptomatic
  }
};

// ─── WIfI Classification (Wound/Ischemia/Foot Infection) ─────────────
// Society for Vascular Surgery threatened limb classification
export const WIFI = {
  name: 'WIfI Classification',
  condition: 'wound',
  components: {
    wound: {
      label: 'Wound',
      grades: [
        { grade: 0, description: 'No ulcer or gangrene' },
        { grade: 1, description: 'Small, shallow ulcer on distal leg or foot; no gangrene' },
        { grade: 2, description: 'Deeper ulcer with exposed bone/tendon/joint ± gangrene limited to digits' },
        { grade: 3, description: 'Extensive, deep ulcer involving forefoot/midfoot ± calcaneal involvement ± extensive gangrene' },
      ]
    },
    ischemia: {
      label: 'Ischemia',
      grades: [
        { grade: 0, description: 'ABI ≥0.80, TP ≥60mmHg' },
        { grade: 1, description: 'ABI 0.6-0.79, TP 40-59mmHg' },
        { grade: 2, description: 'ABI 0.4-0.59, TP 30-39mmHg' },
        { grade: 3, description: 'ABI ≤0.39, TP <30mmHg' },
      ]
    },
    footInfection: {
      label: 'Foot Infection',
      grades: [
        { grade: 0, description: 'No infection' },
        { grade: 1, description: 'Mild: local infection involving skin/subcutaneous tissue, erythema >0.5cm-≤2cm around ulcer' },
        { grade: 2, description: 'Moderate: local infection with erythema >2cm, or deeper abscess, osteomyelitis, septic arthritis' },
        { grade: 3, description: 'Severe: systemic (SIRS), sepsis' },
      ]
    }
  },

  /**
   * Calculate amputation risk from WIfI scores
   * Returns: very low, low, moderate, high
   */
  amputationRisk(w, i, fi) {
    const total = w + i + fi;
    if (total <= 2) return 'Very Low';
    if (total <= 4) return 'Low';
    if (total <= 6) return 'Moderate';
    return 'High';
  },

  /**
   * Benefit of revascularization
   */
  revascBenefit(w, i, fi) {
    if (i === 0) return 'None — adequate perfusion';
    if (i === 1 && w <= 1) return 'Low';
    if (i >= 2 && w >= 2) return 'High';
    return 'Moderate';
  }
};

// ─── CEAP Classification (Venous Disease) ───────────────────────────────
export const CEAP = {
  name: 'CEAP Classification',
  condition: 'venous',
  clinical: [
    { class: 'C0', description: 'No visible or palpable signs of venous disease' },
    { class: 'C1', description: 'Telangiectasias or reticular veins' },
    { class: 'C2', description: 'Varicose veins' },
    { class: 'C3', description: 'Edema' },
    { class: 'C4a', description: 'Pigmentation or eczema' },
    { class: 'C4b', description: 'Lipodermatosclerosis or atrophie blanche' },
    { class: 'C5', description: 'Healed venous ulcer' },
    { class: 'C6', description: 'Active venous ulcer' },
  ],
  etiology: [
    { code: 'Ec', description: 'Congenital' },
    { code: 'Ep', description: 'Primary' },
    { code: 'Es', description: 'Secondary (post-thrombotic)' },
    { code: 'En', description: 'No venous cause identified' },
  ],
  anatomy: [
    { code: 'As', description: 'Superficial veins' },
    { code: 'Ap', description: 'Perforator veins' },
    { code: 'Ad', description: 'Deep veins' },
    { code: 'An', description: 'No venous location identified' },
  ],
  pathophysiology: [
    { code: 'Pr', description: 'Reflux' },
    { code: 'Po', description: 'Obstruction' },
    { code: 'Pr,o', description: 'Reflux and obstruction' },
    { code: 'Pn', description: 'No venous pathophysiology identified' },
  ],

  classify(answers) {
    if (answers.active_ulcer) return 'C6';
    if (answers.healed_ulcer) return 'C5';
    if (answers.skin_changes_lipoderm) return 'C4b';
    if (answers.skin_changes_pigment || answers.eczema) return 'C4a';
    if (answers.leg_swelling) return 'C3';
    if (answers.varicose_veins) return 'C2';
    if (answers.spider_veins) return 'C1';
    return 'C0';
  }
};

// ─── Wagner Classification (Diabetic Foot Ulcers) ────────────────────
export const WAGNER = {
  name: 'Wagner Classification',
  condition: 'wound',
  grades: [
    { grade: 0, description: 'Intact skin, bony deformity / at risk foot' },
    { grade: 1, description: 'Superficial ulcer' },
    { grade: 2, description: 'Deep ulcer to tendon/bone/joint' },
    { grade: 3, description: 'Deep ulcer with abscess or osteomyelitis' },
    { grade: 4, description: 'Partial foot gangrene (forefoot or heel)' },
    { grade: 5, description: 'Whole foot gangrene requiring amputation' },
  ],

  classify(answers) {
    if (answers.whole_foot_gangrene) return 5;
    if (answers.partial_gangrene) return 4;
    if (answers.osteomyelitis || answers.abscess) return 3;
    if (answers.deep_ulcer) return 2;
    if (answers.superficial_ulcer || answers.wounds_present) return 1;
    return 0;
  }
};

// ─── SVS Reporting Standards for Carotid ─────────────────────────────
export const CAROTID_GRADING = {
  name: 'Carotid Stenosis Grading (NASCET)',
  condition: 'carotid',
  grades: [
    { range: '0%', description: 'Normal', recommendation: 'No intervention' },
    { range: '1-49%', description: 'Mild stenosis', recommendation: 'Medical management, risk factor modification' },
    { range: '50-69%', description: 'Moderate stenosis', recommendation: 'Consider CEA if symptomatic (NNT ~15)' },
    { range: '70-99%', description: 'Severe stenosis', recommendation: 'CEA recommended if symptomatic (NNT ~6), consider if asymptomatic with life expectancy >5yr' },
    { range: '100%', description: 'Total occlusion', recommendation: 'Medical management (no revascularization)' },
  ],
  symptomatic: [
    'Ipsilateral TIA within 6 months',
    'Ipsilateral stroke within 6 months',
    'Amaurosis fugax (transient monocular blindness)',
  ]
};

// ─── NIH Stroke Scale (NIHSS) ────────────────────────────────────────
export const NIHSS = {
  name: 'NIH Stroke Scale (NIHSS)',
  condition: 'carotid',
  description: 'Primary tool to quantify neurological deficits pre/post-op.',
  items: [
    { id: '1a', label: '1a. LOC Responsiveness', options: [{ v: 0, l: 'Alert' }, { v: 1, l: 'Drowsy' }, { v: 2, l: 'Stuporous' }, { v: 3, l: 'Coma' }] },
    { id: '1b', label: '1b. LOC Questions', options: [{ v: 0, l: 'Answers both correctly' }, { v: 1, l: 'Answers one correctly' }, { v: 2, l: 'Answers neither correctly' }] },
    { id: '1c', label: '1c. LOC Commands', options: [{ v: 0, l: 'Performs both correctly' }, { v: 1, l: 'Performs one correctly' }, { v: 2, l: 'Performs neither correctly' }] },
    { id: '2', label: '2. Best Gaze', options: [{ v: 0, l: 'Normal' }, { v: 1, l: 'Partial gaze palsy' }, { v: 2, l: 'Forced deviation' }] },
    { id: '3', label: '3. Visual', options: [{ v: 0, l: 'No visual loss' }, { v: 1, l: 'Partial hemianopia' }, { v: 2, l: 'Complete hemianopia' }, { v: 3, l: 'Bilateral hemianopia' }] },
    { id: '4', label: '4. Facial Palsy', options: [{ v: 0, l: 'Normal' }, { v: 1, l: 'Minor paralysis' }, { v: 2, l: 'Partial paralysis' }, { v: 3, l: 'Complete paralysis' }] },
    { id: '5', label: '5. Motor Arm', options: [{ v: 0, l: 'No drift' }, { v: 1, l: 'Drift' }, { v: 2, l: 'Some effort against gravity' }, { v: 3, l: 'No effort against gravity' }, { v: 4, l: 'No movement' }] },
    { id: '6', label: '6. Motor Leg', options: [{ v: 0, l: 'No drift' }, { v: 1, l: 'Drift' }, { v: 2, l: 'Some effort against gravity' }, { v: 3, l: 'No effort against gravity' }, { v: 4, l: 'No movement' }] },
    { id: '7', label: '7. Limb Ataxia', options: [{ v: 0, l: 'Absent' }, { v: 1, l: 'Present in one limb' }, { v: 2, l: 'Present in two limbs' }] },
    { id: '8', label: '8. Sensory', options: [{ v: 0, l: 'Normal' }, { v: 1, l: 'Mild-to-moderate loss' }, { v: 2, l: 'Severe to total loss' }] },
    { id: '9', label: '9. Best Language', options: [{ v: 0, l: 'No aphasia' }, { v: 1, l: 'Mild-to-moderate aphasia' }, { v: 2, l: 'Severe aphasia' }, { v: 3, l: 'Mute/Global aphasia' }] },
    { id: '10', label: '10. Dysarthria', options: [{ v: 0, l: 'Normal' }, { v: 1, l: 'Mild-to-moderate' }, { v: 2, l: 'Severe' }] },
    { id: '11', label: '11. Extinction/Inattention', options: [{ v: 0, l: 'No abnormality' }, { v: 1, l: 'Visual/tactile/spatial inattention' }, { v: 2, l: 'Profound hemi-inattention' }] },
  ],
  interpret(score) {
    if (score === 0) return 'No stroke symptoms';
    if (score <= 4) return 'Minor stroke';
    if (score <= 15) return 'Moderate stroke';
    if (score <= 20) return 'Moderate to severe stroke';
    return 'Severe stroke';
  }
};

// ─── ABI Interpretation ──────────────────────────────────────────────
export const ABI_INTERPRETATION = {
  name: 'Ankle-Brachial Index',
  ranges: [
    { min: 1.3, max: Infinity, interpretation: 'Non-compressible (calcified vessels — common in diabetics)', severity: 'abnormal' },
    { min: 1.0, max: 1.3, interpretation: 'Normal', severity: 'normal' },
    { min: 0.9, max: 1.0, interpretation: 'Borderline / Acceptable', severity: 'borderline' },
    { min: 0.7, max: 0.9, interpretation: 'Mild PAD', severity: 'mild' },
    { min: 0.5, max: 0.7, interpretation: 'Moderate PAD — typical claudication range', severity: 'moderate' },
    { min: 0.3, max: 0.5, interpretation: 'Severe PAD — rest pain likely', severity: 'severe' },
    { min: 0, max: 0.3, interpretation: 'Critical limb ischemia — tissue loss risk', severity: 'critical' },
  ],

  interpret(abi) {
    const val = parseFloat(abi);
    if (isNaN(val)) return null;
    return this.ranges.find(r => val >= r.min && val < r.max) || null;
  }
};

// ─── Diabetic Risk Scoring ───────────────────────────────────────────
export const DIABETIC_FOOT_RISK = {
  name: 'Diabetic Foot Risk Assessment',
  factors: [
    { id: 'neuropathy', label: 'Loss of protective sensation (neuropathy)', points: 1 },
    { id: 'deformity', label: 'Foot deformity (Charcot, bunions, hammertoes)', points: 1 },
    { id: 'pad', label: 'Peripheral arterial disease', points: 1 },
    { id: 'prior_ulcer', label: 'History of foot ulcer', points: 2 },
    { id: 'prior_amputation', label: 'History of amputation', points: 2 },
    { id: 'esrd', label: 'End-stage renal disease', points: 1 },
    { id: 'poor_glycemic', label: 'Poor glycemic control (A1C >9)', points: 1 },
  ],
  riskLevels: [
    { min: 0, max: 0, level: 'Low', followUp: 'Annual foot exam' },
    { min: 1, max: 2, level: 'Moderate', followUp: 'Every 3-6 months, patient education' },
    { min: 3, max: 4, level: 'High', followUp: 'Every 1-3 months, custom footwear' },
    { min: 5, max: Infinity, level: 'Very High', followUp: 'Every 1-2 months, multidisciplinary care' },
  ],

  score(answers) {
    let total = 0;
    this.factors.forEach(f => {
      if (answers[f.id]) total += f.points;
    });
    return {
      score: total,
      risk: this.riskLevels.find(r => total >= r.min && total <= r.max),
    };
  }
};

// ─── Export All Scoring Systems ──────────────────────────────────────
export const ALL_SCORING_SYSTEMS = {
  rutherford: RUTHERFORD,
  wifi: WIFI,
  ceap: CEAP,
  wagner: WAGNER,
  carotidGrading: CAROTID_GRADING,
  nihss: NIHSS,
  abi: ABI_INTERPRETATION,
  diabeticFootRisk: DIABETIC_FOOT_RISK,
};

/**
 * Get applicable scoring systems for a patient type
 */
export function getScoringForType(patientType) {
  const map = {
    pad: ['rutherford', 'abi'],
    venous: ['ceap'],
    carotid: ['carotidGrading', 'nihss'],
    wound: ['wifi', 'wagner', 'diabeticFootRisk', 'abi'],
    dialysis: [],
    aaa: [],
    dvt: ['ceap'],
  };
  return (map[patientType] || []).map(key => ALL_SCORING_SYSTEMS[key]);
}
