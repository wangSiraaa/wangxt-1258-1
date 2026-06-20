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

  @ManyToOne(() => Person, (person) => person.followUps)
  @JoinColumn({ name: 'personId' })
  person: Person;

  @ManyToOne(() => CheckInRecord)
  @JoinColumn({ name: 'checkInRecordId' })
  checkInRecord: CheckInRecord;

  @CreateDateColumn()
  createdAt: Date;
}
