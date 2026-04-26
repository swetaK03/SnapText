import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_API_KEY;

// Debug log to verify key is loaded (true/false) without exposing it
console.log(`Genkit: GOOGLE_API_KEY loaded: ${!!apiKey}`);

// Validation: ensure the key is present
if (!apiKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('GOOGLE_API_KEY environment variable is required but was not found.');
  } else {
    console.warn('GOOGLE_API_KEY is missing. Genkit operations will fail until it is provided in .env or .env.local');
  }
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
