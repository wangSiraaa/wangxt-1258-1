import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Location } from './location.entity';
import { Person } from './person.entity';

export enum CheckInStatus {
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  LEFT_UNCONFIRMED = 'left_unconfirmed',
}

@Entity('check_in_records')
export class CheckInRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  personId: string;

  @Column()
  locationId: string;

  @Column({ type: 'timestamp' })
  checkInTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime: Date;

  @Column({
    type: 'enum',
    enum: CheckInStatus,
    default: CheckInStatus.CHECKED_IN,
  })
  status: CheckInStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  followUpReminderSent: boolean;

  @ManyToOne(() => Person, (person) => person.checkInRecords)
  @JoinColumn({ name: 'personId' })
  person: Person;

  @ManyToOne(() => Location, (location) => location.checkInRecords)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @CreateDateColumn()
  createdAt: Date;
}
