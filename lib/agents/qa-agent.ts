import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

interface SaveMessageCallback {
  (content: string): Promise<void>;
}

export class QAAgent {
  public async answer(question: string, context: string, onComplete?: SaveMessageCallback) {
    const stream = await streamText({
      model: google('models/gemini-1.5-flash'),
      system: `You are a helpful AI assistant.
      Your task is to answer the user\'s question based ONLY on the provided context.
      If the answer is not found in the context, respond with \"I\'m sorry, but I cannot answer this question based on the provided information.\"

      Context:
      ---
      ${context}
      ---
      `,
      prompt: question,
      onFinish: async (result) => {
        if (onComplete && result.text) {
          try {
            await onComplete(result.text);
          } catch (error) {
            console.error('Failed to save AI completion:', error);
          }
        }
      }
    });
    return stream;
  }
}
