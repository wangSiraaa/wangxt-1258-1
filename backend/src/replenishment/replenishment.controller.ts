import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReplenishmentService } from './replenishment.service';
import { CreateReplenishmentDto, UpdateReplenishmentDto, ReplenishmentQueryDto } from './dto/replenishment.dto';

@Controller('api/replenishments')
export class ReplenishmentController {
  constructor(private readonly replenishmentService: ReplenishmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateReplenishmentDto) {
    return this.replenishmentService.create(createDto);
  }

  @Get()
  findAll(@Query() query: ReplenishmentQueryDto) {
    return this.replenishmentService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.replenishmentService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.replenishmentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateReplenishmentDto) {
    return this.replenishmentService.update(id, updateDto);
  }

  @Delete(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.replenishmentService.cancel(id);
  }
}
