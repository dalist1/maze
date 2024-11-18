import { Position, MoveDirection, GameState, PathNode } from './types.js';

export const calculateManhattanDistance = (pos1: Position, pos2: Position): number =>
  Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);

export const makeMove = (position: Position, direction: MoveDirection): Position => {
  const moves = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
  } as const;
  
  const delta = moves[direction];
  return { x: position.x + delta.x, y: position.y + delta.y };
};

export const isValidMove = ({ x, y }: Position, state: GameState): boolean => 
  x >= 0 && x < state.gridSize && y >= 0 && y < state.gridSize &&
  !state.walls.some(wall => wall.x === x && wall.y === y);

export const findOptimalPath = (start: Position, target: Position, state: GameState): PathNode[] => {
  const openSet = new Set<PathNode>();
  const closedSet = new Set<string>();
  
  const startNode: Omit<PathNode, 'f'> & { f?: number } = {
    position: start,
    g: 0,
    h: calculateManhattanDistance(start, target)
  };
  startNode.f = startNode.g + startNode.h;
  openSet.add(startNode as PathNode);
  
  while (openSet.size > 0) {
    const current = Array.from(openSet).reduce((min, node) => node.f < min.f ? node : min);
    
    if (current.position.x === target.x && current.position.y === target.y) {
      const path: PathNode[] = [];
      let curr: PathNode | undefined = current;
      while (curr) {
        path.unshift(curr);
        curr = curr.parent;
      }
      return path;
    }
    
    openSet.delete(current);
    closedSet.add(`${current.position.x},${current.position.y}`);
    
    for (const direction of ['UP', 'DOWN', 'LEFT', 'RIGHT'] as const) {
      const newPosition = makeMove(current.position, direction);
      const posKey = `${newPosition.x},${newPosition.y}`;
      
      if (!isValidMove(newPosition, state) || closedSet.has(posKey)) continue;
      
      const g = current.g + 1;
      const h = calculateManhattanDistance(newPosition, target);
      const f = g + h;
      
      const neighbor: PathNode = {
        position: newPosition,
        g,
        h,
        f,
        parent: current
      };
      
      const existingNode = Array.from(openSet)
        .find(node => node.position.x === newPosition.x && node.position.y === newPosition.y);
      
      if (!existingNode) {
        openSet.add(neighbor);
      } else if (g < existingNode.g) {
        Object.assign(existingNode, { g, f, parent: current });
      }
    }
  }
  
  return [];
};
