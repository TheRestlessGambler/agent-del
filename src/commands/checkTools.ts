import { exec } from 'child_process';
import * as vscode from 'vscode';

function execCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(stderr || error.message);
      else resolve(stdout.trim());
    });
  });
}

export async function checkTools() {
  const tools = ['node -v', 'npm -v', 'vite --version'];
  const missing: string[] = [];

  for (const cmd of tools) {
    try {
      const version = await execCommand(cmd);
      vscode.window.showInformationMessage(`${cmd.split(' ')[0]} found: ${version}`);
    } catch {
      missing.push(cmd.split(' ')[0]);
    }
  }

  if (missing.length) {
    vscode.window.showWarningMessage(`Missing: ${missing.join(', ')}.`);

    if (missing.includes('vite')) {
      const install = await vscode.window.showInformationMessage(
        'Vite is missing. Would you like to install it globally now?',
        'Yes',
        'No'
      );

      if (install === 'Yes') {
        try {
          vscode.window.showInformationMessage('Installing Vite globally...');
          await execCommand('npm install -g vite');
          vscode.window.showInformationMessage('Vite installed successfully.');
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to install Vite: ${error}`);
        }
      }
    }
  } else {
    vscode.window.showInformationMessage('All tools installed.');
  }
}
