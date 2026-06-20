import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Allocation } from '../entities/allocation.entity';
import { AllocationService } from './allocation.service';
import { AllocationController } from './allocation.controller';
import { MaterialModule } from '../material/material.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Allocation]),
    MaterialModule,
    LocationModule,
  ],
  controllers: [AllocationController],
  providers: [AllocationService],
  exports: [AllocationService],
})
export class AllocationModule {}
