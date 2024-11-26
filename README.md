# AI Maze Navigation Agent 🚀

Unlock the future of autonomous navigation with our cutting-edge AI Maze Navigation Agent! Built to impress, this system showcases the power of AI in real-time decision-making and performance optimization.

## 🌟 Overview
Experience the brilliance of autonomous pathfinding with our AI Maze Navigation system. Utilizing the advanced gpt-4o-mini model, this project demonstrates unparalleled real-time decision analysis and environmental scanning, all powered by the Vercel AI SDK.

## 🛠️ Technical Stack
- **Runtime**: Bun
- **Language**: TypeScript 5.x
- **AI Model**: gpt-4o-mini by OpenAI
- **AI SDK**: Vercel AI SDK with OpenAI Provider
- **Development Tools**: Biome, Zod for validation

## 🤖 AI Decision Making System

### 🌐 Tool-based Navigation
The AI navigates the maze through three sophisticated tools:

1. **Scan Tool**
   - Analyzes the environment
   - Identifies current and target positions
   - Calculates Manhattan distance to the target
   - Lists valid moves and tracks visited positions
   - Reports on target acquisition status

2. **Move Tool**
   - Executes movements (UP, DOWN, LEFT, RIGHT) with explicit reasoning
   - Includes confidence scoring and alternative considerations
   - Predicts outcomes and validates moves against obstacles

3. **Submit Tool**
   - Finalizes the navigation attempt
   - Provides a comprehensive path analysis with confidence scoring
   - Generates detailed strategy explanations

### 📋 AI Prompting Strategy
The AI is guided by a focused prompting structure:

1. **Core Directives**
   - Efficiently navigate from start (P) to target (T)
   - Avoid walls and boundaries
   - Optimize the path

2. **Strategic Guidelines**
   - Continuous environment scanning
   - Evaluate moves based on distance reduction
   - Minimize backtracking and make confidence-based decisions

3. **Decision Requirements**
   - Provide explicit reasoning for each move
   - Consider alternative paths with confidence assessment
   - Predict outcomes accurately

## 📈 Performance Monitoring

### 🔍 Real-time Metrics
Monitor performance with real-time indicators:

1. **Navigation Metrics**
   - Move count and validity
   - Path optimization ratio
   - Backtracking frequency
   - Exploration efficiency

2. **Decision Quality**
   - Move confidence accuracy
   - Prediction vs. actual outcomes
   - Depth of alternative considerations
   - Quality of decision reasoning

3. **Path Analysis**
   - Optimal path deviation
   - Target approach efficiency
   - Space coverage
   - Movement pattern analysis

### 🌟 Visual Feedback
Get instant visual insights with:
- Current maze state
- Player position and movement history
- Decision confidence levels
- Performance metrics
- AI reasoning for each move

## 💻 Project Structure

```
src/
├── tools.ts      # AI interaction tools
├── gameLogic.ts  # Core mechanics
├── gameState.ts  # State management
├── telemetry.ts  # Performance tracking
└── display.ts    # Visualization
```

## 🚀 Quick Start

```bash
bun install
echo "OPENAI_API_KEY=your_key_here" > .env
bun run start
```

## 📜 License
MIT
