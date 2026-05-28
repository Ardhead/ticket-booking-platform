import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class EventsService {
  constructor(private readonly db: DbService) {}

  async create(data: { name: string; startsAt: Date }) {
    return this.db.event.create({ data });
  }

  async findAll() {
    return this.db.event.findMany({ orderBy: { startsAt: 'asc' } });
  }

  async findById(id: string) {
    const event = await this.db.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }
}
