'use client';

import { useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';

const SCENES = ['Importar', 'Revisar', 'Exceções', 'Exportar'] as const;

function Cursor() {
  return (
    <svg className="gm-cursor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 2l12 6.5-5.2 1.6L7.6 16z" />
    </svg>
  );
}

function ImportScene() {
  return (
    <div className="gm-scene gm-import">
      <div className="gm-pill gm-month">Mês: setembro</div>
      <div className="gm-drop">
        <span className="gm-drop-title">Solte os PDFs aqui</span>
        <div className="gm-file" style={{ '--i': 0 } as never}><b>PDF</b><i /></div>
        <div className="gm-file" style={{ '--i': 1 } as never}><b>PDF</b><i /></div>
        <div className="gm-file" style={{ '--i': 2 } as never}><b>PDF</b><i /></div>
        <div className="gm-file gm-file-jira" style={{ '--i': 3.4 } as never}><b>Jira</b><i /></div>
        <div className="gm-progress"><span /></div>
      </div>
      <div className="gm-badge">Leitura concluída</div>
    </div>
  );
}

function ReviewScene() {
  return (
    <div className="gm-scene gm-review">
      <div className="gm-list">
        <div className="gm-search"><span>Ana</span></div>
        {['Ana', 'Ana Paula', 'Anderson'].map((n, i) => (
          <div key={n} className={`gm-row${i === 1 ? ' gm-row-pick' : ''}`}>
            <em>{n}</em>
            <span>{i === 1 ? '152h' : '160h'}</span>
            <u className={i === 1 ? 'gm-warn' : 'gm-ok'}>{i === 1 ? '−8h' : 'ok'}</u>
          </div>
        ))}
      </div>
      <div className="gm-panel">
        <strong>Lançamentos</strong>
        <div className="gm-line" /><div className="gm-line" /><div className="gm-line gm-line-edit" />
      </div>
      <Cursor />
    </div>
  );
}

function ExceptionScene() {
  return (
    <div className="gm-scene gm-exc">
      <div className="gm-cal">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className={i === 9 ? 'gm-day gm-day-pick' : 'gm-day'}>{i === 9 ? <b>Feriado</b> : null}</span>
        ))}
      </div>
      <div className="gm-meta"><span className="gm-meta-a">Meta: 160h</span><span className="gm-meta-b">Meta: 152h</span></div>
      <Cursor />
    </div>
  );
}

function ExportScene() {
  return (
    <div className="gm-scene gm-exp">
      <div className="gm-sheet"><div className="gm-line" /><div className="gm-line" /><div className="gm-line" /></div>
      <div className="gm-btns"><span className="gm-btn gm-btn-pick">CSV</span><span className="gm-btn">Relatório</span></div>
      <div className="gm-file gm-fly"><b>CSV</b><i /></div>
      <div className="gm-tray"><span className="gm-check">✓</span></div>
      <Cursor />
    </div>
  );
}

const SCENE_VIEWS: ReactNode[] = [<ImportScene key="0" />, <ReviewScene key="1" />, <ExceptionScene key="2" />, <ExportScene key="3" />];

export function GuideMotion({ onStep }: { onStep?: (step: number) => void }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const go = (n: number) => { setStep(n); onStep?.(n); };

  return (
    <section className="gm" aria-label="Demonstração animada com dados fictícios" data-paused={!playing}>
      <div className="gm-stage" key={step} aria-hidden="true">{SCENE_VIEWS[step]}</div>
      <div className="gm-controls">
        <button type="button" className="gm-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar demonstração' : 'Reproduzir demonstração'}>
          {playing ? <Pause size={13} /> : <Play size={13} />}
        </button>
        {SCENES.map((label, i) => (
          <button key={label} type="button" className="gm-seg" aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}>
            <span className="gm-seg-bar">{i === step && <i onAnimationEnd={() => go((i + 1) % SCENES.length)} />}</span>
            {i + 1}. {label}
          </button>
        ))}
      </div>
      <p className="gm-note">Demonstração ilustrativa com dados fictícios.</p>
    </section>
  );
}
