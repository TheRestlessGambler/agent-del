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

export async function executeCommand(command: string): Promise<string> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) return 'No workspace folder open to run commands.';

  const projectPath = folders[0].uri.fsPath;

  try {
    const output = await execCommand(command, projectPath);
    return `Command output:\n${output}`;
  } catch (error: any) {
    return `Failed to execute command: ${error.message || error}`;
  }
}
