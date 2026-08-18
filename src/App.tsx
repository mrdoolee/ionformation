/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 이온의 형성 과정 과학 시뮬레이션
 * © 2026 Designed & Developed by 두리쌤. All rights reserved.
 */

import React, { useState } from 'react';
import { ELEMENTS_DATA, LEARNING_MISSIONS } from './data/elements';
import { ElementSymbol, ModelType, LearningMission } from './types';
import { ElementSelectionPanel } from './components/ElementSelectionPanel';
import { ModelSettingsPanel } from './components/ModelSettingsPanel';
import { AtomSimulationSvg } from './components/AtomSimulationSvg';
import { ModelVisualSettingsModal } from './components/ModelVisualSettingsModal';
import { MissionTheoryModal } from './components/MissionTheoryModal';
import { HelpModal } from './components/HelpModal';
import { MissionsModal } from './components/MissionsModal';
import { sound } from './utils/audio';
import {
  Atom,
  BookOpen,
  Trophy,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function App() {
  // State
  const [selectedSymbol, setSelectedSymbol] = useState<ElementSymbol>('Na');
  const currentElement = ELEMENTS_DATA[selectedSymbol] || ELEMENTS_DATA.Na;
  const [currentElectrons, setCurrentElectrons] = useState<number>(currentElement.neutralElectrons);
  const [modelType, setModelType] = useState<ModelType>('bohr');
  const [animSpeed, setAnimSpeed] = useState<number>(1.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'controls' | 'atom'>('controls');

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [isVisualSettingsOpen, setIsVisualSettingsOpen] = useState<boolean>(false);
  const [isTheoryModalOpen, setIsTheoryModalOpen] = useState<boolean>(false);
  const [theoryMission, setTheoryMission] = useState<LearningMission | null>(null);

  // Missions
  const [missions, setMissions] = useState<LearningMission[]>(LEARNING_MISSIONS);
  const [activeMission, setActiveMission] = useState<LearningMission | null>(missions[0]);

  // Trigger mission completion theory modal
  const checkAndCompleteMission = (elementSymbol: string, netCharge: number) => {
    if (activeMission && activeMission.element === elementSymbol) {
      if (netCharge === activeMission.targetCharge) {
        const wasAlreadyCompleted = activeMission.completed;
        const updatedMission = { ...activeMission, completed: true };

        setMissions((prev) =>
          prev.map((m) => (m.id === activeMission.id ? updatedMission : m))
        );
        setActiveMission(updatedMission);

        // Open theory modal automatically if not already opened
        if (!wasAlreadyCompleted) {
          setTheoryMission(updatedMission);
          setTimeout(() => {
            setIsTheoryModalOpen(true);
          }, 350);
        }
      }
    }
  };

  // Handle element selection
  const handleSelectElement = (symbol: ElementSymbol) => {
    const elem = ELEMENTS_DATA[symbol];
    if (!elem) return;
    setSelectedSymbol(symbol);
    setCurrentElectrons(elem.neutralElectrons);
  };

  // Handle electrons count change
  const handleElectronsChange = (
    newCount: number,
    _reason: 'user_drag_out' | 'user_drag_in' | 'button' | 'auto'
  ) => {
    const clamped = Math.max(0, Math.min(24, newCount));
    setCurrentElectrons(clamped);

    const netCharge = currentElement.protons - clamped;
    checkAndCompleteMission(currentElement.symbol, netCharge);
  };

  // Reset to neutral atom
  const handleResetToNeutral = () => {
    setCurrentElectrons(currentElement.neutralElectrons);
  };

  // 1-Click Make Stable Ion
  const handleMakeStableIon = () => {
    const targetElectrons = currentElement.protons - currentElement.stableCharge;
    sound.playSuccessChime();
    setCurrentElectrons(targetElectrons);

    const netCharge = currentElement.stableCharge;
    checkAndCompleteMission(currentElement.symbol, netCharge);
  };

  // Select mission
  const handleSelectMission = (mission: LearningMission) => {
    setActiveMission(mission);
    setSelectedSymbol(mission.element);
    const elem = ELEMENTS_DATA[mission.element];
    setCurrentElectrons(elem.neutralElectrons);
  };

  // View theory modal for specific mission
  const handleViewTheory = (mission: LearningMission) => {
    setTheoryMission(mission);
    setIsTheoryModalOpen(true);
  };

  // Next Mission Navigation
  const activeMissionIndex = activeMission
    ? missions.findIndex((m) => m.id === activeMission.id)
    : -1;
  const hasNextMission = activeMissionIndex >= 0 && activeMissionIndex < missions.length - 1;

  const handleNextMission = () => {
    if (hasNextMission) {
      const nextMission = missions[activeMissionIndex + 1];
      setIsTheoryModalOpen(false);
      handleSelectMission(nextMission);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-950 flex flex-col justify-between text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans overflow-hidden" style={{ backgroundColor: '#020617' }}>
      
      {/* 1. TOP GLOBAL SLEEK NAV BAR */}
      <nav className="h-13 flex items-center justify-between px-3 sm:px-5 bg-white/5 backdrop-blur-md border-b border-white/10 shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/25 border border-indigo-400/30 shrink-0">
            <Atom className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
                이온 형성 시뮬레이션
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              원자에서 전자의 이동에 따른 양이온(+)과 음이온(-)의 형성 탐구
            </p>
          </div>
        </div>

        {/* Header Action Buttons in Sleek Pill Style */}
        <div className="flex items-center gap-2">
          {/* Mission Challenge Button */}
          <button
            id="open-missions-btn"
            onClick={() => {
              sound.playClick();
              setIsMissionsOpen(true);
            }}
            className="px-2.5 sm:px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">탐구 미션</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[9px] font-bold">
              {missions.filter((m) => m.completed).length}/{missions.length}
            </span>
          </button>

          {/* Help Guide Button */}
          <button
            id="open-help-btn"
            onClick={() => {
              sound.playClick();
              setIsHelpOpen(true);
            }}
            className="px-2.5 sm:px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-slate-200 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">도움말</span>
          </button>

          {/* Experiment Reset Button */}
          <button
            id="header-reset-btn"
            onClick={() => {
              sound.playReset();
              handleResetToNeutral();
            }}
            className="px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            실험 초기화
          </button>
        </div>
      </nav>

      {/* 2. ACTIVE MISSION PROMPT BANNER (if mission active) */}
      {activeMission && (
        <div className="w-full bg-indigo-950/60 backdrop-blur-md border-b border-indigo-500/20 px-3 sm:px-5 py-1.5 flex items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="px-2 py-0.2 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              진행 중 미션
            </span>
            <span className="font-bold text-slate-200">{activeMission.title}</span>
            <span className="text-slate-400 hidden md:inline">| {activeMission.instruction}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeMission.completed ? (
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 미션 완료
                </span>
                <button
                  onClick={() => handleViewTheory(activeMission)}
                  className="px-2 py-0.5 rounded-md bg-indigo-600/40 hover:bg-indigo-600/70 border border-indigo-400/40 text-indigo-200 text-[10px] font-semibold cursor-pointer transition-colors"
                >
                  이론 해설 보기 📖
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  setIsMissionsOpen(true);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer text-[11px]"
              >
                다른 미션 보기 &gt;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Responsive Mobile Tab Switcher (Visible only on < lg screens) */}
      <div className="lg:hidden w-full px-2.5 sm:px-3 pt-1.5 pb-0.5 flex items-center justify-center shrink-0">
        <div className="w-full max-w-md flex bg-slate-900/90 rounded-xl p-0.5 sm:p-1 border border-white/10 shadow-lg text-xs font-semibold">
          <button
            onClick={() => setMobileTab('controls')}
            className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              mobileTab === 'controls'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            원소정보 & 선택
          </button>
          <button
            onClick={() => setMobileTab('atom')}
            className={`flex-1 py-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              mobileTab === 'atom'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            원자모형
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: 2-TIER LAYERED WORKSPACE (왼쪽: 원소정보/조작 + 원소선택 / 오른쪽: 원자모형 시뮬레이션) */}
      <main
        className="flex-1 min-h-0 p-2 sm:p-3 gap-2 sm:gap-3 relative flex flex-col lg:flex-row overflow-hidden"
      >
        
        {/* Left Column (왼쪽 레이어: 상단 원소 정보 및 이온 조작 + 하단 원소 선택) */}
        <section
          id="layer-left-column"
          className={`z-10 flex-col gap-2 sm:gap-2.5 w-full lg:w-[330px] xl:w-[360px] shrink-0 h-full overflow-y-auto pr-0.5 ${
            mobileTab === 'atom' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Top: 원소 정보 및 이온 조작 */}
          <ModelSettingsPanel
            element={currentElement}
            currentElectrons={currentElectrons}
            onElectronsChange={handleElectronsChange}
            onResetToNeutral={handleResetToNeutral}
            onMakeStableIon={handleMakeStableIon}
          />

          {/* Bottom: 원소 선택 (1~20번 주기율표) */}
          <ElementSelectionPanel
            element={currentElement}
            onSelectElement={handleSelectElement}
          />
        </section>

        {/* Right Column (오른쪽 레이어: 원자 모형 시뮬레이션 인터랙티브 무대) */}
        <section
          id="layer-right-atom-simulation"
          className={`relative rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-white/10 shadow-2xl overflow-hidden flex-col flex-1 min-w-0 w-full lg:w-auto h-full shrink-0 lg:shrink ${
            mobileTab === 'controls' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Subtle Grid Dot Overlay */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />

          <AtomSimulationSvg
            element={currentElement}
            currentElectrons={currentElectrons}
            modelType={modelType}
            animSpeed={animSpeed}
            isPaused={isPaused}
            onElectronsChange={handleElectronsChange}
            onReset={handleResetToNeutral}
            showLabels={showLabels}
            onOpenSettingsModal={() => setIsVisualSettingsOpen(true)}
          />

          {/* Quick Learning Note at bottom of simulation */}
          <div className="w-full px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/5 border-t border-white/10 backdrop-blur-md text-[10px] sm:text-[11px] text-slate-300 flex items-center justify-between flex-wrap gap-1 sm:gap-2 z-10 shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">
                <b className="text-white">교과 핵심:</b> {currentElement.curriculumNotes}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] shrink-0">
              <span className="text-slate-400">안정 목표:</span>
              <span className="text-indigo-300 font-semibold">{currentElement.nobleGasTarget}</span>
            </div>
          </div>
        </section>

      </main>

      {/* 4. MODALS */}
      {/* Model Visual Settings Modal (원자 모형 시각화 설정 모달) */}
      <ModelVisualSettingsModal
        isOpen={isVisualSettingsOpen}
        onClose={() => setIsVisualSettingsOpen(false)}
        modelType={modelType}
        animSpeed={animSpeed}
        isPaused={isPaused}
        showLabels={showLabels}
        onModelChange={setModelType}
        onSpeedChange={setAnimSpeed}
        onTogglePause={() => setIsPaused(!isPaused)}
        onToggleLabels={() => setShowLabels(!showLabels)}
      />

      {/* Mission Theory Explanation Modal (탐구 미션 완료 이론 해설 모달) */}
      <MissionTheoryModal
        isOpen={isTheoryModalOpen}
        onClose={() => setIsTheoryModalOpen(false)}
        mission={theoryMission || activeMission}
        onNextMission={handleNextMission}
        hasNextMission={hasNextMission}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      <MissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        missions={missions}
        currentElementSymbol={selectedSymbol}
        currentElectrons={currentElectrons}
        onSelectMission={handleSelectMission}
        onViewTheory={handleViewTheory}
      />

      {/* 5. FOOTER (MANDATORY REQUIREMENT WITH SLEEK INTERFACE STYLING) */}
      <footer className="h-6 flex items-center justify-center bg-slate-950/90 border-t border-white/5 text-[9px] text-slate-500 tracking-widest uppercase shrink-0">
        © 2026 Designed & Developed by 두리쌤. All rights reserved.
      </footer>

    </div>
  );
}
