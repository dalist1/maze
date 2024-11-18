import { tool } from 'ai';
import { z } from 'zod';
import { MoveDirection, Position } from './types.js';
import { isValidMove, makeMove, calculateManhattanDistance } from './gameLogic.js';
import { gameState } from './gameState.js';
import { telemetry } from './telemetry.js';

export const gameTools = {
  scan: tool({
    description: 'Scan surroundings to detect walls, target, and possible moves',
    parameters: z.object({}),
    execute: async () => {
      const state = gameState.getState();
      const possibleMoves = (['UP', 'DOWN', 'LEFT', 'RIGHT'] as const)
        .filter(direction => isValidMove(makeMove(state.playerPosition, direction), state));

      const distanceToTarget = calculateManhattanDistance(state.playerPosition, state.targetPosition);

      
      const isTargetReached = (
        state.playerPosition.x === state.targetPosition.x && 
        state.playerPosition.y === state.targetPosition.y
      );

      return {
        currentPosition: state.playerPosition,
        targetPosition: state.targetPosition,
        distanceToTarget,
        possibleMoves,
        visitedPositions: [...telemetry.metrics.visitedPositions],
        isTargetReached
      };
    }
  }),

  move: tool({
    description: 'Execute a move in the specified direction',
    parameters: z.object({
      direction: z.enum(['UP', 'DOWN', 'LEFT', 'RIGHT'] as const),
      reasoning: z.string(),
      confidence: z.number().min(0).max(1),
      alternativesConsidered: z.number(),
      expectedOutcome: z.number()
    }),
    execute: async ({ direction, reasoning, confidence, alternativesConsidered, expectedOutcome }) => {
      const state = gameState.getState();
      const newPosition = makeMove(state.playerPosition, direction);
      const isValid = isValidMove(newPosition, state);
      
      const actualOutcome = isValid 
        ? 1 - (calculateManhattanDistance(newPosition, state.targetPosition) / (state.gridSize * 2))
        : 0;

      const decisionMetrics = { confidence, alternativesConsidered, expectedOutcome, actualOutcome };
      
      telemetry.logMove(isValid, isValid ? newPosition : state.playerPosition, decisionMetrics);
      
      isValid && (telemetry.addToPath(direction), gameState.setState({ playerPosition: newPosition }));

      telemetry.logEvent({
        type: isValid ? 'MOVE' : 'INVALID_MOVE',
        data: { direction, newPosition, reasoning },
        metrics: decisionMetrics
      });

      return {
        success: isValid,
        position: isValid ? newPosition : state.playerPosition,
        message: `Move ${direction}: ${isValid ? 'Success' : 'Invalid'}`,
        metrics: decisionMetrics
      };
    }
  }),

  submit: tool({
    description: 'Submit final solution',
    parameters: z.object({
      explanation: z.string(),
      confidenceScore: z.number().min(0).max(1)
    }),
    execute: async ({ explanation, confidenceScore }) => {
      telemetry.logEvent({
        type: 'SUBMIT',
        data: { 
          explanation,
          confidenceScore,
          finalMetrics: telemetry.getMetricsSummary()
        }
      });
      return { success: true };
    }
  })
};
