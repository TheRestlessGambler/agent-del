import axios from 'axios';
import { getAPIKey } from '../apiKeyManager';
import * as vscode from 'vscode';



export async function callGeminiAPI(prompt: string, context: vscode.ExtensionContext): Promise<string> {
  const GEMINI_API_KEY = await getAPIKey(context);
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API Key not available.');
  }

  try {

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await axios.post(
      GEMINI_API_URL,
      {
        model: 'gemini-2.0-flash',
        prompt,
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

    return response.data.choices?.[0]?.text || 'No response from AI';
  } catch (err: any) {
    throw new Error(`Gemini API call failed: ${err.message || err}`);
  }
}
