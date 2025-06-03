import * as vscode from 'vscode';
import * as dotenv from 'dotenv';

import { checkTools } from './commands/checkTools';
import { runAIAgent } from './agent';
import { setupReactApp } from './commands/setupReactApp';
import { scaffoldTodo } from './commands/scaffoldTodo';
import { generateCode } from './commands/generateCode';
import { executeCommand } from './commands/executeCommand';
import { ChatPanel } from './chatPanel';

// Load .env variables at startup
dotenv.config();

export function activate(context: vscode.ExtensionContext) {
  console.log('AI Agent Extension activated');

  context.subscriptions.push(
    vscode.commands.registerCommand('aiAgent.checkTools', checkTools),
    vscode.commands.registerCommand('aiAgent.runAgent', runAIAgent),
    vscode.commands.registerCommand('aiAgent.setupReactApp', setupReactApp),
    vscode.commands.registerCommand('aiAgent.scaffoldTodo', scaffoldTodo),
    vscode.commands.registerCommand('aiAgent.generateCode', generateCode),
    vscode.commands.registerCommand('aiAgent.executeCommand', executeCommand),
    vscode.commands.registerCommand('aiAgent.openChat', () => {
      ChatPanel.createOrShow(context.extensionUri);
    })
  );
}

export function deactivate() {
  console.log('AI Agent Extension deactivated');
}
