import { useState } from 'react';

const AI_URLS = [
  'http://10.66.19.163:8888/api/chat',          // Office proxy (Precision)
  'http://100.101.184.20:11434/v1/chat/completions',  // Direct Voldemort (Tailscale)
  'http://192.168.0.125:11434/v1/chat/completions',   // Direct Voldemort (home LAN)
];

const VascularReportAssistant = ({ onBack }) => {
  const [examType, setExamType] = useState('');
  const [measurements, setMeasurements] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customCriteria, setCustomCriteria] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  // History fields
  const [studyType, setStudyType] = useState('baseline');
  const [interventionDate, setInterventionDate] = useState('');
  const [interventionDetails, setInterventionDetails] = useState('');
  const [priorExamDate, setPriorExamDate] = useState('');
  const [priorFindings, setPriorFindings] = useState('');

  const defaultCriteria = `CAROTID ICA STENOSIS CRITERIA:
- Normal: PSV <125 cm/s, no spectral broadening, no plaque
- 0-49%: PSV <125 cm/s (even if EDV >40 cm/s), spectral broadening, plaque present
- 50-79%: PSV >125 cm/s AND EDV <125 cm/s, significant spectral broadening, plaque present
- 80-99%: EDV >125 cm/s (ONLY criterion for 80-99%), significant spectral broadening, plaque present
- Occlusion: No ICA flow, high resistance CCA flow signal on baseline

LOWER EXTREMITY ARTERIAL STENOSIS CRITERIA:
- Normal/0-49%: PSV 40-100 cm/s, triphasic waveform, minimal spectral broadening
- 50-70%: PSV >180 cm/s OR ≥100% above proximal normal segment; loss of flow reversal, marked spectral broadening
- 70-99%: PSV >300 cm/s OR ≥3.5x proximal normal segment; pre-stenotic resistance or pre-occlusive signal
- Occlusion: No flow detected OR <40 cm/s distal to occlusion; pre-occlusive thump proximally, monophasic distally

ABI INTERPRETATION:
- Normal: 0.90-1.2
- Mild to moderate PAD: 0.71-0.89
- Moderately severe PAD: 0.41-0.70
- Severe or advanced PAD: 0.0-0.40

TBI INTERPRETATION:
- Normal: >0.70
- Mild to moderate PAD: 0.50-0.70
- Moderately severe PAD: 0.35-0.50
- Severe or advanced PAD: <0.35

TOE PRESSURE INTERPRETATION:
- <30 mmHg: Severe ischemia
- >50 mmHg: High probability of wound healing

VENOUS REFLUX CRITERIA:
- GSV ablation criteria (ALL THREE required):
  1. SFJ reflux >500 msec AND
  2. Proximal thigh measurement ≥5.5 mm (if ablated/absent, does NOT qualify) AND
  3. At least 3 SEPARATE levels where reflux is measured AND exceeds 500 msec
- SSV ablation criteria (BOTH required):
  1. At least one measurement ≥3.0 mm at any level AND
  2. At least 2 SEPARATE levels where reflux is measured AND exceeds 500 msec
- Perforator incompetence: >3.5 mm with >500 msec reflux
- Deep system reflux threshold: >1000 msec

LOWER EXTREMITY VEIN GRAFT STENOSIS CRITERIA:
- 50-70%: PSV >180 cm/s OR 2x adjacent normal segment
- 70-99%: PSV >300 cm/s; distal PSV <40 cm/s (unless to pedal)
- Occlusion: No flow detected OR <40 cm/s distal to occlusion
- Graft failure: Average flow volume <50 ml/min

RENAL ARTERY STENOSIS CRITERIA:
- Normal kidney length: ≥9 cm
- Normal aortic velocity: 50-100 cm/s (use for RAR calculation only if in this range)
- Normal (<60% stenosis): RAR <3.5
- Moderate stenosis: RAR <3.5 but PSV >200 cm/s (use phrase "Possible moderate renal artery stenosis")
- High-grade stenosis (>60%): RAR ≥3.5 (use phrase "High-grade renal artery stenosis")
- Normal renal resistive index (RI): <0.8
- DO NOT calculate RAR if aortic velocity is outside 50-100 cm/s range

DIALYSIS ACCESS (AVF/AVG) CRITERIA:
- Normal inflow artery: PSV 40-200 cm/s
- Abnormal flow volume: <450 ml/min OR decrease from prior exam
- Abnormal anastomotic velocity: >400 cm/s OR <100 cm/s OR ratio >3:1 compared to inflow artery

ANEURYSM CRITERIA:
- Abdominal aorta: >3.0 cm AP
- Iliac arteries: >2.5 cm AP (ectatic if >1.4 cm)
- Femoral artery: >2.0 cm AP
- Popliteal artery: >2.0 cm AP
- Peripheral arteries: >1.5x adjacent normal segment`;

  const systemPrompt = `You are an AI assistant helping vascular ultrasound sonographers draft technical preliminary reports. Your role is strictly limited to:

1. Converting measurements and observations into standardized descriptive language
2. Following SVS (Society for Vascular Surgery) standards and custom clinic criteria
3. Providing ONLY technical/sonographic findings - NO clinical interpretations or recommendations
4. Using consistent medical terminology and formatting
5. Being CONCISE - include only the specific findings the physician needs, avoid unnecessary details

CRITICAL BOUNDARIES:
- Never provide diagnostic conclusions (e.g., don't say "stenosis present" - instead "elevated velocities suggestive of stenosis")
- Never make clinical recommendations
- Never suggest treatment or management
- All output should be labeled as "PRELIMINARY TECHNICAL FINDINGS"
- Include standard disclaimer: "Final interpretation pending physician review"

EXAM-SPECIFIC REPORTING GUIDELINES (BE CONCISE - ONLY REPORT WHAT'S SPECIFIED):

CAROTID DUPLEX:
- ICA stenosis: Report degree for each side separately using HIGHEST PSV and HIGHEST EDV measured anywhere in the ICA (proximal, mid, or distal)
- CRITICAL STENOSIS GRADING (apply these rules exactly):
  * 0-49%: Highest ICA PSV <125 cm/s (regardless of EDV - even if EDV >40 cm/s, if PSV <125 it's still 0-49%)
  * 50-79%: Highest ICA PSV >125 cm/s AND highest ICA EDV <125 cm/s
  * 80-99%: Highest ICA EDV >125 cm/s (this is the ONLY criterion for 80-99% - requires EDV >125)
- Report the specific highest velocities used for grading
- Plaque: Describe location, echogenicity, calcification, and burden for each side
- Vertebral arteries: Flow direction for each side
- Format as numbered findings, one per line
- DO NOT report: CCA/ICA ratios, stenosis in CCA or ECA, ECA plaque, routine diameter measurements

ABI/TBI ONLY:
- Report ABI values for each leg with interpretation
- Report TBI values for each leg with interpretation if measured
- Report toe pressures if measured with clinical significance
- Note if vessels are non-compressible
- Very brief format - typically 2-4 lines

LOWER EXTREMITY ARTERIAL:
Sonographer comments should address these 4 areas ONLY:
1. Plaque burden: Location and severity if present
2. Waveform morphology: By segment (triphasic/biphasic/monophasic)
3. Degree of stenosis: Based on velocity criteria if present
4. Comparison: To prior exam or pre-intervention ABI if applicable
- DO NOT report: Every individual velocity, normal segments in detail

LOWER EXTREMITY VENOUS:
- DVT findings: Location, acute vs chronic characteristics, extent
- Competence: Note incompetent valves only if reflux >0.5 sec
- If normal: "Deep veins patent and compressible throughout"

VENOUS INSUFFICIENCY/REFLUX:
- Always assess and comment on DVT presence/absence
- Report findings organized by vein system (GSV, SSV, Deep System)
- For each vein system, report measurements and reflux times for both sides
- After documenting each vein, add: "Meets criteria for ablation" or "Does not meet criteria for ablation"
- CRITICAL ABLATION CRITERIA:
  * GSV requires ALL THREE: (1) SFJ reflux >500 msec AND (2) Proximal thigh ≥5.5 mm AND (3) At least 3 SEPARATE levels with reflux >500 msec
  * SSV requires BOTH: (1) At least one measurement ≥3.0 mm AND (2) At least 2 SEPARATE levels with reflux >500 msec

UPPER EXTREMITY VENOUS:
- DVT findings: Location and extent
- If normal: "Deep veins patent and compressible throughout"

RENAL ARTERY DUPLEX:
- PSV, EDV for each renal artery
- RAR (renal-aortic ratio)
- Acceleration time only if abnormal (>0.07 sec)
- Kidney lengths

MESENTERIC DUPLEX:
- Celiac, SMA, IMA: PSV and EDV
- Note only if stenosis criteria met
- If normal: "Patent with normal velocities"

AV FISTULA/GRAFT:
- Access type and location
- Flow volume (if measured)
- Stenosis: Location and degree if present
- Inflow artery: Peak systolic velocity

ABDOMINAL AORTA:
- Maximum AP and transverse diameters (proximal, mid, distal)
- Iliac diameters if dilated (>1.5 cm)
- Note thrombus if present

CUSTOM CLINIC CRITERIA:
${customCriteria || defaultCriteria}

FORMAT GUIDELINES:
- Use past tense for observations
- Be BRIEF - one sentence per finding when possible
- Include technical quality notes only if limited
- Use standard anatomical terms
- When prior findings are provided, include a brief "COMPARISON" section
- Avoid repetitive phrasing

The sonographer will provide measurements and observations. Generate well-formatted, CONCISE preliminary technical findings based on this data.`;

  const examTypes = [
    { value: 'carotid', label: 'Carotid Duplex' },
    { value: 'lower_arterial', label: 'Lower Extremity Arterial' },
    { value: 'abi_tbi', label: 'ABI/TBI Only' },
    { value: 'lower_venous', label: 'Lower Extremity Venous' },
    { value: 'venous_reflux', label: 'Venous Insufficiency/Reflux' },
    { value: 'upper_venous', label: 'Upper Extremity Venous' },
    { value: 'renal', label: 'Renal Artery Duplex' },
    { value: 'mesenteric', label: 'Mesenteric Duplex' },
    { value: 'avf', label: 'AV Fistula/Graft' },
    { value: 'aorta', label: 'Abdominal Aorta' }
  ];

  const exampleTemplates = {
    carotid: `Right Side:
CCA PSV: 65 cm/s, EDV: 18 cm/s
ICA PSV: 85 cm/s, EDV: 22 cm/s
Plaque: Mild heterogeneous at bulb

Left Side:
CCA PSV: 70 cm/s, EDV: 20 cm/s
ICA PSV: 220 cm/s, EDV: 68 cm/s
Plaque: Moderate calcified at ICA origin

Vertebral arteries: Antegrade flow bilaterally`,

    lower_arterial: `Right:
ABI: 0.73 (using DPA)
Biphasic: CFA, SFA proximal
Monophasic: SFA distal, popliteal, tibials

Left:
ABI: 0.51
Elevated velocities: CFA 551 cm/s
Monophasic: Distal to CFA stenosis`,

    venous_reflux: `Great Saphenous Vein:
Right - SFJ: 6.9mm/1248ms, Prox thigh: 5.95mm/1187ms, Mid: 4.03mm/776ms
Left - SFJ: 8.28mm/948ms, Prox thigh: 5.75mm/1043ms

Small Saphenous Vein:
Right - SPJ: 5.05mm/699ms
Left - SPJ: 4.18mm/688ms

Deep System: CFV/fem vein/pop patent and compressible bilaterally`
  };

  const loadExample = (type) => {
    if (exampleTemplates[type]) {
      setMeasurements(exampleTemplates[type]);
    }
  };

  const compileHistory = () => {
    let history = `Study Type: ${studyType === 'baseline' ? 'Baseline Study' : studyType === 'routine_surveillance' ? 'Routine Surveillance' : 'Post-Intervention'}\n`;

    if (studyType === 'post_intervention' && interventionDate && interventionDetails) {
      history += `\nIntervention: ${interventionDetails} on ${interventionDate}`;
    }

    if ((studyType === 'routine_surveillance' || studyType === 'post_intervention') && priorExamDate) {
      history += `\n\nPrior Exam: ${priorExamDate}`;
      if (priorFindings) {
        history += `\nPrior Findings: ${priorFindings}`;
      }
    }

    return history;
  };

  const generateReport = async () => {
    if (!examType || !measurements.trim()) {
      alert('Please select exam type and enter measurements');
      return;
    }

    setIsLoading(true);
    setGeneratedReport('');

    const selectedExam = examTypes.find(e => e.value === examType);
    const historyText = compileHistory();

    const userMessage = `Exam Type: ${selectedExam.label}

${historyText}

Measurements and Observations:
${measurements}

Please generate preliminary technical findings for this vascular ultrasound exam. Format as a structured sonographer report following SVS standards and our custom criteria. Include appropriate technical observations and vessel-by-vessel findings. ${priorFindings ? 'Include a COMPARISON section noting any interval changes, progression, improvement, or stable findings compared to the prior exam.' : ''}`;

    let lastErr = null;
    for (const url of AI_URLS) {
      try {
        console.log(`[UltrasoundReport] Trying ${url}...`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'qwen3:8b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.2,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          console.error(`[UltrasoundReport] HTTP ${response.status} from ${url}:`, errBody);
          throw new Error(`HTTP ${response.status}: ${errBody.slice(0, 200)}`);
        }
        const data = await response.json();
        console.log('[UltrasoundReport] Response keys:', Object.keys(data));
        console.log('[UltrasoundReport] Full response:', JSON.stringify(data).slice(0, 500));
        // OpenAI-compatible format (direct Ollama /v1/ endpoints)
        const content = data.choices?.[0]?.message?.content
          // Ollama native format (office proxy /api/chat)
          || data.message?.content
          || '';
        if (!content) {
          console.warn('[UltrasoundReport] Empty content from', url, '— trying next endpoint');
          lastErr = new Error('Empty response from AI');
          continue;
        }
        console.log(`[UltrasoundReport] Success from ${url}, ${content.length} chars`);
        setGeneratedReport(content);
        setIsLoading(false);
        return;
      } catch (err) {
        console.error(`[UltrasoundReport] Failed ${url}:`, err.message);
        lastErr = err;
      }
    }

    setGeneratedReport(`Error generating report: ${lastErr?.message}\n\nAll endpoints failed. Check browser console (F12) for details.\nEndpoints tried:\n${AI_URLS.join('\n')}`);
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pasteHistory = () => {
    const pastedText = prompt('Paste previous history here:');
    if (pastedText) {
      if (pastedText.includes('Intervention:')) {
        const parts = pastedText.split('on ');
        if (parts.length > 1) {
          setInterventionDetails(parts[0].replace('Intervention:', '').trim());
          setInterventionDate(parts[1].trim());
        }
      }
      if (pastedText.includes('Prior Findings:')) {
        const findings = pastedText.split('Prior Findings:')[1];
        setPriorFindings(findings?.trim() || '');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Vascular Ultrasound Report Assistant</h1>
                <p className="text-sm text-gray-600">Sonographer preliminary findings generator</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl"
                title="Settings"
              >
                ⚙️
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
              >
                ← Back
              </button>
            </div>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div className="text-sm text-amber-800">
              <strong>Important:</strong> This tool generates preliminary technical findings only. All reports must be reviewed by the sonographer and are subject to final physician interpretation. Do not include patient identifiers (names, MRN, DOB) in this tool.
            </div>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Custom Velocity Criteria</h2>
            <p className="text-sm text-gray-600 mb-3">
              Enter your clinic&apos;s custom velocity criteria and thresholds.
            </p>
            <textarea
              value={customCriteria}
              onChange={(e) => setCustomCriteria(e.target.value)}
              placeholder={defaultCriteria}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
            />
          </div>
        )}

        {/* Exam Type Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Exam Type</h2>
          <select
            value={examType}
            onChange={(e) => {
              setExamType(e.target.value);
              loadExample(e.target.value);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
          >
            <option value="">Select exam type...</option>
            {examTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Patient History */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Patient History (Optional)</h2>
              <span className="text-xs text-gray-500">Click to expand/collapse</span>
            </div>
            <span className="text-xl">{historyExpanded ? '▲' : '▼'}</span>
          </button>

          {historyExpanded && (
            <div className="p-4 pt-0 space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={pasteHistory}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  📋 Paste from Prior Report
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Study Type</label>
                <select
                  value={studyType}
                  onChange={(e) => setStudyType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="baseline">Baseline Study</option>
                  <option value="routine_surveillance">Routine Surveillance (&gt;1 year post-intervention)</option>
                  <option value="post_intervention">Post-Intervention</option>
                </select>
              </div>

              {studyType === 'post_intervention' && (
                <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                  <h3 className="font-medium text-gray-700 text-sm">Intervention Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Intervention Description</label>
                      <input
                        type="text"
                        value={interventionDetails}
                        onChange={(e) => setInterventionDetails(e.target.value)}
                        placeholder="e.g., Left SFA stent, Right CEA, Bilateral GSV ablation"
                        className="w-full p-2 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Intervention Date</label>
                      <input
                        type="date"
                        value={interventionDate}
                        onChange={(e) => setInterventionDate(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(studyType === 'routine_surveillance' || studyType === 'post_intervention') && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <h3 className="font-medium text-gray-700 text-sm">Prior Exam for Comparison</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Prior Exam Date</label>
                      <input
                        type="date"
                        value={priorExamDate}
                        onChange={(e) => setPriorExamDate(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Prior Findings Summary</label>
                      <textarea
                        value={priorFindings}
                        onChange={(e) => setPriorFindings(e.target.value)}
                        placeholder="e.g., Right ICA 50-79% stenosis, ABI 0.62, GSV reflux bilaterally"
                        className="w-full p-2 border rounded text-sm h-20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Measurements and Generated Report */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Input Measurements</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Measurements &amp; Observations</label>
              <textarea
                value={measurements}
                onChange={(e) => setMeasurements(e.target.value)}
                placeholder="Paste or type measurements from Ultralinq worksheet..."
                className="w-full h-80 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <button
              onClick={generateReport}
              disabled={isLoading || !examType || !measurements.trim()}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generating Report...' : 'Generate Preliminary Findings'}
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Example template loaded when you select exam type
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Generated Report</h2>
              {generatedReport && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 h-[500px] overflow-y-auto border border-gray-200">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating preliminary findings...</p>
                  </div>
                </div>
              ) : generatedReport ? (
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                  {generatedReport}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <span className="text-6xl block mb-3 opacity-50">📄</span>
                    <p>Generated report will appear here</p>
                    <p className="text-sm mt-2">Select exam type and enter measurements to begin</p>
                  </div>
                </div>
              )}
            </div>

            {generatedReport && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Next Steps:</strong> Review the generated findings for accuracy, make any necessary edits, then copy to your final report system. Remember to add patient identifiers in your official documentation system.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VascularReportAssistant;
