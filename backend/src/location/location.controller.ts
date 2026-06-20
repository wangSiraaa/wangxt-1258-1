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
import { LocationService } from './location.service';
import { CreateLocationDto, UpdateLocationDto, LocationQueryDto } from './dto/location.dto';

@Controller('api/locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateLocationDto) {
    return this.locationService.create(createDto);
  }

  @Get()
  findAll(@Query() query: LocationQueryDto) {
    return this.locationService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.locationService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Get(':id/capacity')
  checkCapacity(@Param('id') id: string) {
    return this.locationService.checkCapacity(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateLocationDto) {
    return this.locationService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.locationService.remove(id);
  }
}
