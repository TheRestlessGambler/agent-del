import { exec } from 'child_process';
import * as vscode from 'vscode';

function execCommand(command: string, options = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) reject(stderr || error.message);
      else resolve(stdout.trim());
    });
  });
}

export async function setupReactApp() {
  const folderName = 'my-todo-app';

  try {
    vscode.window.showInformationMessage('Creating React app with Vite...');
    await execCommand(`npm create vite@latest ${folderName} -- --template react`);

    vscode.window.showInformationMessage('Installing dependencies...');
    await execCommand('npm install', { cwd: folderName });

    vscode.window.showInformationMessage('React app setup complete!');
  } catch (error) {
    vscode.window.showErrorMessage(`Setup failed: ${error}`);
  }
}
