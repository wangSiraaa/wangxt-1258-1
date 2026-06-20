import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { MaterialModule } from '../material/material.module';
import { CheckInModule } from '../checkin/checkin.module';
import { FollowUpModule } from '../follow-up/follow-up.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MaterialModule,
    CheckInModule,
    FollowUpModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
