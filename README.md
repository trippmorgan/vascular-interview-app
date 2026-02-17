# Vascular Surgery Clinical Interview Guide

A professional Progressive Web App (PWA) designed for iPad to guide medical assistants through comprehensive vascular surgery clinical interviews.

## Features

- **7 Patient Types**: PAD, Venous Disease, Carotid Disease, Wound Care, Dialysis Access, AAA, and DVT/PE
- **Universal Questions**: Standardized medical/surgical history for all patients
- **Condition-Specific Interviews**: Tailored questions based on patient type
- **Physical Exam Documentation**: Interactive pulse examination, edema grading, and skin assessment
- **Quick Reference Panels**: Clinical decision thresholds, Big Five risk factors, patient education scripts, and red flags
- **Progress Tracking**: Visual indicator showing interview completion
- **Summary & Export**: Generate professional summaries, copy to clipboard, or print
- **PWA Support**: Install on iPad home screen, works offline

## Based on Real Clinical Data

This app is built from analysis of **275 real patient encounters**, ensuring the workflow matches actual clinical practice.

## Tech Stack

- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **PWA** - Service worker for offline functionality

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Development server:**
   ```bash
   npm run dev
   ```
   Runs on http://localhost:5173

3. **Production build:**
   ```bash
   npm run build
   ```
   Creates optimized build in `dist/` folder

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## iPad Installation

1. Open the app in Safari on your iPad
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will now work like a native app with offline support

## Usage

1. **Select Patient Type**: Choose from 7 vascular conditions
2. **Universal Questions**: Complete medical history (asked for all patients)
3. **Condition-Specific**: Answer specialized questions for the selected condition
4. **Physical Exam**: Document pulse examination, edema, and skin findings
5. **Quick Reference**: Access clinical thresholds and education scripts anytime
6. **Summary**: Generate and export completed interview

## Design Principles

- **Touch-Optimized**: 44px minimum touch targets for iPad use
- **Professional Medical UI**: Clean blue/gray color scheme
- **Readable**: Large fonts, high contrast
- **Collapsible Sections**: Manage long forms efficiently
- **Progress Indicators**: Always know where you are in the interview

## Clinical Content

### Universal Questions Include:
- Cardiovascular history (heart attack, stents, stroke, HTN, cholesterol)
- Metabolic/systemic (diabetes, smoking)
- Surgical history (standardized questions)
- Current medications (antiplatelets, anticoagulation, statins)

### Quick Reference Includes:
- **Carotid thresholds**: Stenosis percentages, PSV/EDV values
- **PAD (ABI)**: Normal/borderline/severe classifications
- **AAA sizing**: Surveillance vs surgical thresholds
- **Venous reflux**: Time and diameter criteria
- **The Big Five**: BP, diabetes, lipids, smoking, antiplatelet goals
- **Red Flags**: Acute limb ischemia, ruptured AAA, access thrombosis, etc.
- **Patient Education**: Layman's terms for complex medical concepts

## File Structure

```
vascular-interview-app/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icon.svg               # App icon
├── src/
│   ├── components/
│   │   ├── LandingScreen.jsx  # Patient type selector
│   │   ├── InterviewScreen.jsx # Main interview interface
│   │   ├── QuestionSection.jsx # Collapsible question groups
│   │   ├── QuickReference.jsx  # Reference panels
│   │   ├── PhysicalExam.jsx    # Pulse/edema/skin exam
│   │   └── Summary.jsx         # Export and summary view
│   ├── data/
│   │   └── interviewData.js   # All clinical content
│   ├── App.jsx                # Main app component
│   ├── App.css                # Global styles
│   ├── index.css              # Tailwind directives
│   └── main.jsx               # Entry point
└── README.md
```

## Customization

All clinical content is stored in `src/data/interviewData.js`. You can:
- Add new patient types
- Modify questions
- Update clinical thresholds
- Add new reference materials

## Browser Support

Optimized for:
- Safari on iPad (primary target)
- Safari on iPhone
- Chrome on tablets
- Modern mobile browsers

## License

This is a clinical tool. Use in accordance with your organization's policies and HIPAA requirements.

## Support

For issues or questions about the clinical content, refer to the original interview template (`INTERVIEW-TEMPLATE.md`) which was derived from 275 patient encounters.
