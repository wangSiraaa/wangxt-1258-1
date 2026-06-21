import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from './person.entity';
import { CheckInRecord } from './checkin-record.entity';

export enum FollowUpStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  NO_ANSWER = 'no_answer',
  NEEDS_ASSISTANCE = 'needs_assistance',
}

export enum ContactResult {
  ARRIVED_SAFE = 'arrived_safe',
  NOT_ARRIVED = 'not_arrived',
  NO_ANSWER = 'no_answer',
  WRONG_NUMBER = 'wrong_number',
  OTHER = 'other',
}

@Entity('follow_ups')
export class FollowUp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  personId: string;

  @Column({ nullable: true })
  checkInRecordId: string;

  @Column({
    type: 'enum',
    enum: FollowUpStatus,
    default: FollowUpStatus.PENDING,
  })
  status: FollowUpStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  followUpTime: Date;

  @Column({ default: false })
  needsFurtherAction: boolean;

  @Column({ default: false })
  isDepartureFollowUp: boolean;

  @Column({
    type: 'enum',
    enum: ContactResult,
    nullable: true,
  })
  contactResult: ContactResult;

  @Column({ type: 'text', nullable: true })
  departureRemarks: string;

  @ManyToOne(() => Person, (person) => person.followUps)
  @JoinColumn({ name: 'personId' })
  person: Person;

  @ManyToOne(() => CheckInRecord)
  @JoinColumn({ name: 'checkInRecordId' })
  checkInRecord: CheckInRecord;

  @CreateDateColumn()
  createdAt: Date;
}
