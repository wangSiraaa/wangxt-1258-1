import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FollowUpService } from './follow-up.service';
import { CreateFollowUpDto, UpdateFollowUpDto, FollowUpQueryDto } from './dto/follow-up.dto';

@Controller('api/follow-ups')
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateFollowUpDto) {
    return this.followUpService.create(createDto);
  }

  @Get()
  findAll(@Query() query: FollowUpQueryDto) {
    return this.followUpService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.followUpService.getStatistics();
  }

  @Get('pending')
  getPendingFollowUps() {
    return this.followUpService.getPendingFollowUps();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.followUpService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFollowUpDto) {
    return this.followUpService.update(id, updateDto);
  }
}
