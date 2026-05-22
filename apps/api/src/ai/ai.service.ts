import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';

export const GUWAHATI_AREAS = [
  { name: "Jalukbari", lat: 26.1557, lng: 91.6631 },
  { name: "Maligaon", lat: 26.1578, lng: 91.6917 },
  { name: "Pan Bazar", lat: 26.1856, lng: 91.7472 },
  { name: "Paltan Bazar", lat: 26.1784, lng: 91.7512 },
  { name: "Ganeshguri", lat: 26.1507, lng: 91.7806 },
  { name: "Six Mile", lat: 26.1345, lng: 91.8054 },
  { name: "Beltola", lat: 26.1165, lng: 91.7941 },
  { name: "Dispur", lat: 26.1433, lng: 91.7898 },
  { name: "Noonmati", lat: 26.1895, lng: 91.7995 },
  { name: "Khanapara", lat: 26.1158, lng: 91.8217 },
  { name: "Hatigaon", lat: 26.1311, lng: 91.7856 },
  { name: "Bhangagarh", lat: 26.1542, lng: 91.7634 },
  { name: "Basistha", lat: 26.1045, lng: 91.7878 },
  { name: "Zoo Road", lat: 26.1689, lng: 91.7765 },
  { name: "Sundarbari", lat: 26.1456, lng: 91.6789 },
  { name: "Adabari", lat: 26.1623, lng: 91.6845 },
];

@Injectable()
export class AIService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Calculates Haversine distance in kilometers between two coordinates.
   */
  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private cleanJsonResponse(text: string): string {
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }
    return clean;
  }

  /**
   * Intelligent search with Gemini primary, Groq fallback, and Redis caching.
   */
  async intelligentSearch(query: string) {
    const cacheKey = `ai_search:${query.toLowerCase().trim()}`;
    
    try {
      const cachedResult = await this.redis.get(cacheKey);
      if (cachedResult) {
        console.log('AI Cache Hit:', query);
        return JSON.parse(cachedResult);
      }
    } catch (err) {
      console.warn('Redis read failed:', err.message);
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
      try {
        await this.redis.set(cacheKey, JSON.stringify(result), 3600);
      } catch (err) {
        console.warn('Redis write failed:', err.message);
      }
      return result;
    }

    console.log('All AI models failed, using basic search.');
    const workers = await this.recommendWorkers({ skillName: query });
    return {
      success: true,
      extracted: {
        skill: query,
        location: null,
        matchedArea: null,
      },
      workers,
    };
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
    return `You are an AI assistant parsing service search requests for HireMe, a marketplace for local skilled labor.
Analyze the user's search query: "${query}"

Extract:
1. "skill": The specific service or profession requested (e.g. "Plumber", "Electrician", "Carpenter", "Mason", "Cleaning").
2. "location": The neighborhood or area name (e.g. "Hatigaon", "Jalukbari", "Beltola", "Zoo Road", etc.).

Return ONLY a valid JSON object. Do not include markdown code block formatting.
Example Output:
{"skill": "Plumber", "location": "Hatigaon"}`;
  }

  private async processAIResponse(text: string, originalQuery: string) {
    try {
      const cleanJson = this.cleanJsonResponse(text);
      const extracted = JSON.parse(cleanJson);
      
      const skillName = extracted.skill;
      const locationName = extracted.location;
      
      let lat: number | undefined = undefined;
      let lng: number | undefined = undefined;
      
      if (locationName) {
        const area = GUWAHATI_AREAS.find(a => 
          a.name.toLowerCase().includes(locationName.toLowerCase()) || 
          locationName.toLowerCase().includes(a.name.toLowerCase())
        );
        if (area) {
          lat = area.lat;
          lng = area.lng;
        }
      }
      
      const workers = await this.recommendWorkers({
        skillName,
        lat,
        lng,
        limit: 10
      });

      return {
        success: true,
        extracted: {
          skill: skillName || null,
          location: locationName || null,
          matchedArea: locationName && lat ? { name: locationName, lat, lng } : null
        },
        workers
      };
    } catch (err) {
      console.error('Error processing AI response:', err);
      const workers = await this.recommendWorkers({ skillName: originalQuery });
      return {
        success: true,
        extracted: {
          skill: originalQuery,
          location: null,
          matchedArea: null
        },
        workers
      };
    }
  }

  /**
   * Refined Recommendation Engine using AI weights:
   * - Distance (50%): Preference for nearest workers.
   * - Rating (30%): Preference for high-rated workers.
   * - Verification (20%): Priority for verified workers.
   */
  async recommendWorkers(params: {
    skillId?: string;
    skillName?: string;
    lat?: number;
    lng?: number;
    maxDistanceKm?: number;
    limit?: number;
  }) {
    const { skillId, skillName, lat, lng, maxDistanceKm = 15, limit = 10 } = params;

    // Fetch all available workers
    const workers = await this.db.client.worker.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            gender: true,
            isActive: true,
          }
        },
        skills: {
          include: {
            skill: true,
          }
        },
        reviews: {
          where: { isFlagged: false },
          select: { rating: true }
        }
      }
    });

    let filtered = workers;
    
    // Filter by skillId or skillName
    if (skillId) {
      filtered = filtered.filter(w => w.skills.some(s => s.skillId === skillId));
    } else if (skillName) {
      filtered = filtered.filter(w =>
        w.skills.some(s => s.skill.name.toLowerCase().includes(skillName.toLowerCase()))
      );
    }

    const scoredWorkers = filtered.map(w => {
      // 1. Calculate Average Rating
      const avgRating = w.reviews.length > 0 
        ? w.reviews.reduce((acc, r) => acc + r.rating, 0) / w.reviews.length 
        : 4.5; // fallback rating

      // 2. Calculate Distance
      let distance = 0;
      let distanceScore = 1.0; // default if coords not provided
      if (lat !== undefined && lng !== undefined && w.currentLat && w.currentLng) {
        distance = this.getDistance(lat, lng, w.currentLat, w.currentLng);
        distanceScore = Math.max(0, 1 - distance / maxDistanceKm);
      }

      // 3. Rating Score (30%)
      const ratingScore = avgRating / 5.0;

      // 4. Verification Score (20%)
      const verificationScore = w.isVerified ? 1.0 : 0.0;

      // 5. Total Weighted Score
      const totalScore = (distanceScore * 0.5) + (ratingScore * 0.3) + (verificationScore * 0.2);

      return {
        ...w,
        rating: avgRating,
        reviewCount: w.reviews.length,
        distance,
        aiScore: totalScore,
      };
    });

    // If coordinates were provided, filter out workers beyond maxDistanceKm
    let finalWorkers = scoredWorkers;
    if (lat !== undefined && lng !== undefined && maxDistanceKm) {
      finalWorkers = finalWorkers.filter(w => w.distance <= maxDistanceKm);
    }

    // Sort by AI Score descending
    finalWorkers.sort((a, b) => b.aiScore - a.aiScore);

    return finalWorkers.slice(0, limit);
  }
}
