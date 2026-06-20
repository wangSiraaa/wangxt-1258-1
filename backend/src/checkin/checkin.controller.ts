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
import { CheckInService } from './checkin.service';
import { CheckInDto, CheckOutDto, CheckInQueryDto } from './dto/checkin.dto';

@Controller('api/check-ins')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  checkIn(@Body() checkInDto: CheckInDto) {
    return this.checkInService.checkIn(checkInDto);
  }

  @Post('check-out')
  checkOut(@Body() checkOutDto: CheckOutDto) {
    return this.checkInService.checkOut(checkOutDto);
  }

  @Get()
  findAll(@Query() query: CheckInQueryDto) {
    return this.checkInService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.checkInService.getStatistics();
  }

  @Get('unconfirmed')
  getUnconfirmedCheckOuts() {
    return this.checkInService.getUnconfirmedCheckOuts();
  }

  @Get('location/:locationId')
  getCurrentByLocation(@Param('locationId') locationId: string) {
    return this.checkInService.getCurrentByLocation(locationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkInService.findOne(id);
  }

  @Patch(':id/reminder-sent')
  @HttpCode(HttpStatus.NO_CONTENT)
  markReminderSent(@Param('id') id: string) {
    return this.checkInService.markReminderSent(id);
  }
}
