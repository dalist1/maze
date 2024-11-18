# AI Maze Game

An interactive terminal-based maze navigation game powered by the Vercel AI SDK and OpenAI.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your OpenAI API key
4. Build and run the project:
   ```bash
   npm run build
   npm start
   ```

## Development

- `npm run dev` - Run in development mode with ts-node
- `npm run build` - Build the TypeScript code
- `npm start` - Run the built code
- `npm run tree` - Generate project structure
- `npm run ex` - Extract project content
- `npm run push` - Push changes
- `npm run clr` - Clean up generated files

## Game Features

- Visual maze representation with colors
- Step-by-step movement animation
- AI reasoning display
- Interactive progress tracking

## Game Legend
- 🟢 P: Player position
- 🟡 T: Target position
- 🔴 █: Wall
- ⚪ ·: Empty space

## Architecture

The game uses a modular architecture with:
- State management (GameStateManager)
- AI tools for navigation
- Visual display system
- Type-safe implementation

## Technical Stack

- TypeScript
- Vercel AI SDK
- OpenAI GPT-4
- Node.js
