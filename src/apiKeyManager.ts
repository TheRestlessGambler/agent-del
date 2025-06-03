import * as vscode from 'vscode';

const API_KEY_SECRET = 'geminiApiKey';

export async function getAPIKey(context: vscode.ExtensionContext): Promise<string | undefined> {
  // Try to get stored key
  const storedKey = await context.secrets.get(API_KEY_SECRET);
  if (storedKey) {
    return storedKey;
  }

  // Prompt user securely if key not stored
  const inputKey = await vscode.window.showInputBox({
    prompt: 'Enter your Gemini API Key',
    ignoreFocusOut: true,
    password: true, // hides input
  });

  if (inputKey) {
    // Save securely for future use
    await context.secrets.store(API_KEY_SECRET, inputKey);
    vscode.window.showInformationMessage('Gemini API Key saved securely.');
    return inputKey.toString();
  } else {
    vscode.window.showErrorMessage('API Key is required to use the AI Agent.');
    return undefined;
  }
}
