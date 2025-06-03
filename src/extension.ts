import * as vscode from 'vscode';
import * as dotenv from 'dotenv';

import { checkTools } from './commands/checkTools';
import { runAIAgent } from './agent';
import { setupReactApp } from './commands/setupReactApp';
import { scaffoldTodo } from './commands/scaffoldTodo';
import { generateCode } from './commands/generateCode';
import { executeCommand } from './commands/executeCommand';
import { ChatPanel } from './chatPanel';
import { getAPIKey } from './apiKeyManager';

// Load .env variables at startup
dotenv.config();

export async function activate(context: vscode.ExtensionContext) {
  try {
    await getAPIKey(context);
  } catch (error) {
    vscode.window.showErrorMessage('API Key is required to use the AI Agent.');
    return;
  }
  console.log('AI Agent Extension activated');

  context.subscriptions.push(
    vscode.commands.registerCommand('aiAgent.checkTools', checkTools),
    vscode.commands.registerCommand('aiAgent.runAgent', () => runAIAgent(context)),
    vscode.commands.registerCommand('aiAgent.setupReactApp', setupReactApp),
    vscode.commands.registerCommand('aiAgent.scaffoldTodo', scaffoldTodo),
    vscode.commands.registerCommand('aiAgent.generateCode', generateCode),
    vscode.commands.registerCommand('aiAgent.executeCommand', executeCommand),
    vscode.commands.registerCommand('aiAgent.openChat', () => {
      ChatPanel.createOrShow(context.extensionUri, context);  // Pass context here
    })
  );
}

export function deactivate() {
  console.log('AI Agent Extension deactivated');
}
