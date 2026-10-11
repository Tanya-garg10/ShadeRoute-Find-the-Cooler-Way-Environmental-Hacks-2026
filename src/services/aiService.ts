/**
 * Featherless AI Service
 * OpenAI-compatible API — https://featherless.ai
 * Model: meta-llama/Llama-3.3-70B-Instruct (free tier available)
 */

export interface AIAdviceRequest {
  type: 'route' | 'timeshift' | 'community';
  context: Record<string, unknown>;
}

export interface AIAdviceResponse {
  advice: string;
  model: string;
  error?: string;
}

export async function getAIAdvice(req: AIAdviceRequest): Promise<AIAdviceResponse> {
  try {
    const res = await fetch('/api/ai/advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { advice: '', model: '', error: err.error || 'AI service unavailable' };
    }

    return await res.json();
  } catch {
    return { advice: '', model: '', error: 'Could not reach AI service' };
  }
}
