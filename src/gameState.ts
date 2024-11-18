import { GameState } from './types.js';

class GameStateManager {
  private static instance: GameStateManager;
  
  private currentState: GameState = {
    playerPosition: { x: 0, y: 3 },
    targetPosition: { x: 3, y: 0 },
    walls: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 3, y: 1 },
      { x: 3, y: 2 }
    ],
    gridSize: 4
  };

  private constructor() {}

  public static getInstance = (): GameStateManager => 
    GameStateManager.instance ??= new GameStateManager();

  public getState = (): GameState => ({ ...this.currentState });

  public setState = (newState: Partial<GameState>): void => {
    this.currentState = { ...this.currentState, ...newState };
  };

  public resetState = (): void => {
    this.currentState = {
      playerPosition: { x: 0, y: 3 },
      targetPosition: { x: 3, y: 0 },
      walls: [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 3, y: 1 },
        { x: 3, y: 2 }
      ],
      gridSize: 4
    };
  };
}

export const gameState = GameStateManager.getInstance();
