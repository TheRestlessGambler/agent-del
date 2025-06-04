import { exec } from 'child_process';
import * as vscode from 'vscode';

/**
 * Executes a shell command in a given working directory and returns the output.
 * @param command The shell command to run.
 * @param cwd The working directory where the command will be executed (optional).
 * @returns The command output as a string.
 */
export function execCommand(command: string, cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        // Log the error if you want to track the command failures
        console.error(`Error executing command: ${command}`, stderr || error.message);
        reject(stderr || error.message);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}
