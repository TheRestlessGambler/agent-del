import * as vscode from 'vscode';

const API_KEY_SECRET = 'geminiApiKey';

export async function getAPIKey(context: vscode.ExtensionContext): Promise<string | undefined> {
  const storedKey = await context.secrets.get(API_KEY_SECRET);
  if (storedKey) {
    return storedKey;
  }

  
  const inputKey = await vscode.window.showInputBox({
    prompt: 'Enter your Gemini API Key',
    ignoreFocusOut: true,
    password: true, 
  });

  if (inputKey) {
    await context.secrets.store(API_KEY_SECRET, inputKey);
    vscode.window.showInformationMessage('Gemini API Key saved securely.');
    return inputKey;
  } else {
    vscode.window.showErrorMessage('API Key is required to use the AI Agent.');
    return undefined;
  }
}
