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
import { MaterialService } from './material.service';
import { CreateMaterialDto, UpdateMaterialDto, MaterialQueryDto } from './dto/material.dto';

@Controller('api/materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateMaterialDto) {
    return this.materialService.create(createDto);
  }

  @Get()
  findAll(@Query() query: MaterialQueryDto) {
    return this.materialService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.materialService.getStatistics();
  }

  @Get('low-stock')
  getLowStockMaterials() {
    return this.materialService.getLowStockMaterials();
  }

  @Get('check-replenishments')
  checkAndGenerateReplenishments() {
    return this.materialService.checkAndGenerateReplenishments();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMaterialDto) {
    return this.materialService.update(id, updateDto);
  }

  @Patch(':id/quantity')
  updateQuantity(
    @Param('id') id: string,
    @Body() { delta }: { delta: number },
  ) {
    return this.materialService.updateQuantity(id, delta);
  }
}
