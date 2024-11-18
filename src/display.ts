import chalk from 'chalk';
import { Position, GameState, MoveDirection } from './types.js';
import { clearScreen, sleep } from './utils.js';
import { telemetry } from './telemetry.js';

const CELL_WIDTH = 6;
const ANIMATION_DELAY = 500;

const SYMBOLS = {
  PLAYER: '😀',
  TARGET: '🎯',
  WALL: '🧱',
  PATH: '👣',
  EMPTY: '  ',
  HORIZONTAL_WALL: '━'.repeat(CELL_WIDTH),
  VERTICAL_WALL: '┃',
  TOP_LEFT: '┏',
  TOP_RIGHT: '┓',
  BOTTOM_LEFT: '┗',
  BOTTOM_RIGHT: '┛',
  ARROW_UP: '↑',
  ARROW_DOWN: '↓',
  ARROW_LEFT: '←',
  ARROW_RIGHT: '→'
} as const;

const getArrowForDirection = (direction: MoveDirection): string => 
  ({
    UP: SYMBOLS.ARROW_UP,
    DOWN: SYMBOLS.ARROW_DOWN,
    LEFT: SYMBOLS.ARROW_LEFT,
    RIGHT: SYMBOLS.ARROW_RIGHT
  })[direction];

const formatCell = (content: string): string => {
  const padding = Math.floor((CELL_WIDTH - content.length) / 2);
  return ' '.repeat(padding) + content + ' '.repeat(CELL_WIDTH - content.length - padding);
};

const drawHorizontalBorder = (width: number, isTop = true): string => {
  const [start, end] = isTop 
    ? [SYMBOLS.TOP_LEFT, SYMBOLS.TOP_RIGHT] 
    : [SYMBOLS.BOTTOM_LEFT, SYMBOLS.BOTTOM_RIGHT];
  return start + SYMBOLS.HORIZONTAL_WALL.repeat(width) + end;
};

export const renderMazeFrame = async (
  state: GameState,
  stepNumber: number,
  decisionMetrics: Record<string, any> = {},
  previousMoves: MoveDirection[] = []
): Promise<void> => {
  clearScreen();
  
  console.log(chalk.cyan('\n=== AI Maze Navigation ==='));
  console.log(chalk.gray(`Step ${stepNumber}`));
  
  const { gridSize } = state;
  console.log(chalk.cyan('\n' + drawHorizontalBorder(gridSize)));
  
  for (let y = 0; y < gridSize; y++) {
    const cellContents = Array.from({ length: gridSize }, (_, x) => {
      const pos = { x, y };
      
      return (
        x === state.playerPosition.x && y === state.playerPosition.y ? SYMBOLS.PLAYER :
        x === state.targetPosition.x && y === state.targetPosition.y ? SYMBOLS.TARGET :
        state.walls.some(wall => wall.x === x && wall.y === y) ? SYMBOLS.WALL :
        isPositionInPath(pos, previousMoves, state.playerPosition) ? SYMBOLS.PATH :
        SYMBOLS.EMPTY
      );
    });

    const row = chalk.cyan(SYMBOLS.VERTICAL_WALL) + 
                cellContents.map(formatCell).join('') + 
                chalk.cyan(SYMBOLS.VERTICAL_WALL);
    console.log(row);
  }
  
  console.log(chalk.cyan(drawHorizontalBorder(gridSize, false)));

  const metrics = JSON.parse(telemetry.getMetricsSummary());
  console.log(chalk.cyan('\n=== Performance Metrics ==='));
  
  const metricsDisplay: [string, string][] = [
    ['Moves', `${metrics.moves} (${metrics.invalidMoves} invalid)`],
    ['Efficiency', metrics.efficiency],
    ['Decision Quality', metrics.decisionQuality],
    ['Decision Accuracy', metrics.decisionAccuracy],
    ['Progress', metrics.progressToTarget],
    ['Exploration', metrics.explorationEfficiency]
  ];

  const maxLen = metricsDisplay.reduce((max, [label]) => 
    Math.max(max, label.length), 0);

  metricsDisplay.forEach(([label, value]) => 
    console.log(`${label.padEnd(maxLen + 2)}: ${value}`));

  if (decisionMetrics.reasoning) {
    console.log(chalk.cyan('\n=== Decision Analysis ==='));
    Object.entries({
      'Current Move   ': getArrowForDirection(decisionMetrics.direction),
      'Confidence     ': `${(decisionMetrics.confidence * 100).toFixed(1)}%`,
      'Alternatives   ': decisionMetrics.alternativesConsidered,
      'Expected Result': `${(decisionMetrics.expectedOutcome * 100).toFixed(1)}%`,
      'Actual Result  ': `${(decisionMetrics.actualOutcome * 100).toFixed(1)}%`
    }).forEach(([label, value]) => console.log(chalk.yellow(label), value));

    console.log(chalk.cyan('\n=== Reasoning ==='));
    console.log(chalk.white(decisionMetrics.reasoning));
  }

  await sleep(ANIMATION_DELAY);
};

const isPositionInPath = (pos: Position, moves: MoveDirection[], startPos: Position): boolean => {
  const currentPos = moves.reduce((acc, move) => {
    const delta = {
      UP: { x: 0, y: -1 },
      DOWN: { x: 0, y: 1 },
      LEFT: { x: -1, y: 0 },
      RIGHT: { x: 1, y: 0 }
    }[move];
    return { x: acc.x + delta.x, y: acc.y + delta.y };
  }, { ...startPos });

  return currentPos.x === pos.x && currentPos.y === pos.y;
};
