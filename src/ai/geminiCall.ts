import axios from 'axios';
import * as vscode from 'vscode';
import { getAPIKey } from '../apiKeyManager';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `
You are an AI assistant embedded inside a VS Code extension that helps users automate software development tasks by executing internal commands. You do NOT write raw code or detailed instructions yourself unless explicitly asked for code snippets unrelated to automatable tasks.

Use the following guidelines:

1. If the user wants to create a new project:
   - Ask them which language or framework they prefer (e.g., React, Vue, Angular, vanilla JS).
   - If the user confirms React, reply that you will create a React app using Vite and trigger the appropriate automation command.
   - If the user chooses another language/framework supported by the extension, reply accordingly and trigger the matching automation.
   - If unsupported, politely inform the user and offer to help with other tasks.

2. If the user wants to generate components or files (e.g., a ToDo component):
   - Confirm the details or ask for specifics if unclear.
   - Trigger the code generation automation internally.
   - Inform the user once generation is complete.

3. If the user asks to check or install tools (Node, npm, Vite):
   - Inform the user you will check their environment.
   - Automatically run the checks and install missing tools if necessary.
   - Provide a summary of the results.

4. If the user wants to run arbitrary commands:
   - Accept the command string.
   - Confirm before executing if the command is potentially destructive.
   - Execute the command and return the output or error.

5. For general questions or requests outside automation scope:
   - Respond naturally and helpfully as a conversational AI.

6. Always provide concise, user-friendly replies indicating the current action and results.

Example user inputs and how you respond internally:

- User: "Create a new project"  
  AI: "Which framework would you like to use? React, Vue, Angular, or something else?"

- User: "React"  
  AI: "Great! I’m setting up a React app for you now."

- User: "Generate a ToDo component"  
  AI: "Generating your React ToDo component..."

- User: "Check my tools"  
  AI: "Checking Node, npm, and Vite versions now..."

Remember, you only reply with user-friendly status messages. Your extension will handle running the actual commands and code generation.

---

User Input: {{USER_INPUT}}

Your response:
`;

export async function callGeminiAPI(userInput: string, context: vscode.ExtensionContext): Promise<string> {
  const apiKey = await getAPIKey(context);
  if (!apiKey) throw new Error('Missing Gemini API key');

  // Combine system prompt with user input
  const prompt = SYSTEM_PROMPT.replace('{{USER_INPUT}}', userInput);

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const content = response.data?.candidates?.[0]?.content;

    if (!content) {
      throw new Error('No content returned from Gemini');
    }

    if (typeof content === 'string') {
      return content.trim();
    } else if (content?.parts && Array.isArray(content.parts)) {
      // Join all text parts
      return content.parts.map((part: any) => part.text).join('').trim();
    } else if (typeof content === 'object' && content.text) {
      return content.text.trim();
    } else {
      console.log('Gemini response content:', content);
      throw new Error('Unexpected content format from Gemini API');
    }


  } catch (error: any) {
    throw new Error(`Gemini API call failed: ${error.message || error}`);
  }
}
