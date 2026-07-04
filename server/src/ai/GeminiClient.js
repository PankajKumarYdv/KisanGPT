import { GoogleGenAI } from '@google/genai';
import { logger } from '../config/logger.js';

let aiInstance = null;

export class GeminiClient {
  /**
   * Retrieves or initializes the GoogleGenAI SDK client.
   */
  static getClient() {
    if (!aiInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        logger.warn('[GeminiClient] GEMINI_API_KEY environment variable is not defined.');
      }
      aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
  }

  /**
   * Retrieves the configured model name from environment or defaults to gemini-2.5-flash.
   */
  static getModel() {
    return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  /**
   * Generates content with schema enforcement.
   * Handles timeouts, rate limits, and network retries.
   */
  static async generateContent(prompt, systemInstruction, schema, timeoutMs = 8000, maxRetries = 2) {
    const client = this.getClient();
    const modelName = this.getModel();
    let attempt = 0;
    let delay = 500;

    while (attempt <= maxRetries) {
      try {
        const generatePromise = client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature: 0.1,
          }
        });

        // Race with timeout
        const response = await Promise.race([
          generatePromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout: Gemini execution exceeded limit')), timeoutMs)
          )
        ]);

        if (!response || !response.text) {
          throw new Error('Gemini returned an empty response');
        }

        const rawText = response.text.trim();
        const parsedJson = JSON.parse(rawText);

        logger.info(`[GeminiClient] Successfully generated structured output using model: ${modelName}. Prompt Length: ${prompt.length}.`);

        return {
          data: parsedJson,
          model: modelName,
          promptLength: prompt.length,
          success: true
        };
      } catch (error) {
        attempt++;
        const errStr = error.message || String(error);
        const isRateLimit = errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('rate limit');
        
        logger.warn(`[GeminiClient] Attempt ${attempt}/${maxRetries + 1} failed. Error: ${errStr}`);
        
        if (attempt <= maxRetries) {
          const sleepTime = isRateLimit ? delay * 2.5 : delay;
          await new Promise(resolve => setTimeout(resolve, sleepTime));
          delay *= 2;
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Generates content and validates it using a validation function.
   * If validation fails, performs a single corrective retry.
   */
  static async generateWithCorrection(prompt, systemInstruction, schema, validateFn, timeoutMs = 8000) {
    let result = await this.generateContent(prompt, systemInstruction, schema, timeoutMs);

    try {
      validateFn(result.data);
      return result;
    } catch (err) {
      logger.warn(`[GeminiClient] JSON validation failed: ${err.message}. Triggering corrective instruction retry.`);
      
      const correctivePrompt = 
        `${prompt}\n\n` +
        `WARNING: Your previous JSON output was invalid and failed schema validation.\n` +
        `Validation Error: ${err.message}\n` +
        `Please correct the response and return valid JSON adhering strictly to the schema rules.`;

      // Single retry with corrective prompt
      result = await this.generateContent(correctivePrompt, systemInstruction, schema, timeoutMs, 1);
      validateFn(result.data);
      return result;
    }
  }
}
export default GeminiClient;
