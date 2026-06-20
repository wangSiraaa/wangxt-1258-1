import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationModule } from './location/location.module';
import { PersonModule } from './person/person.module';
import { CheckInModule } from './checkin/checkin.module';
import { MaterialModule } from './material/material.module';
import { AllocationModule } from './allocation/allocation.module';
import { FollowUpModule } from './follow-up/follow-up.module';
import { ReplenishmentModule } from './replenishment/replenishment.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'password123',
      database: 'heat_relief',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    LocationModule,
    PersonModule,
    CheckInModule,
    MaterialModule,
    AllocationModule,
    FollowUpModule,
    ReplenishmentModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
