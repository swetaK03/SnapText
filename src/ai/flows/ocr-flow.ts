'use server';
/**
 * @fileOverview Forensic-level OCR flow for Marathi handwriting and stylized script.
 * 
 * - performAIOCR - Extracts text with absolute character fidelity, optimized for handwriting.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OCRInputSchema = z.object({
  imageDataUri: z.string().describe("The image to process as a base64 data URI."),
});

const OCROutputSchema = z.object({
  extractedText: z.string().describe("The full text extracted from the image."),
});

export async function performAIOCR(input: { imageDataUri: string }) {
  return ocrFlow(input);
}

const ocrFlow = ai.defineFlow(
  {
    name: 'ocrFlow',
    inputSchema: OCRInputSchema,
    outputSchema: OCROutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: [
        { media: { url: input.imageDataUri } },
        { text: `You are a forensic transcription expert specializing in Devanagari and Marathi handwriting. Your task is to perform a literal, stroke-by-stroke transcription of the ink in the image.

CRITICAL PROTOCOLS:
1. ZERO AUTO-CORRECTION: Do NOT use your language model to guess words. If the writer wrote a word incorrectly (e.g., used 'ि' instead of 'ी'), you MUST transcribe the 'ि'. Do not fix grammar or spelling.
2. VOWEL SIGN (MATRA) FIDELITY: Every Matra must be checked against the visual stroke:
   - Carefully distinguish between 'ि' (hrasva/short) and 'ी' (dirgha/long). Look for the direction of the curve.
   - Carefully distinguish between 'ु' (hrasva) and 'ू' (dirgha) u-matras.
   - Identify 'े', 'ै', 'ो', 'ौ' and transcribe them exactly as written.
3. STROKE RECOGNITION: Treat every character as a set of lines and dots. If a dot (Anusvar) is present, include it. If a conjunct (Jodakshe) like 'ज्ञ' or 'क्र' is used, transcribe that specific conjunct.
4. LINE INDEPENDENCE: Ignore the horizontal lines of the paper. Focus only on the ink that forms letters.
5. 1:1 REPLICATION: Your output must be a character-perfect mirror of the visual ink. If the handwriting is 'शाळेचे' but used a short 'ि' by mistake, show that exact stroke.

Output ONLY the literal Marathi transcription, maintaining the original line-by-line structure.` },
      ],
    });

    return { extractedText: text || '' };
  }
);
