import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { callGeminiAPI } from '../ai/geminiCall';

export async function generateCode(context: vscode.ExtensionContext): Promise<string> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return 'Open your project folder first.';

  const projectPath = workspaceFolders[0].uri.fsPath;
  const componentsDir = path.join(projectPath, 'src', 'components');

  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  const prompt = `Generate a React functional component named Todo in TypeScript.
It should allow users to add tasks, toggle completion, and delete tasks.
Use hooks for state management. Provide complete code including imports.`;

  try {
    const code = await callGeminiAPI(prompt, context);
    const todoFilePath = path.join(componentsDir, 'Todo.tsx');
    fs.writeFileSync(todoFilePath, code);
    return 'AI-generated ToDo component created at src/components/Todo.tsx';
  } catch (error: any) {
    return `Failed to generate ToDo component: ${error.message || error}`;
  }
}
