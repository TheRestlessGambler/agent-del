import { exec } from 'child_process';
import * as vscode from 'vscode';

export async function executeCommand(command: string) {
  if (!command) {
    vscode.window.showErrorMessage('No command provided to execute.');
    return;
  }

  vscode.window.showInformationMessage(`Executing command: ${command}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      vscode.window.showWarningMessage(`Warning: ${stderr}`);
    }
    vscode.window.showInformationMessage(`Output:\n${stdout}`);
  });
}
