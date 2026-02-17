// Clinical interview data extracted from 275 patient encounters

export const patientTypes = [
  { id: 'pad', name: 'Peripheral Arterial Disease (PAD)', icon: '🩸' },
  { id: 'venous', name: 'Venous Disease', icon: '🦵' },
  { id: 'carotid', name: 'Carotid Disease', icon: '🧠' },
  { id: 'wound', name: 'Wound Care / Diabetic Foot', icon: '🩹' },
  { id: 'dialysis', name: 'Dialysis Access', icon: '💉' },
  { id: 'aaa', name: 'Abdominal Aortic Aneurysm (AAA)', icon: '🏥' },
  { id: 'dvt', name: 'DVT/PE', icon: '🩸' }
];

export const universalQuestions = {
  opening: {
    title: 'Opening & Chief Complaint',
    questions: [
      { id: 'chief_complaint', text: 'Tell me what\'s going on', type: 'text' },
      { id: 'presenting_symptoms', text: 'Document presenting symptoms and chief concern', type: 'text' }
    ]
  },
  cardiovascular: {
    title: 'Cardiovascular History',
    questions: [
      { id: 'heart_attack', text: 'Have you ever had a heart attack?', type: 'checkbox' },
      { id: 'heart_stents', text: 'Do you have any heart stents?', type: 'checkbox' },
      { id: 'stroke_tia', text: 'Have you ever had a stroke or TIA?', type: 'checkbox' },
      { id: 'dvt_history', text: 'Have you ever had blood clots in your legs? (DVT)', type: 'checkbox' },
      { id: 'hypertension', text: 'Do you have high blood pressure?', type: 'checkbox' },
      { id: 'high_cholesterol', text: 'Do you have high cholesterol?', type: 'checkbox' },
      { id: 'cad', text: 'Document any coronary artery disease', type: 'text' }
    ]
  },
  metabolic: {
    title: 'Metabolic/Systemic',
    questions: [
      { id: 'diabetes', text: 'Do you have diabetes?', type: 'checkbox' },
      { id: 'diabetes_a1c', text: 'If yes: What\'s your hemoglobin A1C? What do your blood sugars run?', type: 'text' },
      { id: 'diabetes_insulin', text: 'Do you give yourself insulin shots or just take pills?', type: 'select', options: ['Diet controlled', 'Oral medications only', 'Insulin only', 'Insulin + oral medications'] },
      { id: 'smoking_current', text: 'Do you smoke?', type: 'checkbox' },
      { id: 'smoking_history', text: 'Have you ever smoked?', type: 'checkbox' },
      { id: 'smoking_details', text: 'If yes: Pack-years, when quit', type: 'text', placeholder: 'Pack-years, when quit' }
    ]
  },
  surgical: {
    title: 'Surgical History',
    questions: [
      { id: 'knee_hip_surgery', text: 'Have you had any surgery on your knees or hips?', type: 'checkbox' },
      { id: 'gallbladder', text: 'Do you still have your gallbladder?', type: 'checkbox' },
      { id: 'appendix', text: 'Do you still have your appendix?', type: 'checkbox' },
      { id: 'hysterectomy', text: 'Have you had a hysterectomy? / Do you still have your uterus?', type: 'checkbox' },
      { id: 'pregnancies', text: 'If applicable: Did you have babies? How many? C-sections or vaginal deliveries?', type: 'text' },
      { id: 'colonoscopy', text: 'Have you had a colonoscopy?', type: 'checkbox' },
      { id: 'colonoscopy_results', text: 'If yes: Was it normal? Did they remove any polyps?', type: 'text' }
    ]
  },
  medications: {
    title: 'Current Medications',
    questions: [
      { id: 'all_medications', text: 'Document all current medications', type: 'text' },
      { id: 'aspirin', text: 'Are you taking aspirin?', type: 'checkbox' },
      { id: 'plavix', text: 'Are you on Plavix (clopidogrel)?', type: 'checkbox' },
      { id: 'anticoagulation', text: 'Are you on any blood thinners like Coumadin or Eliquis?', type: 'select', options: ['None', 'Coumadin (Warfarin)', 'Eliquis (Apixaban)', 'Xarelto (Rivaroxaban)', 'Pradaxa (Dabigatran)', 'Lovenox (Enoxaparin)', 'Other'] },
      { id: 'statins', text: 'Are you on a cholesterol medicine?', type: 'checkbox' },
      { id: 'allergies', text: 'Document any medication allergies or side effects', type: 'text' }
    ]
  }
};

export const conditionSpecificQuestions = {
  pad: {
    name: 'Peripheral Arterial Disease (PAD)',
    description: 'Key identifier: Claudication, rest pain, wounds',
    sections: {
      claudication: {
        title: 'Claudication Questions',
        questions: [
          { id: 'leg_pain_walking', text: 'Do you get leg pain when you walk?', type: 'checkbox' },
          { id: 'walking_distance', text: 'How far can you walk before it bothers you? (distance in blocks/feet)', type: 'text' },
          { id: 'pain_location', text: 'Where does it hurt?', type: 'multiselect', options: ['Calf', 'Thigh', 'Buttock', 'Foot', 'Hip'] },
          { id: 'pain_relief', text: 'Does it go away when you stop walking?', type: 'checkbox' },
          { id: 'relief_time', text: 'How long does it take to go away when you rest?', type: 'text' }
        ]
      },
      restPain: {
        title: 'Rest Pain',
        questions: [
          { id: 'night_pain', text: 'Do you have pain in your feet at night when lying down?', type: 'checkbox' },
          { id: 'hang_leg', text: 'Do you have to hang your leg off the bed or sleep in a chair?', type: 'checkbox' },
          { id: 'pain_wakes', text: 'Does the pain wake you up?', type: 'checkbox' }
        ]
      },
      tissueLoss: {
        title: 'Tissue Loss/Wounds',
        questions: [
          { id: 'wounds_present', text: 'Document any wounds, ulcers, gangrene', type: 'text' },
          { id: 'wound_duration', text: 'How long have you had this wound/sore?', type: 'text' },
          { id: 'previous_amputations', text: 'Previous amputations or toe loss', type: 'text' }
        ]
      }
    }
  },
  venous: {
    name: 'Venous Disease',
    description: 'Key identifier: Swelling, varicose veins, heaviness',
    sections: {
      swelling: {
        title: 'Swelling',
        questions: [
          { id: 'leg_swelling', text: 'Do you have swelling in your legs/ankles?', type: 'checkbox' },
          { id: 'swelling_bilateral', text: 'Which leg(s) are affected?', type: 'select', options: ['Left only', 'Right only', 'Both legs'] },
          { id: 'swelling_timing', text: 'Is it worse at the end of the day?', type: 'checkbox' },
          { id: 'elevation_helps', text: 'Does it get better when you elevate your legs?', type: 'checkbox' }
        ]
      },
      pain: {
        title: 'Pain/Discomfort',
        questions: [
          { id: 'legs_heavy', text: 'Do your legs feel heavy or achy?', type: 'checkbox' },
          { id: 'symptom_timing', text: 'When do they bother you most?', type: 'multiselect', options: ['Morning', 'Afternoon', 'Evening', 'All day', 'After standing'] },
          { id: 'night_pain', text: 'Do you have pain at night?', type: 'checkbox' }
        ]
      },
      varicoseVeins: {
        title: 'Varicose Veins',
        questions: [
          { id: 'visible_veins', text: 'Visible bulging veins?', type: 'checkbox' },
          { id: 'veins_bother', text: 'Do they bother you?', type: 'checkbox' },
          { id: 'prior_treatment', text: 'Prior vein treatments?', type: 'text' }
        ]
      },
      skinChanges: {
        title: 'Skin Changes',
        questions: [
          { id: 'discoloration', text: 'Discoloration (hemosiderin staining)', type: 'checkbox' },
          { id: 'lipodermatosclerosis', text: 'Lipodermatosclerosis', type: 'checkbox' },
          { id: 'ulcers', text: 'Ulcers (active or healed)', type: 'text' }
        ]
      },
      compression: {
        title: 'Compression Therapy',
        questions: [
          { id: 'wears_compression', text: 'Are you wearing compression socks?', type: 'checkbox' },
          { id: 'compression_compliance', text: 'If yes: How often do you wear them?', type: 'select', options: ['Every day', 'Most days', 'Sometimes', 'Rarely', 'Never'] }
        ]
      }
    }
  },
  carotid: {
    name: 'Carotid Disease',
    description: 'Key identifier: Stenosis on imaging, stroke history',
    sections: {
      neurologic: {
        title: 'Neurologic Review',
        questions: [
          { id: 'stroke_history', text: 'Have you ever had a stroke?', type: 'checkbox' },
          { id: 'tia_history', text: 'Have you ever had a TIA (mini-stroke)?', type: 'checkbox' },
          { id: 'event_timing', text: 'If yes: When was it? (>2 years = asymptomatic for surgical purposes)', type: 'text' },
          { id: 'vision_loss', text: 'Have you had any episodes of vision loss?', type: 'checkbox' },
          { id: 'amaurosis_fugax', text: 'Did you lose vision in one eye temporarily? Like a shade coming down?', type: 'text' },
          { id: 'speech_trouble', text: 'Have you had trouble speaking?', type: 'checkbox' },
          { id: 'understanding_trouble', text: 'Any trouble understanding what others are saying?', type: 'checkbox' },
          { id: 'weakness', text: 'Any weakness in your arm or leg?', type: 'checkbox' },
          { id: 'affected_side', text: 'Which side was affected?', type: 'text' },
          { id: 'residual_deficits', text: 'Document residual deficits', type: 'text' }
        ]
      }
    }
  },
  wound: {
    name: 'Wound Care / Diabetic Foot',
    description: 'Key identifier: Ulcer, gangrene, tissue loss',
    sections: {
      woundAssessment: {
        title: 'Wound Assessment',
        questions: [
          { id: 'wound_location', text: 'Location of wound(s)', type: 'text' },
          { id: 'wound_duration', text: 'How long have you had this wound?', type: 'text' },
          { id: 'wound_cause', text: 'How did it start?', type: 'multiselect', options: ['Trauma', 'Spontaneous', 'Pressure', 'Surgical', 'Unknown'] },
          { id: 'wound_characteristics', text: 'Size, depth, appearance', type: 'text' },
          { id: 'wound_drainage', text: 'Drainage, odor, signs of infection', type: 'text' },
          { id: 'exposed_structures', text: 'Exposed bone or tendon', type: 'checkbox' }
        ]
      },
      neuropathy: {
        title: 'Neuropathy Assessment',
        questions: [
          { id: 'can_feel_feet', text: 'Can you feel your feet?', type: 'checkbox' },
          { id: 'prior_testing', text: 'Prior podiatry testing', type: 'text' },
          { id: 'numbness_tingling', text: 'Have you had any numbness or tingling?', type: 'checkbox' },
          { id: 'foot_infections', text: 'History of foot infections', type: 'text' },
          { id: 'previous_amputations', text: 'Previous amputations', type: 'text' }
        ]
      },
      diabeticHistory: {
        title: 'Diabetic History',
        questions: [
          { id: 'diabetes_duration', text: 'Diabetes duration', type: 'text' },
          { id: 'diabetes_control', text: 'What\'s your hemoglobin A1C? What do your blood sugars run?', type: 'text' },
          { id: 'insulin_vs_oral', text: 'Insulin vs oral medications', type: 'text' },
          { id: 'complications', text: 'Diabetic complications (retinopathy, nephropathy)', type: 'text' }
        ]
      }
    }
  },
  dialysis: {
    name: 'Dialysis Access',
    description: 'Key identifier: Renal failure, hemodialysis',
    sections: {
      accessHistory: {
        title: 'Access History',
        questions: [
          { id: 'on_dialysis', text: 'Are you on dialysis?', type: 'checkbox' },
          { id: 'dialysis_duration', text: 'How long have you been on dialysis?', type: 'text' },
          { id: 'access_type', text: 'Current access type', type: 'select', options: ['AV Fistula', 'AV Graft', 'Tunneled Catheter', 'Permacath'] },
          { id: 'access_location', text: 'Where is your access?', type: 'select', options: ['Left forearm', 'Right forearm', 'Left upper arm', 'Right upper arm', 'Left chest', 'Right chest'] },
          { id: 'previous_access', text: 'Previous access history (failed access, infections)', type: 'text' }
        ]
      },
      accessFunction: {
        title: 'Access Function',
        questions: [
          { id: 'access_working', text: 'Is your access working well?', type: 'checkbox' },
          { id: 'dialysis_quality', text: 'Does it dialyze well? Do they have trouble sticking you?', type: 'text' },
          { id: 'low_flows', text: 'Have they told you the flows are low?', type: 'checkbox' },
          { id: 'symptoms', text: 'Is there any pain, swelling, redness?', type: 'text' },
          { id: 'thrill_bruit', text: 'Document thrill (palpation) and bruit (auscultation)', type: 'text' }
        ]
      }
    }
  },
  aaa: {
    name: 'Abdominal Aortic Aneurysm (AAA)',
    description: 'Key identifier: Enlarged aorta on imaging',
    sections: {
      symptoms: {
        title: 'Symptom Assessment',
        questions: [
          { id: 'abdominal_pain', text: 'Do you have any abdominal or back pain?', type: 'checkbox' },
          { id: 'pulsation', text: 'Have you felt any pulsation in your belly?', type: 'checkbox' },
          { id: 'other_aneurysms', text: 'History of other aneurysms (iliac, popliteal, thoracic)', type: 'text' }
        ]
      },
      riskFactors: {
        title: 'Risk Factors',
        questions: [
          { id: 'family_history', text: 'Family history of AAA', type: 'checkbox' },
          { id: 'smoking', text: 'Smoking history (strongest risk factor)', type: 'text' }
        ]
      },
      characteristics: {
        title: 'Aneurysm Characteristics',
        questions: [
          { id: 'size', text: 'Size (cm) - <5.5 cm: Surveillance / ≥5.5 cm: Surgery', type: 'text' },
          { id: 'growth_rate', text: 'Growth rate (if serial imaging available)', type: 'text' },
          { id: 'iliac_involvement', text: 'Iliac involvement', type: 'checkbox' }
        ]
      }
    }
  },
  dvt: {
    name: 'DVT/PE',
    description: 'Deep Vein Thrombosis / Pulmonary Embolism',
    sections: {
      history: {
        title: 'History of VTE',
        questions: [
          { id: 'dvt_history', text: 'Have you ever had blood clots in your legs?', type: 'checkbox' },
          { id: 'pe_history', text: 'Have you ever had a pulmonary embolism (blood clot in the lung)?', type: 'checkbox' },
          { id: 'event_timing', text: 'When did it occur?', type: 'text' },
          { id: 'provoked', text: 'Was this event provoked or unprovoked?', type: 'select', options: ['Provoked (surgery/trauma/immobility)', 'Unprovoked', 'Unknown'] },
          { id: 'anticoagulation_history', text: 'Were you on blood thinners? For how long?', type: 'text' }
        ]
      },
      currentAnticoagulation: {
        title: 'Current Anticoagulation',
        questions: [
          { id: 'current_anticoagulation', text: 'Are you currently on blood thinners?', type: 'checkbox' },
          { id: 'anticoagulation_type', text: 'Which blood thinner?', type: 'select', options: ['None', 'Coumadin (Warfarin)', 'Eliquis (Apixaban)', 'Xarelto (Rivaroxaban)', 'Pradaxa (Dabigatran)', 'Lovenox (Enoxaparin)', 'Other'] },
          { id: 'duration_planned', text: 'Duration planned', type: 'text' },
          { id: 'bleeding_complications', text: 'Any bleeding complications', type: 'text' }
        ]
      }
    }
  }
};

export const physicalExamTemplate = {
  pulses: {
    title: 'Pulse Examination (Bilateral)',
    locations: [
      { id: 'femoral', name: 'Femoral', left: null, right: null },
      { id: 'popliteal', name: 'Popliteal', left: null, right: null },
      { id: 'dorsalis_pedis', name: 'Dorsalis Pedis (DP)', left: null, right: null },
      { id: 'posterior_tibial', name: 'Posterior Tibial (PT)', left: null, right: null }
    ],
    options: ['Present', 'Absent', 'Dopplerable']
  },
  edema: {
    title: 'Edema Grading',
    options: ['None', '1+', '2+', '3+', '4+'],
    bilateral: true
  },
  skin: {
    title: 'Skin Assessment',
    checks: [
      { id: 'hair_loss', text: 'Hair loss on legs/feet', type: 'checkbox' },
      { id: 'pallor', text: 'Pallor', type: 'checkbox' },
      { id: 'rubor', text: 'Rubor', type: 'checkbox' },
      { id: 'cyanosis', text: 'Cyanosis', type: 'checkbox' },
      { id: 'cool_temp', text: 'Cool temperature', type: 'checkbox' },
      { id: 'capillary_refill', text: 'Capillary refill >2 seconds', type: 'checkbox' },
      { id: 'trophic_changes', text: 'Trophic changes (shiny skin, nail changes)', type: 'checkbox' }
    ]
  }
};

export const quickReference = {
  carotidThresholds: {
    title: 'Carotid Disease Thresholds',
    items: [
      { label: '<50% stenosis', value: 'Medical management only' },
      { label: '50-80% stenosis', value: 'CEA if symptomatic' },
      { label: '≥80% stenosis', value: 'CEA indicated' },
      { label: 'PSV 125', value: '>50% stenosis' },
      { label: 'EDV 125', value: '>80% stenosis' }
    ]
  },
  padThresholds: {
    title: 'PAD (ABI Values)',
    items: [
      { label: '>1.0', value: 'Normal' },
      { label: '0.9-1.0', value: 'Borderline' },
      { label: '<0.9', value: 'PAD diagnosed' },
      { label: '<0.5', value: 'Severe PAD, consider revascularization' },
      { label: '<0.4', value: 'Critical limb ischemia' }
    ]
  },
  aaaThresholds: {
    title: 'AAA Size Criteria',
    items: [
      { label: '<5.5 cm', value: 'Surveillance' },
      { label: '≥5.5 cm', value: 'Repair indicated' },
      { label: 'Growth >0.5 cm/year', value: 'Consider earlier repair' }
    ]
  },
  venousThresholds: {
    title: 'Venous Reflux',
    items: [
      { label: 'Reflux time <2 sec', value: 'Normal' },
      { label: 'Reflux time >2 sec', value: 'Pathologic reflux' },
      { label: 'Diameter/flow <500', value: 'Normal' },
      { label: 'Diameter/flow >500', value: 'Dilated' }
    ]
  },
  bigFive: {
    title: 'The Big Five Risk Factors',
    items: [
      { label: 'Blood Pressure', value: 'Target <140/80 mmHg' },
      { label: 'Diabetes', value: 'Target A1c <6.5-7.0%' },
      { label: 'Lipids', value: 'High-dose statin, LDL <70' },
      { label: 'Smoking', value: 'Cessation (single most important)' },
      { label: 'Antiplatelet', value: 'Aspirin 81mg or Plavix 75mg' }
    ]
  },
  redFlags: {
    title: 'Red Flags / Urgent Situations',
    items: [
      'Acute limb ischemia (6 P\'s: Pain, Pallor, Pulselessness, Paresthesia, Paralysis, Poikilothermia)',
      'Symptomatic carotid stenosis ≥80% - immediate CTA needed',
      'Ruptured AAA: Severe abdominal/back pain + hypotension',
      'Infected graft: Fever + drainage from incision',
      'Access thrombosis: No thrill/bruit in dialysis access',
      'Acute DVT: Unilateral leg swelling + pain'
    ]
  },
  patientEducation: {
    title: 'Patient Education Scripts',
    items: [
      { term: 'Atherosclerosis', explanation: 'Plaque buildup in your arteries, like rust in pipes' },
      { term: 'Stenosis', explanation: 'Narrowing or blockage (use percentages)' },
      { term: 'Aneurysm', explanation: 'Ballooning or enlarged artery' },
      { term: 'Reflux', explanation: 'Vein flowing the wrong way' },
      { term: 'Claudication', explanation: 'Leg pain when walking due to not enough blood flow' },
      { term: 'ABI', explanation: 'Comparing the blood pressure in your ankle to your arm' },
      { term: 'Venous Ablation', explanation: 'We give you medicine to make you sleepy, put an IV in, insert a small probe. The probe burns the inside of the vein and closes it off so blood reroutes properly' },
      { term: 'Carotid Endarterectomy', explanation: 'Cleaning out the plaque from your carotid artery' }
    ]
  }
};
