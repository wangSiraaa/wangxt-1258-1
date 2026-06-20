import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from '../entities/material.entity';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { ReplenishmentModule } from '../replenishment/replenishment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material]),
    ReplenishmentModule,
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
