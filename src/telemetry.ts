import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { GameMetrics, TelemetryEvent, DecisionMetrics, Position, GameState, MoveDirection } from './types.js';
import { findOptimalPath, calculateManhattanDistance } from './gameLogic.js';
import { gameState } from './gameState.js';

export class TelemetrySystem {
  metrics: GameMetrics = {
    moves: 0,
    invalidMoves: 0,
    visitedPositions: new Set(),
    startTime: Date.now(),
    path: [],
    decisions: [],
    backtrackCount: 0,
    averageConfidence: 0,
    explorationRatio: 0,
    progressToTarget: 0,
    decisionAccuracy: 0,
    initialDistance: 0,
    decisionHistory: [],
    moveTimings: [],
    lastMoveTimestamp: Date.now(),
    analysisLog: []
  };

  private events: TelemetryEvent[] = [];
  private previousPositions: Position[] = [];
  private initialState: GameState | null = null;

  async initialize(): Promise<void> {
    try {
      await mkdir(join(process.cwd(), 'logs'), { recursive: true });
      const state = gameState.getState();
      this.initialState = { ...state };
      
      const optimalPath = findOptimalPath(state.playerPosition, state.targetPosition, state);
      
      Object.assign(this.metrics, {
        optimalPathLength: optimalPath.length - 1,
        initialDistance: calculateManhattanDistance(state.playerPosition, state.targetPosition)
      });

      this.metrics.analysisLog.push({
        timestamp: Date.now(),
        event: 'INITIALIZATION',
        details: {
          startPosition: state.playerPosition,
          targetPosition: state.targetPosition,
          optimalPathLength: this.metrics.optimalPathLength,
          initialDistance: this.metrics.initialDistance
        }
      });
    } catch (error) {
      console.warn('Warning: Could not initialize telemetry', error);
    }
  }

  logMove = (success: boolean, position: Position, metrics: DecisionMetrics): void => {
    const currentTime = Date.now();
    const moveTime = currentTime - this.metrics.lastMoveTimestamp;
    this.metrics.lastMoveTimestamp = currentTime;
    
    success ? this.metrics.moves++ : this.metrics.invalidMoves++;
    this.metrics.visitedPositions.add(`${position.x},${position.y}`);
    
    const state = gameState.getState();
    const currentDistance = calculateManhattanDistance(position, state.targetPosition);
    const progressPercentage = Math.max(0, (this.metrics.initialDistance - currentDistance) / 
                                         this.metrics.initialDistance * 100);
    
    const isBacktracking = this.isBacktrackingMove(position);
    isBacktracking && this.metrics.backtrackCount++;
    
    this.previousPositions.push(position);
    
    const adjustedMetrics = this.processDecisionMetrics(metrics, success, isBacktracking);
    this.metrics.decisions.push(adjustedMetrics);
    
    this.metrics.moveTimings.push({
      moveNumber: this.metrics.moves,
      duration: moveTime,
      success,
      isBacktracking
    });
    
    this.metrics.progressToTarget = progressPercentage;
    
    this.metrics.analysisLog.push({
      timestamp: currentTime,
      event: success ? 'SUCCESSFUL_MOVE' : 'FAILED_MOVE',
      details: {
        position,
        distanceToTarget: currentDistance,
        progress: progressPercentage,
        moveTime,
        isBacktracking,
        metrics: adjustedMetrics
      }
    });
    
    this.updateAggregateMetrics();
  };

  private isBacktrackingMove = (position: Position): boolean => {
    if (this.previousPositions.length < 2) return false;
    
    const previousPosition = this.previousPositions.at(-1)!;
    const state = gameState.getState();
    
    const prevDistance = calculateManhattanDistance(previousPosition, state.targetPosition);
    const newDistance = calculateManhattanDistance(position, state.targetPosition);
    
    return newDistance > prevDistance || 
           this.previousPositions.slice(0, -1)
             .some(pos => pos.x === position.x && pos.y === position.y);
  };

  private processDecisionMetrics = (
    metrics: DecisionMetrics,
    success: boolean,
    isBacktracking: boolean
  ): DecisionMetrics => {
    const adjustedMetrics = { ...metrics };
    
    if (!success) adjustedMetrics.confidence *= 0.5;
    if (isBacktracking) adjustedMetrics.confidence *= 0.8;
    
    const recentDecisions = this.metrics.decisions.slice(-3);
    if (recentDecisions.length) {
      adjustedMetrics.expectedOutcome *= this.calculateRecentAccuracy(recentDecisions);
    }
    
    this.metrics.decisionHistory.push({
      originalMetrics: metrics,
      adjustedMetrics,
      success,
      isBacktracking,
      timestamp: Date.now()
    });
    
    return adjustedMetrics;
  };

  private calculateRecentAccuracy = (decisions: DecisionMetrics[]): number =>
    decisions.reduce((acc, d) => acc + (d.actualOutcome / d.expectedOutcome), 0) / decisions.length;

  private updateAggregateMetrics = (): void => {
    const recentDecisions = this.metrics.decisions.slice(-3);
    this.metrics.averageConfidence = recentDecisions.reduce((sum, d, i) => 
      sum + (d.confidence * ((i + 1) / recentDecisions.length)), 0) / 
      (recentDecisions.length || 1);
    
    this.metrics.explorationRatio = this.metrics.visitedPositions.size / 
      (this.metrics.moves + this.metrics.invalidMoves);
    
    this.metrics.decisionAccuracy = this.calculateDecisionAccuracy();
  };

  private calculateDecisionAccuracy = (): number =>
    !this.metrics.decisions.length ? 1 :
    this.metrics.decisions.reduce((sum, d) => 
      sum + ((d.actualOutcome / d.expectedOutcome) * 
             (1 - Math.abs(d.confidence - d.actualOutcome))), 0) / 
    this.metrics.decisions.length;

  addToPath = (move: string): void => {
    this.metrics.path.push(move as MoveDirection);
  };

  logEvent = (event: Omit<TelemetryEvent, 'timestamp'>): void => {
    const fullEvent = { ...event, timestamp: Date.now() };
    this.events.push(fullEvent);
    
    this.metrics.analysisLog.push({
      timestamp: fullEvent.timestamp,
      event: event.type,
      details: event.data
    });
  };

  getLatestEvent = (): TelemetryEvent | undefined => this.events.at(-1);

  getMetricsSummary = (): string => {
    const duration = (Date.now() - this.metrics.startTime) / 1000;
    const [efficiency, decisionQuality] = [this.calculateEfficiency(), this.calculateDecisionQuality()];
    
    return JSON.stringify({
      moves: this.metrics.moves,
      invalidMoves: this.metrics.invalidMoves,
      uniquePositions: this.metrics.visitedPositions.size,
      duration: `${duration.toFixed(2)}s`,
      efficiency: `${efficiency.toFixed(2)}%`,
      pathDeviation: this.calculatePathDeviation(),
      decisionQuality: `${decisionQuality.toFixed(2)}%`,
      backtrackRatio: `${((this.metrics.backtrackCount / this.metrics.moves) * 100).toFixed(2)}%`,
      averageConfidence: `${(this.metrics.averageConfidence * 100).toFixed(2)}%`,
      explorationEfficiency: `${(this.metrics.explorationRatio * 100).toFixed(2)}%`,
      progressToTarget: `${this.metrics.progressToTarget.toFixed(2)}%`,
      decisionAccuracy: `${(this.metrics.decisionAccuracy * 100).toFixed(2)}%`,
      averageMoveTime: `${this.calculateAverageMoveTime().toFixed(2)}ms`,
      path: this.metrics.path
    });
  };

  private calculateEfficiency = (): number =>
    !this.metrics.moves || !this.metrics.optimalPathLength ? 0 :
    Math.max(0, (this.metrics.optimalPathLength / this.metrics.moves) * 100 - 
             (this.metrics.backtrackCount * 0.1));

  private calculatePathDeviation = (): number =>
    this.metrics.optimalPathLength ? 
    Math.abs(this.metrics.path.length - this.metrics.optimalPathLength) : 0;

private calculateDecisionQuality = (): number =>
    !this.metrics.decisions.length ? 0 :
    this.metrics.decisions.reduce((sum, d) => {
      const outcomeAccuracy = d.actualOutcome / d.expectedOutcome;
      const confidenceAccuracy = 1 - Math.abs(d.confidence - d.actualOutcome);
      const alternativesBonus = Math.min(d.alternativesConsidered / 4, 1) * 0.2;
      return sum + (outcomeAccuracy * confidenceAccuracy * (1 + alternativesBonus));
    }, 0) / this.metrics.decisions.length * 100;

  private calculateAverageMoveTime = (): number =>
    !this.metrics.moveTimings.length ? 0 :
    this.metrics.moveTimings.reduce((sum, timing) => sum + timing.duration, 0) / 
    this.metrics.moveTimings.length;

  async save(sessionId: string): Promise<Record<string, any>> {
    const filename = join(process.cwd(), 'logs', `telemetry-${sessionId}.json`);
    const data = {
      metrics: {
        ...this.metrics,
        endTime: Date.now(),
        efficiency: this.calculateEfficiency(),
        pathDeviation: this.calculatePathDeviation(),
        decisionQuality: this.calculateDecisionQuality(),
        averageMoveTime: this.calculateAverageMoveTime()
      },
      events: this.events,
      initialState: this.initialState
    };

    try {
      await writeFile(filename, JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Failed to save telemetry:', error);
      return data;
    }
  }
}

export const telemetry = new TelemetrySystem();
