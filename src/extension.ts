import * as vscode from 'vscode';
import { ChatPanel } from './chatPanel';
import { getAPIKey } from './apiKeyManager';

export async function activate(context: vscode.ExtensionContext) {
  try {
    // Prompt user for Gemini API key securely if not saved
    await getAPIKey(context);
  } catch {
    vscode.window.showErrorMessage('API Key is required to use the AI Agent.');
    return;
  }

  console.log('AI Agent Extension activated');

  // Register single command to open chat panel sidebar
  context.subscriptions.push(
    vscode.commands.registerCommand('aiAgent.openChat', () => {
      ChatPanel.createOrShow(context.extensionUri, context);
    }),
    vscode.commands.registerCommand('aiAgent.clearApiKey', async () => {
      await context.secrets.delete('geminiApiKey');
      vscode.window.showInformationMessage('Gemini API key cleared.');
    })
  );
}

export function deactivate() {
  console.log('AI Agent Extension deactivated');
}
