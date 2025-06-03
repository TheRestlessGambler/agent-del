import * as vscode from 'vscode';
import { callGeminiAPI } from './ai/geminiCall';
import { executeCommand } from './commands/executeCommand';
import { getAPIKey } from './apiKeyManager';

export async function runAIAgent(context: vscode.ExtensionContext) {
  const userInput = await vscode.window.showInputBox({ prompt: 'Ask the AI agent:' });
  if (!userInput) {
    vscode.window.showInformationMessage('No input provided.');
    return;
  }

  try {
    // Ensure API key is available
    const apiKey = await getAPIKey(context);
    if (!apiKey) {
      vscode.window.showErrorMessage('Cannot proceed without API key.');
      return;
    }

    // Pass context or API key if needed to callGeminiAPI
    const aiResponse = await callGeminiAPI(userInput, context);

    vscode.window.showInformationMessage(`AI says: ${aiResponse}`);

    // Detect special AI instructions to run shell commands
    const commandMatch = aiResponse.match(/RUN_CMD:(.+)/i);
    if (commandMatch) {
      const cmdToRun = commandMatch[1].trim();
      await executeCommand(cmdToRun);
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(err.message || 'Unknown error');
  }
}
