import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import {
  aiResumeAnalysisSchema,
  aiJobMatchSchema,
  aiScreeningSchema,
  type AIResumeAnalysisOutput,
  type AIJobMatchOutput,
  type AICandidateScreeningOutput,
} from './types';
import {
  buildResumeAnalysisPrompt,
  buildJobMatchPrompt,
  buildCandidateScreeningPrompt,
} from './prompts';

export interface AIProviderInterface {
  name: string;
  isConfigured(): boolean;
  analyzeResume(rawText: string): Promise<AIResumeAnalysisOutput>;
  matchJob(
    resumeText: string,
    job: {
      title: string;
      description: string;
      requiredSkills: string[];
      niceToHaveSkills?: string[];
      minExperienceYears?: number;
    },
  ): Promise<AIJobMatchOutput>;
  screenCandidate(
    resumeText: string,
    job: {
      title: string;
      description: string;
      requiredSkills: string[];
      minExperienceYears?: number;
    },
    context?: { coverLetter?: string },
  ): Promise<AICandidateScreeningOutput>;
}

function parseJsonFromLlmOutput(raw: string): any {
  let cleaned = raw.trim();
  // Strip markdown code fences if model returned ```json ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    throw new ApiError(502, `AI provider returned unparseable JSON: ${err?.message}`);
  }
}

class GeminiProvider implements AIProviderInterface {
  name = 'Google Gemini';

  isConfigured(): boolean {
    return !!env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0;
  }

  private async callLlm(prompt: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new ApiError(
        503,
        'AI service is not configured. Please set GEMINI_API_KEY or OPENAI_API_KEY in the server environment.',
      );
    }

    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new ApiError(429, 'AI provider rate limit reached. Please try again later.');
        }
        const errText = await response.text();
        throw new ApiError(502, `AI provider error (${response.status}): ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new ApiError(502, 'AI provider returned an empty response');
      }
      return text;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new ApiError(504, 'AI provider request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async analyzeResume(rawText: string): Promise<AIResumeAnalysisOutput> {
    const prompt = buildResumeAnalysisPrompt(rawText);
    const rawOutput = await this.callLlm(prompt);
    const parsed = parseJsonFromLlmOutput(rawOutput);
    return aiResumeAnalysisSchema.parse(parsed);
  }

  async matchJob(
    resumeText: string,
    job: {
      title: string;
      description: string;
      requiredSkills: string[];
      niceToHaveSkills?: string[];
      minExperienceYears?: number;
    },
  ): Promise<AIJobMatchOutput> {
    const prompt = buildJobMatchPrompt(resumeText, job);
    const rawOutput = await this.callLlm(prompt);
    const parsed = parseJsonFromLlmOutput(rawOutput);
    return aiJobMatchSchema.parse(parsed);
  }

  async screenCandidate(
    resumeText: string,
    job: {
      title: string;
      description: string;
      requiredSkills: string[];
      minExperienceYears?: number;
    },
    context?: { coverLetter?: string },
  ): Promise<AICandidateScreeningOutput> {
    const prompt = buildCandidateScreeningPrompt(resumeText, job, context);
    const rawOutput = await this.callLlm(prompt);
    const parsed = parseJsonFromLlmOutput(rawOutput);
    return aiScreeningSchema.parse(parsed);
  }
}

// Active provider instance (can be swapped in unit tests via setAIProvider)
let currentProvider: AIProviderInterface = new GeminiProvider();

export function getAIProvider(): AIProviderInterface {
  return currentProvider;
}

export function setAIProvider(provider: AIProviderInterface) {
  currentProvider = provider;
}
