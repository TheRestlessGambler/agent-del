import axios from 'axios';


const GEMINI_API_URL = process.env.GEMINI_API_URL!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

interface GeminiResponse {
  choices: { text: string }[];
}

export async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    const response = await axios.post<GeminiResponse>(
      GEMINI_API_URL,
      {
        model: 'gemini-2.0-flash',
        prompt,
        max_tokens: 200,
        temperature: 0.8,
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
