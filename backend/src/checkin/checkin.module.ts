import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInRecord } from '../entities/checkin-record.entity';
import { CheckInService } from './checkin.service';
import { CheckInController } from './checkin.controller';
import { LocationModule } from '../location/location.module';
import { PersonModule } from '../person/person.module';
import { FollowUpModule } from '../follow-up/follow-up.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckInRecord]),
    LocationModule,
    PersonModule,
    FollowUpModule,
  ],
  controllers: [CheckInController],
  providers: [CheckInService],
  exports: [CheckInService],
})
export class CheckInModule {}
