import { execCommand } from '../utils/execCommand.ts';
import * as vscode from 'vscode';

export async function setupReactApp(): Promise<string> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) return 'No workspace folder open to setup React app.';

  const projectPath = folders[0].uri.fsPath;
  
  try {
    // Run the Vite setup command
    await execCommand('npm create vite@latest my-app -- --template react-ts', projectPath);
    await execCommand('npm install', projectPath);
    return 'React app created and dependencies installed successfully.';
  } catch (error: any) {
    return `Failed to setup React app: ${error.message || error}`;
  }
}
