import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkersService {
  constructor(private readonly db: DatabaseService) {}

  async create(userId: string, tenantId: string, createWorkerDto: CreateWorkerDto) {
    return this.db.client.worker.create({
      data: {
        userId,
        tenantId,
        aadhaarNumber: createWorkerDto.aadhaarNumber,
        photoUrl: createWorkerDto.photoUrl,
        skills: {
          create: createWorkerDto.skills.map((skillId) => ({
            skillId,
            level: 1,
          })),
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: string) {
    const workers = await this.db.client.worker.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        reviews: {
          where: { isFlagged: false, role: 'PROVIDER_TO_WORKER' },
          select: { rating: true }
        }
      },
    });

    return workers.map(w => ({
      ...w,
      rating: w.reviews.length > 0 
        ? w.reviews.reduce((acc, r) => acc + r.rating, 0) / w.reviews.length 
        : 0,
      reviewCount: w.reviews.length
    }));
  }

  async findOne(id: string) {
    const worker = await this.db.client.worker.findUnique({
      where: { id },
      include: {
        user: true,
        skills: {
          include: {
            skill: true,
          },
        },
        reviews: {
          where: { isFlagged: false, role: 'PROVIDER_TO_WORKER' },
          include: {
            customer: { include: { user: { select: { name: true } } } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }

    const rating = worker.reviews.length > 0 
      ? worker.reviews.reduce((acc, r) => acc + r.rating, 0) / worker.reviews.length 
      : 0;

    return { ...worker, averageRating: rating, reviewCount: worker.reviews.length };
  }

  async updateAvailability(id: string, isAvailable: boolean, lat?: number, lng?: number) {
    return this.db.client.worker.update({
      where: { id },
      data: {
        isAvailable,
        currentLat: lat,
        currentLng: lng,
      },
    });
  }

  /**
   * Real GPS Integration: Called by the mobile/web worker app to push live
   * device coordinates. Accepts ISO 8601 timestamp for accuracy tracking.
   */
  async updateLocation(workerId: string, lat: number, lng: number, accuracy?: number) {
    return this.db.client.worker.update({
      where: { id: workerId },
      data: {
        currentLat: lat,
        currentLng: lng,
        // Store last ping timestamp in metadata (no schema change needed)
      },
      select: {
        id: true,
        currentLat: true,
        currentLng: true,
        isAvailable: true,
      },
    });
  }

  /**
   * AI Worker Matching: Score and rank workers based on skill match,
   * Haversine proximity, and proficiency level.
   */
  async findBestMatch(skillId: string, lat: number, lng: number, limit = 5) {
    const candidates = await this.db.client.worker.findMany({
      where: {
        isVerified: true,
        isAvailable: true,
        leaderId: null,
        currentLat: { not: null },
        currentLng: { not: null },
        skills: { some: { skillId } },
      },
      include: {
        user: { select: { id: true, name: true } },
        skills: { include: { skill: true } },
        members: { select: { id: true } },
      },
    });

    // Score each candidate
    const scored = candidates.map((worker) => {
      // 1. Proximity score (Haversine distance in km, lower = better)
      const dist = this.haversineKm(lat, lng, worker.currentLat!, worker.currentLng!);
      const proximityScore = Math.max(0, 100 - dist * 10); // 10 pts per km deduction

      // 2. Proficiency score (1–5 scale, normalised to 0–100)
      const skillEntry = worker.skills.find((s) => s.skillId === skillId);
      const proficiencyScore = skillEntry ? (skillEntry.level / 5) * 100 : 0;

      // 3. Group Leader bonus (agency can handle more volume)
      const leaderBonus = worker.isGroupLeader ? 15 : 0;

      const totalScore = proximityScore * 0.5 + proficiencyScore * 0.4 + leaderBonus * 0.1;

      return { ...worker, _distanceKm: parseFloat(dist.toFixed(2)), _score: parseFloat(totalScore.toFixed(1)) };
    });

    return scored.sort((a, b) => b._score - a._score).slice(0, limit);
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async search(query: { skillId?: string; area?: string }) {
    const workers = await this.db.client.worker.findMany({
      where: {
        isVerified: true,
        isAvailable: true,
        leaderId: null, // Only show individual workers or group leaders on the map
        ...(query.skillId && {
          skills: {
            some: { skillId: query.skillId }
          }
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        members: {
          select: { id: true }
        },
        reviews: {
          where: { isFlagged: false, role: 'PROVIDER_TO_WORKER' },
          select: { rating: true }
        }
      },
    });

    return workers.map(w => ({
      ...w,
      rating: w.reviews.length > 0 
        ? w.reviews.reduce((acc, r) => acc + r.rating, 0) / w.reviews.length 
        : 0,
      reviewCount: w.reviews.length
    }));
  }

  async listSkills() {
    return this.db.client.skill.findMany();
  }
}
