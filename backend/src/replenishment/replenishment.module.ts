import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Replenishment } from '../entities/replenishment.entity';
import { Material } from '../entities/material.entity';
import { ReplenishmentService } from './replenishment.service';
import { ReplenishmentController } from './replenishment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Replenishment, Material])],
  controllers: [ReplenishmentController],
  providers: [ReplenishmentService],
  exports: [ReplenishmentService],
})
export class ReplenishmentModule {}
