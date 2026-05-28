import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { EventsService } from './events.service';

class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  startsAt!: string;
}

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() dto: CreateEventDto) {
    return this.eventsService.create({ name: dto.name, startsAt: new Date(dto.startsAt) });
  }

  @Get()
  async findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }
}
