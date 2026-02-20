import React, { useState, useMemo } from 'react';
import { RUTHERFORD, WIFI, CEAP, WAGNER, CAROTID_GRADING, NIHSS, ABI_INTERPRETATION, DIABETIC_FOOT_RISK, getScoringForType } from '../data/clinicalScoring';

/**
 * Clinical Scoring Panel
 * 
 * Auto-calculates scores from interview answers + allows manual override.
 * Shows applicable scoring systems based on patient type.
 */
export default function ClinicalScoring({ patientType, answers, onScoresChange }) {
  const applicableSystems = useMemo(() => getScoringForType(patientType), [patientType]);
  const [manualScores, setManualScores] = useState({});

  if (applicableSystems.length === 0) return null;

  const handleManualScore = (systemName, value) => {
    const updated = { ...manualScores, [systemName]: value };
    setManualScores(updated);
    if (onScoresChange) onScoresChange(updated);
  };

  return (
    <div style={{ marginTop: 16, padding: 16, background: '#f0f4f8', borderRadius: 8 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 18, color: '#1a365d' }}>📊 Clinical Scoring</h3>

      {applicableSystems.map(system => (
        <ScoringCard
          key={system.name}
          system={system}
          answers={answers}
          manualValue={manualScores[system.name]}
          onManualChange={(val) => handleManualScore(system.name, val)}
        />
      ))}
    </div>
  );
}

function ScoringCard({ system, answers, manualValue, onManualChange }) {
  // Auto-calculate if the system has a classify function
  const autoResult = useMemo(() => {
    if (system.classify) return system.classify(answers || {});
    if (system.score) return system.score(answers || {});
    return null;
  }, [system, answers]);

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12
    }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 15, color: '#2d3748' }}>{system.name}</h4>

      {/* Rutherford */}
      {system === RUTHERFORD && (
        <RutherfordDisplay autoCategory={autoResult} manual={manualValue} onManualChange={onManualChange} />
      )}

      {/* WIfI */}
      {system === WIFI && (
        <WifiDisplay answers={answers} manual={manualValue} onManualChange={onManualChange} />
      )}

      {/* CEAP */}
      {system === CEAP && (
        <CeapDisplay autoClass={autoResult} manual={manualValue} onManualChange={onManualChange} />
      )}

      {/* Wagner */}
      {system === WAGNER && (
        <WagnerDisplay autoGrade={autoResult} manual={manualValue} onManualChange={onManualChange} />
      )}

      {/* ABI */}
      {system === ABI_INTERPRETATION && (
        <AbiDisplay manual={manualValue} onManualChange={onManualChange} />
      )}

      {/* Carotid */}
      {system === CAROTID_GRADING && (
        <CarotidDisplay manual={manualValue} onManualChange={onManualChange} />
      )}

      {/* NIHSS (Stroke Scale) */}
      {system === NIHSS && (
        <NihssDisplay manual={manualValue} onManualChange={onManualChange} />
      )}

      {/* Diabetic Foot Risk */}
      {system === DIABETIC_FOOT_RISK && (
        <DiabeticRiskDisplay autoResult={autoResult} answers={answers} manual={manualValue} onManualChange={onManualChange} />
      )}
    </div>
  );
}

function RutherfordDisplay({ autoCategory, manual, onManualChange }) {
  const value = manual !== undefined ? manual : autoCategory;
  const cat = RUTHERFORD.categories.find(c => c.category === value);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        {RUTHERFORD.categories.map(c => (
          <button
            key={c.category}
            onClick={() => onManualChange(c.category)}
            style={{
              padding: '8px 14px',
              border: value === c.category ? '2px solid #3182ce' : '1px solid #e2e8f0',
              borderRadius: 6,
              background: value === c.category ? '#ebf8ff' : 'white',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: value === c.category ? 'bold' : 'normal'
            }}
          >
            {c.category}: {c.label}
          </button>
        ))}
      </div>
      {cat && (
        <p style={{ fontSize: 13, color: '#4a5568', margin: 0 }}>
          <strong>Grade {cat.grade}, Category {cat.category}:</strong> {cat.description}
        </p>
      )}
    </div>
  );
}

function WifiDisplay({ answers, manual, onManualChange }) {
  const [w, setW] = useState(manual?.w || 0);
  const [i, setI] = useState(manual?.i || 0);
  const [fi, setFi] = useState(manual?.fi || 0);

  const updateScore = (field, val) => {
    const updated = { w, i, fi, [field]: val };
    if (field === 'w') setW(val);
    if (field === 'i') setI(val);
    if (field === 'fi') setFi(val);
    onManualChange(updated);
  };

  const risk = WIFI.amputationRisk(w, i, fi);
  const revasc = WIFI.revascBenefit(w, i, fi);

  return (
    <div>
      {['wound', 'ischemia', 'footInfection'].map(comp => {
        const key = comp === 'wound' ? 'w' : comp === 'ischemia' ? 'i' : 'fi';
        const current = key === 'w' ? w : key === 'i' ? i : fi;
        return (
          <div key={comp} style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 'bold', color: '#4a5568' }}>
              {WIFI.components[comp].label}:
            </label>
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
              {WIFI.components[comp].grades.map(g => (
                <button
                  key={g.grade}
                  onClick={() => updateScore(key, g.grade)}
                  title={g.description}
                  style={{
                    padding: '8px 12px',
                    border: current === g.grade ? '2px solid #3182ce' : '1px solid #e2e8f0',
                    borderRadius: 4,
                    background: current === g.grade ? '#ebf8ff' : 'white',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  {g.grade}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <p style={{ fontSize: 13, margin: '8px 0 0', padding: 6, background: '#fff5f5', borderRadius: 4 }}>
        <strong>WIfI {w}-{i}-{fi}</strong> | Amputation Risk: <strong>{risk}</strong> | Revasc Benefit: <strong>{revasc}</strong>
      </p>
    </div>
  );
}

function CeapDisplay({ autoClass, manual, onManualChange }) {
  const value = manual || autoClass || 'C0';

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {CEAP.clinical.map(c => (
        <button
          key={c.class}
          onClick={() => onManualChange(c.class)}
          title={c.description}
          style={{
            padding: '8px 14px',
            border: value === c.class ? '2px solid #3182ce' : '1px solid #e2e8f0',
            borderRadius: 6,
            background: value === c.class ? '#ebf8ff' : 'white',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: value === c.class ? 'bold' : 'normal'
          }}
        >
          {c.class}
        </button>
      ))}
      <p style={{ width: '100%', fontSize: 13, color: '#4a5568', margin: '4px 0 0' }}>
        {CEAP.clinical.find(c => c.class === value)?.description}
      </p>
    </div>
  );
}

function WagnerDisplay({ autoGrade, manual, onManualChange }) {
  const value = manual !== undefined ? manual : autoGrade;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {WAGNER.grades.map(g => (
        <button
          key={g.grade}
          onClick={() => onManualChange(g.grade)}
          title={g.description}
          style={{
            padding: '8px 14px',
            border: value === g.grade ? '2px solid #3182ce' : '1px solid #e2e8f0',
            borderRadius: 6,
            background: value === g.grade ? '#ebf8ff' : 'white',
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          Grade {g.grade}
        </button>
      ))}
      {value !== undefined && (
        <p style={{ width: '100%', fontSize: 13, color: '#4a5568', margin: '4px 0 0' }}>
          {WAGNER.grades[value]?.description}
        </p>
      )}
    </div>
  );
}

function AbiDisplay({ manual, onManualChange }) {
  const [leftAbi, setLeftAbi] = useState(manual?.left || '');
  const [rightAbi, setRightAbi] = useState(manual?.right || '');

  const leftInterp = ABI_INTERPRETATION.interpret(leftAbi);
  const rightInterp = ABI_INTERPRETATION.interpret(rightAbi);

  const handleChange = (side, val) => {
    if (side === 'left') setLeftAbi(val);
    else setRightAbi(val);
    onManualChange({ left: side === 'left' ? val : leftAbi, right: side === 'right' ? val : rightAbi });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div>
          <label style={{ fontSize: 13, color: '#4a5568' }}>Right ABI:</label>
          <input
            type="number"
            step="0.01"
            value={rightAbi}
            onChange={e => handleChange('right', e.target.value)}
            style={{ width: 70, padding: 4, marginLeft: 4, borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          {rightInterp && <span style={{ fontSize: 13, marginLeft: 4, color: '#4a5568' }}>{rightInterp.interpretation}</span>}
        </div>
        <div>
          <label style={{ fontSize: 13, color: '#4a5568' }}>Left ABI:</label>
          <input
            type="number"
            step="0.01"
            value={leftAbi}
            onChange={e => handleChange('left', e.target.value)}
            style={{ width: 70, padding: 4, marginLeft: 4, borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          {leftInterp && <span style={{ fontSize: 13, marginLeft: 4, color: '#4a5568' }}>{leftInterp.interpretation}</span>}
        </div>
      </div>
    </div>
  );
}

function CarotidDisplay({ manual, onManualChange }) {
  const value = manual || '';

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {CAROTID_GRADING.grades.map(g => (
          <button
            key={g.range}
            onClick={() => onManualChange(g.range)}
            style={{
              padding: '8px 14px',
              border: value === g.range ? '2px solid #3182ce' : '1px solid #e2e8f0',
              borderRadius: 6,
              background: value === g.range ? '#ebf8ff' : 'white',
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            {g.range}
          </button>
        ))}
      </div>
      {value && (
        <p style={{ fontSize: 13, color: '#4a5568', margin: '4px 0 0' }}>
          {CAROTID_GRADING.grades.find(g => g.range === value)?.recommendation}
        </p>
      )}
    </div>
  );
}

function NihssDisplay({ manual, onManualChange }) {
  const scores = manual || {}; // { '1a': 0, '1b': 1 ... }
  
  const update = (id, val) => {
    const newScores = { ...scores, [id]: val };
    onManualChange(newScores);
  };
  
  const total = Object.values(scores).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
  const interp = NIHSS.interpret(total);

  return (
    <div>
      {/* No scroll container — items flow naturally in the page */}
      <div style={{ borderRadius: 4, padding: 8, marginBottom: 8 }}>
        {NIHSS.items.map(item => (
          <div key={item.id} style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginBottom: 8 }}>{item.label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {item.options.map(opt => (
                <button 
                  key={opt.v}
                  onClick={() => update(item.id, opt.v)}
                  style={{
                    padding: '8px 12px',
                    border: scores[item.id] === opt.v ? '2px solid #3182ce' : '1px solid #e2e8f0',
                    borderRadius: 8,
                    background: scores[item.id] === opt.v ? '#ebf8ff' : 'white',
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left',
                    minHeight: 44,
                    minWidth: 44,
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>{opt.v}</span>: {opt.l}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Sticky total score */}
      <div style={{ position: 'sticky', bottom: 0, zIndex: 5 }}>
        <p style={{ fontSize: 15, margin: 0, padding: 12, background: '#fff5f5', borderRadius: 8, fontWeight: 'bold', color: '#2d3748', boxShadow: '0 -2px 8px rgba(0,0,0,0.1)' }}>
          Total Score: {total} — {interp}
        </p>
      </div>
    </div>
  );
}

function DiabeticRiskDisplay({ autoResult, answers, manual, onManualChange }) {
  const result = autoResult || { score: 0, risk: DIABETIC_FOOT_RISK.riskLevels[0] };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {DIABETIC_FOOT_RISK.factors.map(f => (
          <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, padding: '2px 6px', background: answers?.[f.id] ? '#ebf8ff' : '#f7fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
            <input type="checkbox" checked={!!answers?.[f.id]} readOnly />
            {f.label} (+{f.points})
          </label>
        ))}
      </div>
      {result.risk && (
        <p style={{ fontSize: 13, margin: '8px 0 0', padding: 6, background: '#fff5f5', borderRadius: 4 }}>
          <strong>Score: {result.score}</strong> | Risk: <strong>{result.risk.level}</strong> | {result.risk.followUp}
        </p>
      )}
    </div>
  );
}
