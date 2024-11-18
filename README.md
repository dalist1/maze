# AI Maze Navigation System

## Overview
An experimental maze navigation system powered by GPT-4, demonstrating autonomous pathfinding with real-time decision analysis and performance monitoring. The system leverages the Vercel AI SDK to create a structured tool-based interaction pattern with the AI model.

## Technical Stack
- **Runtime**: Bun
- **Language**: TypeScript 5.x
- **AI Model**: gpt-4o-mini (OpenAI)
- **AI SDK**: Vercel AI SDK with OpenAI Provider
- **Development**: Biome, Zod for validation

## AI Decision Making System

### Tool-based Navigation
The AI interacts with the environment through three primary tools:

1. **Scan Tool**
   - Provides environmental analysis
   - Returns current and target positions
   - Calculates Manhattan distance to target
   - Lists possible valid moves
   - Tracks visited positions for backtracking analysis
   - Reports target acquisition status

2. **Move Tool**
   - Executes directional movement (UP, DOWN, LEFT, RIGHT)
   - Requires explicit reasoning for each move
   - Includes confidence scoring (0-1)
   - Tracks number of alternatives considered
   - Predicts expected outcome
   - Validates moves against walls and boundaries

3. **Submit Tool**
   - Finalizes navigation attempt
   - Provides comprehensive path analysis
   - Includes confidence scoring for overall solution
   - Generates detailed explanation of strategy

### AI Prompting Strategy
The system uses a focused prompt structure to guide the AI's decision-making:

1. **Core Directives**
   - Efficient navigation from start (P) to target (T)
   - Wall avoidance and boundary recognition
   - Path optimization prioritization

2. **Strategic Guidelines**
   - Continuous environment scanning
   - Move evaluation based on distance reduction
   - Backtracking minimization
   - Confidence-based decision making

3. **Decision Requirements**
   - Explicit reasoning for each move
   - Alternative path consideration
   - Confidence level assessment
   - Outcome prediction

## Performance Monitoring

### Real-time Metrics
The system tracks various performance indicators:

1. **Navigation Metrics**
   - Move count and validity
   - Path optimization ratio
   - Backtracking frequency
   - Exploration efficiency

2. **Decision Quality**
   - Move confidence accuracy
   - Prediction vs actual outcome
   - Alternative consideration depth
   - Decision reasoning quality

3. **Path Analysis**
   - Deviation from optimal path
   - Target approach efficiency
   - Coverage of available space
   - Movement pattern analysis

### Visual Feedback
The system provides real-time visualization of:

- Current maze state
- Player position and movement history
- Decision confidence levels
- Performance metrics
- AI reasoning for each move

## Project Structure

```
src/
├── tools.ts      # AI interaction tools
├── gameLogic.ts  # Core mechanics
├── gameState.ts  # State management
├── telemetry.ts  # Performance tracking
└── display.ts    # Visualization
```

## Quick Start

```bash
bun install
echo "OPENAI_API_KEY=your_key_here" > .env
bun run start
```

## License
MIT