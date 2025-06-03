import axios from 'axios';
import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_URL = process.env.GEMINI_API_URL!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export async function runAIAgent() {
  const userInput = await vscode.window.showInputBox({ prompt: 'Ask the AI agent:' });
  if (!userInput) {
    vscode.window.showInformationMessage('No input provided.');
    return;
  }

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        model: 'gemini-2.0-flash',
        prompt: userInput,
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GEMINI_API_KEY}`,
        },
      }
    );

    const aiReply = response.data.choices?.[0]?.text || 'No response from AI';
    vscode.window.showInformationMessage(`AI: ${aiReply}`);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Error calling Gemini API: ${err.message || err}`);
  }
}
