'use client';

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import Image from 'next/image';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
  Users,
} from 'lucide-react';
import { assetPath } from '@/lib/asset-path';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export function useSection() {
  return useSyncExternalStore(
    (notify) => {
      window.addEventListener('hashchange', notify);
      return () => window.removeEventListener('hashchange', notify);
    },
    () => window.location.hash.slice(1) || 'overview',
    () => 'overview',
  );
}

export function Workspace({
  children,
  onClear,
  hasData,
  busy,
}: {
  children: ReactNode;
  onClear: () => void;
  hasData: boolean;
  busy: boolean;
}) {
  const [dark, setDark] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const section = useSection();
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);
  function toggleTheme() {
    setDark((value) => !value);
  }
  return (
    <div className="workspace">
      <a className="skip-link" href="#team">
        Ir para o conteúdo
      </a>
      <aside className="sidebar no-print">
        <svg className="sidebar-ambient" viewBox="0 0 240 910" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="minsait-wave-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff0054" stopOpacity=".04" />
              <stop offset="36%" stopColor="#ff2870" stopOpacity=".52" />
              <stop offset="58%" stopColor="#ffb7ce" stopOpacity=".74" />
              <stop offset="100%" stopColor="#ff0054" stopOpacity=".08" />
            </linearGradient>
            <radialGradient id="minsait-wave-backglow" cx="46%" cy="64%" r="72%">
              <stop offset="0%" stopColor="#ff0054" stopOpacity=".16" />
              <stop offset="52%" stopColor="#a30b4a" stopOpacity=".07" />
              <stop offset="100%" stopColor="#ff0054" stopOpacity="0" />
            </radialGradient>
            <filter id="minsait-wave-blur" x="-30%" y="-100%" width="160%" height="300%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <path className="sidebar-wave-backglow" d="M0 430H240V910H0Z" fill="url(#minsait-wave-backglow)" />
          <g className="sidebar-wave-set wave-one">
            <path className="sidebar-wave-halo" d="M-42 500C28 506 61 567 119 593S224 613 282 556" filter="url(#minsait-wave-blur)" />
            <path className="sidebar-wave" d="M-42 500C28 506 61 567 119 593S224 613 282 556" />
          </g>
          <g className="sidebar-wave-set wave-two">
            <path className="sidebar-wave-halo" d="M-42 538C25 544 61 605 120 631S224 650 282 594" filter="url(#minsait-wave-blur)" />
            <path className="sidebar-wave" d="M-42 538C25 544 61 605 120 631S224 650 282 594" />
          </g>
          <g className="sidebar-wave-set wave-three">
            <path className="sidebar-wave-halo" d="M-42 576C22 582 58 643 118 669S222 688 282 632" filter="url(#minsait-wave-blur)" />
            <path className="sidebar-wave" d="M-42 576C22 582 58 643 118 669S222 688 282 632" />
          </g>
        </svg>
        <a
          href="#team"
          className="sidebar-brand"
          aria-label="Minsait — início"
        >
          <Image
            src={assetPath('/brand/minsait-logo.svg')}
            alt="Minsait"
            width={166}
            height={24}
            unoptimized
          />
        </a>
        <div className="workspace-label">
          WORKSPACE<span>Gestão de horas</span>
        </div>
        <nav aria-label="Navegação principal">
          <a href="#team" aria-current={section !== 'holidays' ? 'location' : undefined}>
            <Users size={19} />
            Conferência mensal
          </a>
          <a href="#holidays" aria-current={section === 'holidays' ? 'location' : undefined}>
            <CalendarDays size={19} />
            Férias e exceções
          </a>
        </nav>
        <div className="sidebar-bottom">
          <button className="open-session guide-button" onClick={() => setGuideOpen(true)}>
            <BookOpen size={18} />
            Guia de uso
          </button>
          <button className="theme-switch-row" role="switch" aria-checked={dark} onClick={toggleTheme}>
            <span className="theme-switch-label">{dark ? <Moon size={17}/> : <Sun size={17}/>} Modo escuro</span>
            <span className="switch-track" aria-hidden="true"><span className="switch-thumb"/></span>
          </button>
          <span className="sidebar-footer">Minsait · An Indra company</span>
        </div>
      </aside>
      <div className="workspace-content">
        <header className="topbar no-print">
          <div className="breadcrumb">
            Gestão de horas <span>/</span> <strong>Fechamento mensal</strong>
          </div>
          <div className="actions topbar-actions">
            {hasData && <button className="clear-data-btn" onClick={() => setClearOpen(true)} disabled={busy}>
              <Trash2 size={15} />Limpar dados
            </button>}
            <span className="local-status">
              <i />
              Processamento local
            </span>
          </div>
        </header>
        {children}
      </div>
      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="guide-dialog">
          <DialogHeader>
            <span className="section-kicker">GESTÃO DE HORAS · MINSAIT</span>
            <DialogTitle>Guia de uso</DialogTitle>
            <DialogDescription>Um roteiro rápido para fechar o mês da equipe.</DialogDescription>
          </DialogHeader>
          <ol className="guide-steps">
            <li><span>01</span><div><strong>Adicione os apontamentos</strong><p>Na Conferência mensal, selecione o mês e importe os PDFs. Se precisar comparar justificativas e horas, importe também o arquivo do Jira.</p></div></li>
            <li><span>02</span><div><strong>Revise a equipe</strong><p>Use a busca, os filtros e o mapa diário para localizar divergências. Clique em uma pessoa para conferir os lançamentos e ajustar leituras.</p></div></li>
            <li><span>03</span><div><strong>Registre exceções</strong><p>Em Feriados e exceções, cadastre feriados, férias ou ausências que alterem a jornada esperada.</p></div></li>
            <li><span>04</span><div><strong>Exporte o fechamento</strong><p>Baixe o CSV detalhado ou o relatório para gestão ao concluir a conferência.</p></div></li>
          </ol>
          <aside className="guide-jira-note">
            <strong>Horas do Jira no calendário</strong>
            <p>Elas só substituem as do PDF quando a justificativa é atestado ou férias e os totais conferem. Nos demais casos, prevalece a leitura do PDF.</p>
          </aside>
          <p className="guide-privacy">Os arquivos são processados neste navegador e não são enviados para um servidor.</p>
        </DialogContent>
      </Dialog>
      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent className="clear-data-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar os dados da conferência?</AlertDialogTitle>
            <AlertDialogDescription>Os PDFs importados, os dados do Jira, as exceções e os ajustes serão removidos desta tela. Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter dados</AlertDialogCancel>
            <AlertDialogAction className="clear-data-confirm" onClick={onClear}>Limpar dados</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function Welcome({
  onImport,
  disabled,
}: {
  onImport: () => void;
  disabled: boolean;
}) {
  return (
    <section className="welcome">
      <div className="welcome-copy">
        <p className="eyebrow">
          <span /> MENOS CONFERÊNCIA. MAIS CLAREZA.
        </p>
        <h2>
          Cada hora conta.
          <br />
          <em>Veja o todo.</em>
        </h2>
        <p>
          Transforme os apontamentos da sua equipe em um fechamento simples,
          claro e confiável.
        </p>
        <div className="actions">
          <button
            className="welcome-primary"
            onClick={onImport}
            disabled={disabled}
          >
            Começar conferência <ArrowUpRight size={18} />
          </button>
        </div>
        <span className="welcome-note">
          <ShieldCheck size={14} />
          Seus arquivos são processados neste navegador.
        </span>
      </div>
      <div
        className="welcome-art"
        aria-label="Ilustração do fluxo de conferência"
      >
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="preview-card">
          <div className="preview-top">
            <span className="preview-icon">
              <Clock3 size={20} />
            </span>
            <span>
              Um mês. Uma visão completa.
              <small>Da importação ao fechamento.</small>
            </span>
            <span className="preview-dots">•••</span>
          </div>
          <div className="preview-chart" aria-hidden="true">
            {[45, 68, 54, 85, 71, 96, 83].map((height, i) => (
              <i key={i} style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="preview-bottom">
            <span>
              <i />
              Cada apontamento no seu lugar
            </span>
            <ArrowUpRight size={17} />
          </div>
        </div>
        <div className="art-badge">
          <span>
            <Check size={18} />
          </span>
          Clareza para decidir
        </div>
        <span className="art-caption">Ilustração da experiência</span>
      </div>
    </section>
  );
}
