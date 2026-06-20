import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CheckInRecord } from './checkin-record.entity';
import { FollowUp } from './follow-up.entity';

export enum PersonPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('people')
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  idCard: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  community: string;

  @Column({
    type: 'enum',
    enum: PersonPriority,
    default: PersonPriority.MEDIUM,
  })
  priority: PersonPriority;

  @Column({ type: 'text', nullable: true })
  medicalConditions: string;

  @Column({ type: 'text', nullable: true })
  emergencyContact: string;

  @Column({ type: 'text', nullable: true })
  emergencyPhone: string;

  @Column({ default: false })
  isCurrentlyCheckedIn: boolean;

  @OneToMany(() => CheckInRecord, (record) => record.person)
  checkInRecords: CheckInRecord[];

  @OneToMany(() => FollowUp, (followUp) => followUp.person)
  followUps: FollowUp[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
