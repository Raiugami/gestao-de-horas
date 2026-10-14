'use client';

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
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
  X,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

function MinsaitLogo() {
  return (
    <svg className="sidebar-logo" viewBox="0 0 185 18" aria-hidden="true" focusable="false">
      <path d="M0 17.5486L.9694 17.8055s11.8576-3.614 15.4669-3.8603c3.6091.2463 15.467 3.8603 15.467 3.8603l.9694-.2569s-10.3126-7.0864-16.4364-7.2239C10.3125 10.4622 0 17.5486 0 17.5486ZM32.8727.4526l-.9691-.2568s-11.8579 3.614-15.467 3.8603C12.827 3.8098.9691.1958.9691.1958L0 .4526s10.3125 7.0865 16.4366 7.224c6.1235-.1378 16.4355-7.224 16.4355-7.224Z" fill="currentColor" />
      <path d="M47.195 4.804h-.908v12.35h-4.223V1.262h7.787l3.837 9.104h1.362l3.814-9.104h7.788v15.892h-4.223V4.804h-.908l-3.996 9.104h-6.311l-4.019-9.104Zm24.451-3.542h4.223v15.892h-4.223V1.262Zm9.217 0h7.56l8.264 12.35h.908V1.262h4.223v15.892h-7.56l-8.264-12.35h-.908v12.35h-4.223V1.262Zm25.495 15.892v-3.542h14.916c.885 0 1.385-.5 1.385-1.385s-.5-1.385-1.385-1.385h-10.012c-3.338 0-5.358-1.793-5.358-4.79s2.02-4.79 5.358-4.79h14.598v3.542h-14.598c-.795 0-1.249.454-1.249 1.249s.454 1.249 1.249 1.249h10.012c3.451 0 5.494 1.839 5.494 4.927s-2.043 4.926-5.494 4.926h-14.916v-.001Zm22.203-.091 9.467-15.801h5.993l9.467 15.801v.091h-4.699l-1.703-2.951h-12.123l-1.702 2.951h-4.7v-.091Zm16.505-6.402-3.36-5.857h-1.362l-3.36 5.857h8.082Zm11.737-9.399h4.223v15.892h-4.223V1.262Zm15.869 3.542h-8.105V1.262h20.432v3.542h-8.104v12.35h-4.223V4.804Z" fill="currentColor" />
    </svg>
  );
}

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
  function clearAndClose() {
    onClear();
    setClearOpen(false);
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
          <MinsaitLogo />
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
            <li><span>03</span><div><strong>Registre exceções</strong><p>Em Férias e exceções, cadastre feriados, férias ou ausências que alterem a jornada esperada.</p></div></li>
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
          <AlertDialogCancel className="clear-data-close" aria-label="Fechar confirmação"><X size={16} /></AlertDialogCancel>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar os dados da conferência?</AlertDialogTitle>
            <AlertDialogDescription>Os PDFs importados, os dados do Jira, as exceções e os ajustes serão removidos desta tela. Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter dados</AlertDialogCancel>
            <AlertDialogAction className="clear-data-confirm" onClick={clearAndClose}>Limpar dados</AlertDialogAction>
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
