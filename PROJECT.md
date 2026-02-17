# Vascular Clinical Intake System

**Combined: Interview App + PLAUD Templates + Clinical Pipeline + Coding**

## Vision

One iPad app that handles the entire patient intake workflow:

```
MA Selects Patient Type → Guided Interview → Physical Exam → Summary → Suggested Codes → Pipeline
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    iPad PWA (React)                          │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Patient   │→│ Interview │→│ Physical  │→│  Summary +  │ │
│  │ Selector  │  │ Questions │  │   Exam    │  │  Coding    │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
│       ↕              ↕             ↕              ↕         │
│  PLAUD Template   Record +     Document       ICD-10 +     │
│  Auto-Select     Transcribe    Findings       CPT Suggest  │
└─────────────────────────────┬───────────────────────────────┘
                              │ Submit
                              ▼
                 ┌──────────────────────┐
                 │  Claude Team API     │
                 │  PHI Store → Preop   │
                 │  Note → Review Queue │
                 └──────────────────────┘
```

## Phases

### Phase 1: Coding Engine (NOW)
- [x] Interview questions (7 patient types)
- [x] Physical exam documentation
- [x] Summary generation
- [ ] ICD-10 suggestion engine based on interview answers
- [ ] CPT suggestion engine based on procedures/encounters
- [ ] Coding summary panel with confidence indicators
- [ ] E&M level calculator (time + MDM complexity)

### Phase 2: PLAUD Integration
- [ ] PLAUD template auto-select based on patient type
- [ ] QR code / deep link to start PLAUD recording with correct template
- [ ] Side-by-side: app checklist + PLAUD recording status
- [ ] Post-visit: merge PLAUD transcription with structured data

### Phase 3: Pipeline Connection
- [ ] Submit button → POST to Claude Team API
- [ ] Structured JSON → PHI store seeding
- [ ] Auto-trigger preop note generation
- [ ] Status indicator (submitted → processing → ready for review)

### Phase 4: Enhanced Coding
- [ ] Historical coding patterns from patient notes database
- [ ] Modifier suggestions (e.g., -59, -25, -LT/-RT)
- [ ] RVU calculator and reimbursement estimates
- [ ] Coding audit warnings (unbundling, medical necessity)

## ICD-10 Mapping (Condition → Codes)

### PAD
| Finding | ICD-10 | Description |
|---------|--------|-------------|
| Claudication | I70.211-I70.219 | Atherosclerosis of native arteries of extremities with intermittent claudication |
| Rest pain | I70.221-I70.229 | Atherosclerosis with rest pain |
| Ulceration | I70.231-I70.249 | Atherosclerosis with ulceration |
| Gangrene | I70.261-I70.269 | Atherosclerosis with gangrene |
| Critical limb ischemia | I70.92 | Unspecified atherosclerosis of native arteries, other extremities |

### Carotid
| Finding | ICD-10 | Description |
|---------|--------|-------------|
| Carotid stenosis | I65.21-I65.29 | Occlusion and stenosis of carotid artery |
| Asymptomatic | I65.29 | Occlusion and stenosis of unspecified carotid artery |
| Symptomatic (TIA) | G45.9 | Transient cerebral ischemic attack, unspecified |

### Venous
| Finding | ICD-10 | Description |
|---------|--------|-------------|
| Varicose veins | I83.90 | Asymptomatic varicose veins of unspecified lower extremity |
| Venous insufficiency | I87.2 | Venous insufficiency (chronic)(peripheral) |
| DVT | I82.401-I82.499 | Acute embolism and thrombosis of deep veins |
| Post-thrombotic syndrome | I87.001-I87.099 | Postthrombotic syndrome |

### AAA
| Finding | ICD-10 | Description |
|---------|--------|-------------|
| AAA without rupture | I71.4 | Abdominal aortic aneurysm, without rupture |
| Thoracoabdominal | I71.6 | Thoracoabdominal aortic aneurysm, without rupture |

### Wound/Diabetic Foot
| Finding | ICD-10 | Description |
|---------|--------|-------------|
| Diabetic foot ulcer | E11.621 | Type 2 DM with foot ulcer |
| Non-pressure chronic ulcer | L97.x | Non-pressure chronic ulcer of lower limb |
| Cellulitis | L03.115-L03.116 | Cellulitis of lower limb |

### Dialysis Access
| Finding | ICD-10 | Description |
|---------|--------|-------------|
| AV fistula complication | T82.41XA | Breakdown of vascular dialysis catheter |
| CKD Stage 5 | N18.6 | End stage renal disease |
| Dialysis encounter | Z99.2 | Dependence on renal dialysis |

## CPT Mapping (Procedures)

### Office Visits (E&M)
| Level | CPT | Description | Typical Use |
|-------|-----|-------------|-------------|
| Low | 99213 | Established, low complexity | Follow-up, stable |
| Moderate | 99214 | Established, moderate | New complaint, workup |
| High | 99215 | Established, high complexity | Multiple problems, complex |
| New Low | 99202 | New patient, straightforward | Simple referral |
| New Moderate | 99203 | New patient, low complexity | Standard new patient |
| New High | 99204 | New patient, moderate | Complex new patient |

### Vascular Procedures
| CPT | Description |
|-----|-------------|
| 36245-36248 | Selective catheter placement |
| 37220-37235 | Revascularization (iliac, fem-pop, tibial) |
| 37236-37239 | Stent placement |
| 35301-35390 | Endarterectomy |
| 35556-35671 | Bypass grafts |
| 36901-36906 | Dialysis access procedures |
| 36818-36821 | AV fistula creation |
| 93880 | Duplex scan of extracranial arteries |
| 93925-93926 | Duplex scan of lower extremity arteries |
| 93970-93971 | Duplex scan of extremity veins |

### Modifiers
| Modifier | Description | When to Use |
|----------|-------------|-------------|
| -25 | Significant, separately identifiable E&M | E&M same day as procedure |
| -59 | Distinct procedural service | Unbundling |
| -LT/-RT | Left/Right | Laterality |
| -50 | Bilateral | Both sides same procedure |
| -76 | Repeat procedure by same physician | Re-intervention |
| -XE/XS/XP/XU | Distinct encounter/structure/practitioner/service | NCCI modifiers |
