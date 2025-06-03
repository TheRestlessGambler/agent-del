import * as vscode from 'vscode';
import { callGeminiAPI } from './ai/geminiCall';
import { executeCommand } from './commands/executeCommand';

export async function runAIAgent() {
  const userInput = await vscode.window.showInputBox({ prompt: 'Ask the AI agent:' });
  if (!userInput) {
    vscode.window.showInformationMessage('No input provided.');
    return;
  }

  try {
    // Ask Gemini for next step/instruction
    const aiResponse = await callGeminiAPI(userInput);

    vscode.window.showInformationMessage(`AI says: ${aiResponse}`);

    // Basic pattern: if AI replies with a command to run, extract and execute
    // (In real usage, better to have structured response or special tags)

    const commandMatch = aiResponse.match(/RUN_CMD:(.+)/i);
    if (commandMatch) {
      const cmdToRun = commandMatch[1].trim();
      await executeCommand(cmdToRun);
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(err.message || 'Unknown error');
  }
}
