import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { gameTools } from './tools.js';
import { telemetry } from './telemetry.js';
import { renderMazeFrame } from './display.js';
import { gameState } from './gameState.js';
import { sleep } from './utils.js';
import chalk from 'chalk';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'strict',
});

async function runMazeSolver() {
  const sessionId = Date.now().toString();
  await telemetry.initialize();

  try {
    let stepNumber = 0;
    const initialState = gameState.getState();
    await renderMazeFrame(initialState, stepNumber);
    await sleep(1000); 

    const { steps } = await generateText({
      model: openai("gpt-4o-mini"),
      tools: gameTools,
      maxSteps: 20,
      toolChoice: 'required',
      temperature: 0.1,
      onStepFinish: async ({ toolCalls, toolResults }) => {
        if (toolCalls) {
          stepNumber++;
          const currentState = gameState.getState();
          const previousMoves = telemetry.metrics.path;
          
          const latestEvent = telemetry.getLatestEvent();
          const decisionMetrics = latestEvent?.metrics || {};
          
          await renderMazeFrame(
            currentState,
            stepNumber,
            {
              ...decisionMetrics,
              direction: latestEvent?.data?.direction,
              reasoning: latestEvent?.data?.reasoning
            },
            previousMoves
          );
        }
      },
      system: `Navigate from P to T efficiently, avoiding walls (#).
               Strategy: Scan environment, make optimal moves, minimize steps.
               Key goals: Shortest path, no backtracking unless necessary.
               Evaluate move confidence and alternatives before deciding.`,
      messages: [{
        role: 'user',
        content: 'Start maze navigation.'
      }]
    });
    
    const finalState = gameState.getState();
    await renderMazeFrame(
      finalState,
      stepNumber,
      undefined,
      telemetry.metrics.path
    );
    
    await telemetry.save(sessionId);
    
    console.log(chalk.green('\n=== Navigation Complete ==='));
    console.log('Final Results:', telemetry.getMetricsSummary());

  } catch (error) {
    console.error('Error:', error);
    await telemetry.save(`${sessionId}-error`);
  }
}

if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set');
  process.exit(1);
}

runMazeSolver().catch(console.error);
