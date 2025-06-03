import { exec } from 'child_process';
import * as vscode from 'vscode';

function execCommand(command: string, cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) reject(stderr || error.message);
      else resolve(stdout.trim());
    });
  });
}

export async function setupReactApp(): Promise<string> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) return 'No workspace folder open to setup React app.';

  const projectPath = folders[0].uri.fsPath;

  try {
    // Create new React app with Vite template
    await execCommand('npm create vite@latest . -- --template react-ts', projectPath);
    // Install dependencies
    await execCommand('npm install', projectPath);
    return 'React app created and dependencies installed successfully.';
  } catch (error: any) {
    return `Failed to setup React app: ${error.message || error}`;
  }
}
