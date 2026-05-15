import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AIService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Intelligent search with Gemini primary, Groq fallback, and Redis caching.
   */
  async intelligentSearch(query: string) {
    const cacheKey = `ai_search:${query.toLowerCase().trim()}`;
    
    const cachedResult = await this.redis.get(cacheKey);
    if (cachedResult) {
      console.log('AI Cache Hit:', query);
      return cachedResult;
    }

    let result = null;
    try {
      result = await this.callGemini(query);
    } catch (err) {
      console.warn('Gemini AI failed, falling back to Groq...', err.message);
      try {
        result = await this.callGroq(query);
      } catch (err2) {
        console.error('Groq AI also failed:', err2.message);
      }
    }

    if (result) {
      await this.redis.set(cacheKey, result, 3600);
      return result;
    }

    console.log('All AI models failed, using basic search.');
    return this.recommendWorkers({ skillName: query });
  }

  private async callGemini(query: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (!apiKey) return null;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const prompt = this.getSystemPrompt(query);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) throw new Error(`Gemini status ${response.status}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return this.processAIResponse(text, query);
  }

  private async callGroq(query: string) {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    if (!apiKey) return null;

    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const prompt = this.getSystemPrompt(query);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(`Groq status ${response.status}`);

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return this.processAIResponse(text, query);
  }

  private getSystemPrompt(query: string) {
    return `Extract search intent from: "${query}". Return ONLY JSON: {"skill": "Job", "location": "City"}`;
  }

  private async processAIResponse(text: string, originalQuery: string) {
    try {
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const extracted = JSON.parse(jsonStr);
      return this.recommendWorkers({ skillName: extracted.skill });
    } catch (err) {
      return this.recommendWorkers({ skillName: originalQuery });
    }
  }

  async recommendWorkers(params: any) {
    const { skillName, limit = 5 } = params;
    return this.db.client.worker.findMany({
      where: {
        isAvailable: true,
        skills: skillName ? { some: { skill: { name: { contains: skillName, mode: 'insensitive' } } } } : undefined,
      },
      include: {
        user: { select: { name: true } },
        skills: { include: { skill: true } },
      },
      take: limit,
    });
  }
}
