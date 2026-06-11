import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.startsWith('sk-your-openai-api-key')) return null;
  if (!client) {
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const openai = getOpenAI();
  if (!openai) {
    return `[Demo Mode] ${systemPrompt.slice(0, 80)}... Response to: "${userMessage.slice(0, 100)}"`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1500,
    });

    return response.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    console.error('OpenAI Error:', error);
    return `[Demo Mode Fallback] ${systemPrompt.slice(0, 80)}... Response to: "${userMessage.slice(0, 100)}"`;
  }
}
