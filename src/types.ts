/**
 * 이온 형성 시뮬레이션 타입 정의
 * Middle School Grade 2 Chemistry - Formation of Ions
 */

export type ElementSymbol =
  | 'H'
  | 'He'
  | 'Li'
  | 'Be'
  | 'B'
  | 'C'
  | 'N'
  | 'O'
  | 'F'
  | 'Ne'
  | 'Na'
  | 'Mg'
  | 'Al'
  | 'Si'
  | 'P'
  | 'S'
  | 'Cl'
  | 'Ar'
  | 'K'
  | 'Ca';

export type SupportedElementSymbol = 'H' | 'Li' | 'Na' | 'K' | 'F' | 'Cl' | 'Mg' | 'Ca' | 'O' | 'S';

export type ElementCategory = 'alkali' | 'alkaline_earth' | 'nonmetal' | 'halogen' | 'noble_gas' | 'metalloid' | 'metal';

export type IonType = 'cation' | 'anion' | 'neutral' | 'unstable';

export interface ElementData {
  symbol: ElementSymbol;
  nameKr: string;
  nameEn: string;
  atomicNumber: number;
  protons: number;
  neutrons: number;
  neutralElectrons: number;
  defaultShells: number[]; // e.g., [2, 8, 1]
  stableCharge: number;    // e.g., +1 for Na, -1 for Cl, +2 for Mg, -2 for O
  ionFormula: string;     // e.g., "Na⁺", "Cl⁻", "Mg²⁺", "O²⁻"
  ionNameKr: string;      // e.g., "나트륨 이온", "염화 이온"
  defaultIonType: 'cation' | 'anion';
  period: number;         // 1 ~ 4
  group: number;          // 1 ~ 18
  category: ElementCategory;
  isPrimarySupported: boolean;
  electronGainLossCount: number; // e.g. 1 electron lost, 2 electrons gained
  reactionEquation: string;      // e.g., "Na → Na⁺ + e⁻"
  reactionDescription: string;  // e.g., "전자 1개를 잃고 양이온(Na⁺)이 됨"
  nobleGasTarget: string;        // e.g., "네온(Ne)과 같은 안정된 전자 배치 (2, 8)"
  curriculumNotes: string;      // Middle school pedagogical explanation
}

export type ModelType = 'rutherford' | 'bohr';

export interface ElectronPosition {
  id: string;
  shellIndex: number;
  subIndex: number;
  angle: number; // in radians
  speed: number;
  orbitRadius: number;
  rutherfordTiltX: number;
  rutherfordTiltY: number;
  rutherfordTiltZ: number;
  isFree?: boolean; // free electron in environment
  freeX?: number;
  freeY?: number;
}

export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'celebration';
  title: string;
  message: string;
  timestamp: number;
}

export interface MissionTheory {
  summary: string;
  electronMovementReason: string;
  chargeBalanceDetail: string;
  nobleGasConfiguration: string;
  namingRule: string;
  reactionEquation: string;
  keyTakeaway: string;
}

export interface LearningMission {
  id: string;
  title: string;
  element: SupportedElementSymbol;
  targetCharge: number;
  targetIonName: string;
  hint: string;
  instruction: string;
  completed: boolean;
  theory: MissionTheory;
}
