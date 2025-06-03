import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { callGeminiAPI } from '../ai/geminiCall';

export async function generateCode() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('Open your project folder first.');
        return;
    }
    const projectPath = workspaceFolders[0].uri.fsPath;
    const componentsDir = path.join(projectPath, 'src', 'components');
    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    const prompt = `Generate a React functional component named Todo in TypeScript. 
It should allow users to add tasks, toggle completion, and delete tasks. 
Use hooks for state management. Provide complete code including imports.`;

    try {
        vscode.window.showInformationMessage('Requesting AI to generate ToDo component...');
        const code = await callGeminiAPI(prompt);

        const todoFilePath = path.join(componentsDir, 'Todo.tsx');
        fs.writeFileSync(todoFilePath, code);
        vscode.window.showInformationMessage('AI-generated ToDo component created at src/components/Todo.tsx');
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to generate code: ${error.message || error}`);
    }
}
