import { z } from 'zod';

export const Position = z.object({
  x: z.number(),
  y: z.number()
}).strict();

export type Position = z.infer<typeof Position>;
export type MoveDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface GameState {
  readonly playerPosition: Position;
  readonly targetPosition: Position;
  readonly walls: readonly Position[];
  readonly gridSize: number;
}

export interface DecisionMetrics {
  readonly confidence: number;
  readonly alternativesConsidered: number;
  readonly expectedOutcome: number;
  readonly actualOutcome: number;
  readonly reasoning?: string;
}

export interface PathNode {
  readonly position: Position;
  readonly g: number;
  readonly h: number;
  readonly f: number;
  readonly parent?: PathNode;
}

export interface TelemetryEvent {
  readonly type: string;
  readonly timestamp: number;
  readonly data: Record<string, any>;
  readonly metrics?: DecisionMetrics;
}

export interface MoveTimingInfo {
  readonly moveNumber: number;
  readonly duration: number;
  readonly success: boolean;
  readonly isBacktracking: boolean;
}

export interface DecisionHistoryEntry {
  readonly originalMetrics: DecisionMetrics;
  readonly adjustedMetrics: DecisionMetrics;
  readonly success: boolean;
  readonly isBacktracking: boolean;
  readonly timestamp: number;
}

export interface AnalysisLogEntry {
  readonly timestamp: number;
  readonly event: string;
  readonly details: Record<string, any>;
}

export interface GameMetrics {
  moves: number;
  invalidMoves: number;
  visitedPositions: Set<string>;
  startTime: number;
  endTime?: number;
  path: MoveDirection[];
  decisions: DecisionMetrics[];
  optimalPathLength?: number;
  backtrackCount: number;
  averageConfidence: number;
  explorationRatio: number;
  progressToTarget: number;
  decisionAccuracy: number;
  initialDistance: number;
  decisionHistory: DecisionHistoryEntry[];
  moveTimings: MoveTimingInfo[];
  lastMoveTimestamp: number;
  analysisLog: AnalysisLogEntry[];
}
