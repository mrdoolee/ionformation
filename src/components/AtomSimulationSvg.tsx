import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ElementData, ModelType } from '../types';
import { sound } from '../utils/audio';
import { ShieldCheck, AlertCircle, Maximize2, RotateCcw, Volume2, VolumeX, Check, Sliders } from 'lucide-react';
import { formatIonSymbol } from './ModelSettingsPanel';

interface AtomSimulationSvgProps {
  element: ElementData;
  currentElectrons: number;
  modelType: ModelType;
  animSpeed: number;
  isPaused: boolean;
  onElectronsChange: (newCount: number, reason: 'user_drag_out' | 'user_drag_in' | 'button' | 'auto') => void;
  onReset: () => void;
  showLabels: boolean;
  onOpenSettingsModal: () => void;
}

interface DraggedElectron {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  fromZone: 'atom' | 'tray';
}

// Bohr shell capacities for middle-school scope (Z <= 20): K+L+M+N = 2+8+8+2
export const MAX_ELECTRONS = 20;
// Radius of the atom drop-drag zone boundary, shared by the visual guide circle and hit-testing
const ATOM_ZONE_RADIUS = 220;

export const AtomSimulationSvg: React.FC<AtomSimulationSvgProps> = ({
  element,
  currentElectrons,
  modelType,
  animSpeed,
  isPaused,
  onElectronsChange,
  onReset,
  showLabels,
  onOpenSettingsModal,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [angleOffset, setAngleOffset] = useState<number>(0);
  const [dragged, setDragged] = useState<DraggedElectron | null>(null);
  const [isHoveringAtomZone, setIsHoveringAtomZone] = useState<boolean>(false);
  const [isHoveringTrayZone, setIsHoveringTrayZone] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const cx = 350;
  const cy = 290;

  // Charge calculation
  const netCharge = element.protons - currentElectrons;
  const isCation = netCharge > 0;
  const isAnion = netCharge < 0;
  const isNeutral = netCharge === 0;
  const isNobleGas = element.group === 18 || element.category === 'noble_gas';
  const isStable = isNobleGas ? isNeutral : netCharge === element.stableCharge;

  // Shell electron distribution calculation for currentElectrons
  const shellCapacities = [2, 8, 8, 2]; // Bohr capacities for middle school (Z <= 20)
  const shellRadii = [65, 115, 165, 215];

  const currentShellDistribution = useMemo(() => {
    const dist: number[] = [];
    let remaining = currentElectrons;
    for (let i = 0; i < shellCapacities.length; i++) {
      if (remaining <= 0) break;
      const count = Math.min(remaining, shellCapacities[i]);
      dist.push(count);
      remaining -= count;
    }
    // If excess electrons beyond 20, place in outer shell
    if (remaining > 0) {
      if (dist.length === 0) dist.push(remaining);
      else dist[dist.length - 1] += remaining;
    }
    return dist;
  }, [currentElectrons]);

  // Handle sound mute toggle
  const toggleMute = () => {
    sound.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Continuous animation loop using requestAnimationFrame
  useEffect(() => {
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isPaused && animSpeed > 0) {
        setAngleOffset((prev) => (prev + delta * animSpeed * 0.8) % (Math.PI * 2));
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, animSpeed]);

  // Trigger sound when student discovers the stable ion (confetti removed)
  useEffect(() => {
    if (isStable && !isNeutral) {
      sound.playSuccessChime();
    }
  }, [isStable, isNeutral]);

  // Convert client/touch coordinates to SVG coordinates
  const getSvgCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const viewBoxWidth = 700;
    const viewBoxHeight = 580;
    const scaleX = viewBoxWidth / rect.width;
    const scaleY = viewBoxHeight / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Drag handlers
  const handleStartDragFromAtom = (e: React.MouseEvent | React.TouchEvent, elX: number, elY: number) => {
    e.stopPropagation();
    if ('touches' in e && e.touches.length > 1) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const coords = getSvgCoordinates(clientX, clientY);

    setDragged({
      startX: coords.x,
      startY: coords.y,
      currentX: coords.x,
      currentY: coords.y,
      fromZone: 'atom',
    });
    sound.playClick();
  };

  const handleStartDragFromTray = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if ('touches' in e && e.touches.length > 1) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const coords = getSvgCoordinates(clientX, clientY);

    setDragged({
      startX: coords.x,
      startY: coords.y,
      currentX: coords.x,
      currentY: coords.y,
      fromZone: 'tray',
    });
    sound.playClick();
  };

  const draggedRef = useRef<DraggedElectron | null>(null);
  useEffect(() => {
    draggedRef.current = dragged;
  }, [dragged]);

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggedRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const coords = getSvgCoordinates(clientX, clientY);

    setDragged((prev) => (prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null));

    // Distance checks
    const distToCenter = Math.hypot(coords.x - cx, coords.y - cy);
    setIsHoveringAtomZone(distToCenter < ATOM_ZONE_RADIUS);
    setIsHoveringTrayZone(coords.y > 480 || coords.x < 120 || coords.x > 580);
  }, [cx, cy, getSvgCoordinates]);

  const handlePointerUp = useCallback(() => {
    const current = draggedRef.current;
    if (!current) return;

    const { currentX, currentY, fromZone } = current;
    const distToCenter = Math.hypot(currentX - cx, currentY - cy);

    if (fromZone === 'atom') {
      // If dragged away from atom (distance > boundary), release/remove electron (Cation formation)
      if (distToCenter > ATOM_ZONE_RADIUS && currentElectrons > 0) {
        onElectronsChange(currentElectrons - 1, 'user_drag_out');
        sound.playElectronLost();
      }
    } else if (fromZone === 'tray') {
      // If dragged into atom center zone (distance < boundary), capture electron (Anion formation)
      if (distToCenter < ATOM_ZONE_RADIUS && currentElectrons < MAX_ELECTRONS) {
        onElectronsChange(currentElectrons + 1, 'user_drag_in');
        sound.playElectronGained();
      }
    }

    setDragged(null);
    setIsHoveringAtomZone(false);
    setIsHoveringTrayZone(false);
  }, [cx, cy, currentElectrons, onElectronsChange]);

  const isDragging = dragged !== null;
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove, { passive: true });
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: true });
      window.addEventListener('touchend', handlePointerUp);
      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Quick remove outer electron directly on click
  const handleQuickRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentElectrons > 0) {
      onElectronsChange(currentElectrons - 1, 'user_drag_out');
      sound.playElectronLost();
    }
  };

  // Quick add electron from tray on click
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentElectrons < MAX_ELECTRONS) {
      onElectronsChange(currentElectrons + 1, 'user_drag_in');
      sound.playElectronGained();
    }
  };

  // Prepare electrons for rendering
  const electronsToRender: {
    id: string;
    x: number;
    y: number;
    shellIndex: number;
    subIndex: number;
    isValence: boolean;
  }[] = [];

  if (modelType === 'bohr') {
    let globalIndex = 0;
    currentShellDistribution.forEach((count, shellIdx) => {
      const radius = shellRadii[shellIdx] || 215;
      const isValence = shellIdx === currentShellDistribution.length - 1;
      const direction = shellIdx % 2 === 0 ? 1 : -1;
      const speedMultiplier = 1 / (shellIdx + 1);

      for (let i = 0; i < count; i++) {
        const baseAngle = (i / count) * Math.PI * 2;
        const angle = baseAngle + angleOffset * direction * speedMultiplier;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        electronsToRender.push({
          id: `electron-${shellIdx}-${i}`,
          x,
          y,
          shellIndex: shellIdx,
          subIndex: i,
          isValence,
        });
        globalIndex++;
      }
    });
  } else {
    // Rutherford Model: Elliptical orbits at tilted angles
    for (let i = 0; i < currentElectrons; i++) {
      const orbitIndex = i % 6;
      const tiltAngle = (orbitIndex * Math.PI) / 3;
      const a = 180 + (i % 3) * 20; // Major axis
      const b = 65 + (i % 2) * 20;  // Minor axis
      const speed = 1.2 + (i % 3) * 0.3;
      const angle = (i * (Math.PI * 2) / Math.max(1, currentElectrons)) + angleOffset * speed;

      // Ellipse parametric
      const rawX = a * Math.cos(angle);
      const rawY = b * Math.sin(angle);

      // Rotate by tilt angle
      const rotX = rawX * Math.cos(tiltAngle) - rawY * Math.sin(tiltAngle);
      const rotY = rawX * Math.sin(tiltAngle) + rawY * Math.cos(tiltAngle);

      electronsToRender.push({
        id: `rutherford-e-${i}`,
        x: cx + rotX,
        y: cy + rotY,
        shellIndex: 0,
        subIndex: i,
        isValence: i === currentElectrons - 1,
      });
    }
  }

  // Shell base letters (K, L, M, N)
  const shellLetters = ['K', 'L', 'M', 'N'];

  return (
    <div className="relative w-full h-full flex flex-col items-center select-none-all">
      {/* Top Floating Simulation Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 backdrop-blur-md border-b border-white/10 text-xs text-slate-200 z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base" role="img" aria-label="atom">⚛️</span>
          <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
            원자 모형
            <span className="text-slate-400 font-normal text-[11px] hidden md:inline">
              ({modelType === 'bohr' ? '보어 전자 껍질' : '러더퍼드 원자 궤도'})
            </span>
          </span>
          <span className="text-white/20 hidden sm:inline">|</span>
          <span className="font-mono text-slate-400 hidden sm:inline">
            양성자 <b className="text-indigo-300">+{element.protons}</b> / 전자 <b className="text-emerald-400">-{currentElectrons}</b>
          </span>

          {/* Reset Button (placed next to electron count) */}
          <button
            id="reset-sim-btn"
            onClick={() => {
              sound.playReset();
              onReset();
            }}
            title="중성 원자로 리셋"
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 transition-all flex items-center gap-1 cursor-pointer text-[11px] font-medium ml-0.5 shadow-xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>원자 리셋</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sound Toggle Button */}
          <button
            id="toggle-sound-btn"
            onClick={toggleMute}
            title={isMuted ? '음소거 해제' : '음소거'}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
          </button>

          {/* Settings Modal Button */}
          <button
            id="open-model-settings-btn"
            onClick={() => {
              sound.playClick();
              onOpenSettingsModal();
            }}
            title="원자 모형 시각화 설정"
            className="px-2.5 py-1 rounded-full bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer text-[11px] font-medium shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-300" />
            <span>모형 설정</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full flex-1 min-h-[220px] flex items-center justify-center overflow-hidden">
        
        {/* Floating Top Left Control Stack: Status Badge -> Gain/Loss Buttons -> Element/Ion Symbol */}
        <div className="absolute top-1.5 left-2 sm:top-2.5 sm:left-3.5 z-20 flex flex-col items-start gap-1 sm:gap-1.5 pointer-events-none">
          {/* 1. Status Badge */}
          <div className={`px-2 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-md border pointer-events-auto ${
            isNobleGas && isNeutral
              ? 'bg-emerald-500/25 border-emerald-400/80 text-emerald-300 ring-1 ring-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
              : isNeutral
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : isCation
              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isNobleGas && isNeutral ? 'bg-emerald-300' : isNeutral ? 'bg-emerald-400' : isCation ? 'bg-indigo-400' : 'bg-rose-400'
            }`} />
            <span className="text-[10px] sm:text-[11px] font-bold font-mono">
              {isNobleGas && isNeutral
                ? `✨ 안정한 중성 원자 (${element.symbol}) - 옥텟 만족`
                : isNeutral
                ? `중성 원자 상태 (${element.symbol})`
                : isStable
                ? `안정한 ${element.ionNameKr} (${element.ionFormula})!`
                : `${isCation ? '양이온' : '음이온'} 상태 (${formatIonSymbol(element.symbol, netCharge)})`}
            </span>
          </div>

          {/* 2. Quick Electron Gain/Loss Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-0.5 rounded-full border border-white/10 shadow-lg text-xs pointer-events-auto">
            <button
              id="remove-electron-quick-btn"
              onClick={handleQuickRemove}
              disabled={currentElectrons <= 0}
              className="px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 hover:bg-indigo-500/30 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 text-[10px] sm:text-[11px] font-medium cursor-pointer"
            >
              전자 방출
            </button>
            
            <button
              id="add-electron-quick-btn"
              onClick={handleQuickAdd}
              disabled={currentElectrons >= MAX_ELECTRONS}
              className="px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 hover:bg-rose-500/30 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 text-[10px] sm:text-[11px] font-medium cursor-pointer"
            >
              전자 획득
            </button>
          </div>

          {/* 3. Element / Ion Symbol Display Box with Visual Correct Answer Colored Box Effect */}
          <div
            className={`flex flex-col items-start px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl backdrop-blur-md pointer-events-auto transition-all duration-300 ${
              isNobleGas && isNeutral
                ? 'bg-emerald-950/90 border-2 border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_16px_rgba(52,211,153,0.5)]'
                : isStable && !isNeutral
                ? isCation
                  ? 'bg-indigo-950/90 border-2 border-indigo-400 ring-2 ring-indigo-400/50 shadow-[0_0_16px_rgba(99,102,241,0.5)]'
                  : 'bg-rose-950/90 border-2 border-rose-400 ring-2 ring-rose-400/50 shadow-[0_0_16px_rgba(244,63,94,0.5)]'
                : 'bg-slate-950/80 border border-white/10 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between w-full gap-1.5">
              <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-tight font-semibold">
                {netCharge === 0 ? '원소 기호' : '이온 기호'}
              </span>
              {isNobleGas && isNeutral ? (
                <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 animate-pulse bg-emerald-500 text-slate-950">
                  <Check className="w-2.5 h-2.5" />
                  가장 안정 (비활성)
                </span>
              ) : isStable && !isNeutral ? (
                <span
                  className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 animate-pulse ${
                    isCation ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                  정답 (안정)
                </span>
              ) : null}
            </div>
            <span
              className={`text-xl sm:text-2xl md:text-3xl font-black font-mono drop-shadow-md leading-none mt-0.5 ${
                isNobleGas && isNeutral
                  ? 'text-emerald-300'
                  : isStable && !isNeutral
                  ? isCation
                    ? 'text-indigo-200'
                    : 'text-rose-200'
                  : isNeutral
                  ? 'text-emerald-400'
                  : isCation
                  ? 'text-indigo-300'
                  : 'text-rose-300'
              }`}
            >
              {formatIonSymbol(element.symbol, netCharge)}
            </span>
            {isNobleGas && isNeutral && (
              <span className="text-[8px] sm:text-[9px] text-emerald-400/90 font-medium leading-none mt-1">
                껍질 꽉 참 · 전자를 주고받지 않음
              </span>
            )}
          </div>
        </div>

        {/* The Core SVG Stage */}
        <svg
          ref={svgRef}
          viewBox="0 0 700 580"
          className="w-full h-full max-h-full select-none touch-none drop-shadow-2xl"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Background Glows */}
            <radialGradient id="nucleusGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#b91c1c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="nucGrad">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>

            <radialGradient id="cationAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#6366f1" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="anionAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#f43f5e" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="electronGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="valenceGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>

            <filter id="glow-filter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <filter id="strong-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ion Aura effect */}
          {isCation && (
            <circle
              cx={cx}
              cy={cy}
              r={240}
              fill="url(#cationAura)"
              className="animate-pulse-slow"
            />
          )}
          {isAnion && (
            <circle
              cx={cx}
              cy={cy}
              r={240}
              fill="url(#anionAura)"
              className="animate-pulse-slow"
            />
          )}

          {/* Atom Drag Drop Zone Boundary Guide */}
          {dragged && (
            <circle
              cx={cx}
              cy={cy}
              r={ATOM_ZONE_RADIUS}
              fill="none"
              stroke={isHoveringAtomZone ? '#818cf8' : '#475569'}
              strokeWidth={isHoveringAtomZone ? 2 : 1}
              strokeDasharray="5 5"
              className={isHoveringAtomZone ? 'animate-pulse' : ''}
              opacity={0.8}
            />
          )}

          {/* ORBITS / SHELLS RENDERING */}
          {modelType === 'bohr' ? (
            // Bohr Concentric Circular Shells
            <g id="bohr-shells">
              {shellRadii.map((radius, sIdx) => {
                const isOccupied = sIdx < currentShellDistribution.length;
                const isOutermost = sIdx === currentShellDistribution.length - 1;
                const electronCount = currentShellDistribution[sIdx] || 0;

                return (
                  <g key={`shell-${sIdx}`}>
                    {/* Shell Circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="none"
                      stroke={
                        isOutermost
                          ? 'rgba(255, 255, 255, 0.18)'
                          : 'rgba(255, 255, 255, 0.07)'
                      }
                      strokeWidth={isOutermost ? 1.5 : 1}
                      strokeDasharray={isOccupied ? 'none' : '4 4'}
                    />

                    {/* Shell Label */}
                    {showLabels && (
                      <text
                        x={cx}
                        y={cy - radius - 6}
                        textAnchor="middle"
                        fill={isOccupied ? 'rgba(226, 232, 240, 0.85)' : 'rgba(148, 163, 184, 0.45)'}
                        fontSize="10"
                        fontWeight={isOccupied ? '600' : '400'}
                        fontFamily="monospace"
                      >
                        {isOccupied
                          ? `${shellLetters[sIdx]}껍질(전자 ${electronCount}개)`
                          : `${shellLetters[sIdx]}껍질`}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          ) : (
            // Rutherford Elliptical Orbits (Tilted in 3D-like orientation)
            <g id="rutherford-orbits">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const angleDeg = idx * 30;
                return (
                  <ellipse
                    key={`rf-orbit-${idx}`}
                    cx={cx}
                    cy={cy}
                    rx={185}
                    ry={65}
                    transform={`rotate(${angleDeg} ${cx} ${cy})`}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                  />
                );
              })}
            </g>
          )}

          {/* CENTRAL ATOMIC NUCLEUS */}
          <g id="atomic-nucleus" className="cursor-default">
            {/* Outer Nucleus Halo */}
            <circle
              cx={cx}
              cy={cy}
              r={44}
              fill="url(#nucleusGlow)"
              filter="url(#glow-filter)"
            />

            {/* Core Sphere with Gradient */}
            <circle
              cx={cx}
              cy={cy}
              r={32}
              fill="url(#nucGrad)"
              stroke="#fca5a5"
              strokeWidth="1.5"
              className="shadow-lg"
            />

            {/* Central Chemical Symbol & Proton Charge Number */}
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="18"
              fontWeight="bold"
              fontFamily="monospace"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
            >
              {element.symbol}
            </text>
            <text
              x={cx}
              y={cy + 13}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {element.protons}+
            </text>
          </g>

          {/* ELECTRONS RENDERING */}
          <g id="electrons-group">
            {electronsToRender.map((el) => {
              const isDraggableValence = el.isValence;
              return (
                <g
                  key={el.id}
                  transform={`translate(${el.x}, ${el.y})`}
                  className={`${isDraggableValence ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} group`}
                  onMouseDown={(e) => isDraggableValence && handleStartDragFromAtom(e, el.x, el.y)}
                  onTouchStart={(e) => isDraggableValence && handleStartDragFromAtom(e, el.x, el.y)}
                >
                  {/* Invisible generous hit target (prevents mouse jitter & cursor loss) */}
                  <circle
                    r={20}
                    fill="transparent"
                    className="select-none"
                  />

                  {/* Electron Glow halo */}
                  <circle
                    r={isDraggableValence ? 15 : 10}
                    fill={isDraggableValence ? "url(#valenceGlow)" : "url(#electronGlow)"}
                    opacity={isDraggableValence ? 0.8 : 0.4}
                    className="group-hover:opacity-100 transition-opacity duration-150"
                  />
                  {/* Outer selection ring on hover for valence electrons */}
                  {isDraggableValence && (
                    <circle
                      r={12}
                      fill="none"
                      stroke="#fef08a"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 animate-spin-slow"
                    />
                  )}
                  {/* Electron Core */}
                  <circle
                    r={isDraggableValence ? 8 : 6}
                    fill={isDraggableValence ? "#fbbf24" : "#10b981"}
                    stroke={isDraggableValence ? "#fde68a" : "#6ee7b7"}
                    strokeWidth={isDraggableValence ? 2 : 1.5}
                    filter="url(#glow-filter)"
                  />
                  {/* Minus symbol */}
                  <line
                    x1={-3}
                    y1={0}
                    x2={3}
                    y2={0}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </g>

          {/* RUBBER BAND LINE WHILE DRAGGING */}
          {dragged && (
            <g id="drag-feedback">
              <line
                x1={dragged.startX}
                y1={dragged.startY}
                x2={dragged.currentX}
                y2={dragged.currentY}
                stroke={dragged.fromZone === 'atom' ? '#fbbf24' : '#10b981'}
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              {/* Dragged electron avatar */}
              <g transform={`translate(${dragged.currentX}, ${dragged.currentY})`}>
                <circle
                  r={16}
                  fill="url(#valenceGlow)"
                  opacity="0.9"
                  filter="url(#strong-glow)"
                />
                <circle
                  r={8}
                  fill="#fbbf24"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <line
                  x1={-3.5}
                  y1={0}
                  x2={3.5}
                  y2={0}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            </g>
          )}

          {/* FREE ELECTRON TRAY / RESERVOIR ZONE (Bottom) */}
          <g id="free-electron-reservoir" transform="translate(130, 505)">
            {/* Tray background with sleek glass aesthetic */}
            <rect
              x={0}
              y={0}
              width={440}
              height={56}
              rx={16}
              fill="rgba(255, 255, 255, 0.04)"
              stroke={isHoveringTrayZone ? '#818cf8' : 'rgba(255, 255, 255, 0.1)'}
              strokeWidth={isHoveringTrayZone ? 2 : 1}
              strokeDasharray={isHoveringTrayZone ? '4 4' : 'none'}
            />

            {/* Tray Label */}
            <text
              x={220}
              y={18}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="11"
              fontWeight="600"
            >
              자유 전자 저장소 (드래그하여 원자에 전자를 추가/음이온 형성)
            </text>

            {/* Draggable Free Electron Tokens */}
            {[70, 145, 220, 295, 370].map((posX, i) => (
              <g
                key={`tray-electron-${i}`}
                transform={`translate(${posX}, 36)`}
                className="cursor-grab active:cursor-grabbing group"
                onMouseDown={(e) => handleStartDragFromTray(e)}
                onTouchStart={(e) => handleStartDragFromTray(e)}
              >
                {/* Transparent generous hit box */}
                <circle
                  r={18}
                  fill="transparent"
                  className="select-none"
                />
                <circle
                  r={13}
                  fill="url(#electronGlow)"
                  opacity="0.6"
                  className="group-hover:opacity-100 transition-opacity duration-150"
                />
                <circle
                  r={7}
                  fill="#10b981"
                  stroke="#a7f3d0"
                  strokeWidth="1.5"
                  className="group-hover:stroke-white transition-colors"
                />
                <line
                  x1={-3}
                  y1={0}
                  x2={3}
                  y2={0}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* 3. Layer 3 Bottom: 입자수 비교 및 전하 균형 (Particle Count & Charge Balance) */}
      <div className="w-full p-2 sm:p-2.5 bg-slate-950/90 border-t border-white/10 backdrop-blur-md flex flex-col gap-1.5 z-10 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
            입자수 비교 및 전하 균형
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] text-slate-300 bg-white/5 px-2 py-0.2 rounded-full border border-white/10 font-bold">
            상태: <span className={isCation ? 'text-indigo-300' : isAnion ? 'text-rose-300' : 'text-emerald-400'}>{formatIonSymbol(element.symbol, netCharge)}</span>
          </span>
        </div>

        {/* Line 1: Protons */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
            <div className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
              <span className="text-slate-200 font-semibold">양성자 (+)</span>
            </div>
            <span className="font-mono font-bold text-rose-400 text-[11px] sm:text-xs">
              {element.protons}개 (+{element.protons})
            </span>
          </div>
          
          {/* Visual Protons Circle Badges */}
          <div className="flex flex-wrap gap-1 p-1 bg-rose-950/30 border border-rose-500/20 rounded-lg max-h-[30px] sm:max-h-[50px] overflow-y-auto items-center">
            {Array.from({ length: element.protons }).map((_, idx) => (
              <span
                key={`proto-dot-${idx}`}
                title={`양성자 #${idx + 1} (+)`}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-500 text-white font-mono font-black text-[8px] sm:text-[9px] flex items-center justify-center shadow-xs shrink-0"
              >
                +
              </span>
            ))}
          </div>
        </div>

        {/* Line 2: Electrons */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
            <div className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
              <span className="text-slate-200 font-semibold">전자 (-)</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-[11px] sm:text-xs">
              {currentElectrons}개 (-{currentElectrons})
            </span>
          </div>
          
          {/* Visual Electrons Circle Badges */}
          <div className="flex flex-wrap gap-1 p-1 bg-emerald-950/30 border border-emerald-500/20 rounded-lg max-h-[30px] sm:max-h-[50px] overflow-y-auto items-center">
            {currentElectrons === 0 ? (
              <span className="text-[9px] text-slate-500 italic pl-1">전자 없음 (0개)</span>
            ) : (
              Array.from({ length: currentElectrons }).map((_, idx) => (
                <span
                  key={`elec-dot-${idx}`}
                  title={`전자 #${idx + 1} (-)`}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-400 text-slate-950 font-mono font-black text-[9px] sm:text-[10px] flex items-center justify-center shadow-xs shrink-0 transition-all"
                >
                  -
                </span>
              ))
            )}
          </div>
        </div>

        {/* Footer: Charge Equation */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-0.5 border-t border-white/10 font-medium">
          <span className="text-slate-400 text-[9px] sm:text-[10px]">전하 계산식:</span>
          <span className="font-mono text-slate-200 font-bold text-[11px] sm:text-xs">
            (+{element.protons}) + (-{currentElectrons}) ={' '}
            <span className={isCation ? 'text-indigo-300 font-black' : isAnion ? 'text-rose-400 font-black' : 'text-emerald-400 font-black'}>
              {netCharge > 0 ? `+${netCharge}` : netCharge} → <b>{formatIonSymbol(element.symbol, netCharge)}</b>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
