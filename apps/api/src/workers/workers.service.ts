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
    return this.db.client.worker.findMany({
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
      },
    });
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
      },
    });

    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }

    return worker;
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

  async search(query: { skillId?: string; area?: string }) {
    return this.db.client.worker.findMany({
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
        }
      },
    });
  }

  async listSkills() {
    return this.db.client.skill.findMany();
  }
}
