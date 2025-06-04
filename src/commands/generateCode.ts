import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { callGeminiAPI } from '../ai/geminiCall';

export async function generateCode(context: vscode.ExtensionContext, projectPath: string): Promise<string> {
  const componentsDir = path.join(projectPath, 'src', 'components');

  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  // Your prompt for generating the ToDo component
  const prompt = `Generate a React functional component named Todo in TypeScript.
It should allow users to add tasks, toggle completion, and delete tasks.
Use hooks for state management. Provide complete code including imports.`;

  try {
    // Call Gemini API with the prompt and context
    const code = await callGeminiAPI(prompt, context);
    
    // Define file path for the generated component
    const todoFilePath = path.join(componentsDir, 'Todo.tsx');
    
    // Write the generated code to the file
    fs.writeFileSync(todoFilePath, code);
    
    return `AI-generated ToDo component created at src/components/Todo.tsx`;
  } catch (error: any) {
    return `Failed to generate ToDo component: ${error.message || error}`;
  }
}
