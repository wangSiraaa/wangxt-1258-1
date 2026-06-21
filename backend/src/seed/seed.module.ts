import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Location } from '../entities/location.entity';
import { Person } from '../entities/person.entity';
import { Material } from '../entities/material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Person, Material])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
