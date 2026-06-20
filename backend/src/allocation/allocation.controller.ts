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
import { AllocationService } from './allocation.service';
import { CreateAllocationDto, UpdateAllocationDto, AllocationQueryDto } from './dto/allocation.dto';

@Controller('api/allocations')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateAllocationDto) {
    return this.allocationService.create(createDto);
  }

  @Get()
  findAll(@Query() query: AllocationQueryDto) {
    return this.allocationService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.allocationService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.allocationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAllocationDto) {
    return this.allocationService.update(id, updateDto);
  }

  @Patch(':id/confirm-delivery')
  confirmDelivery(@Param('id') id: string) {
    return this.allocationService.confirmDelivery(id);
  }
}
