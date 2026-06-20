import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CheckInRecord } from './checkin-record.entity';

export enum LocationStatus {
  OPEN = 'open',
  FULL = 'full',
  CLOSED = 'closed',
}

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  street: string;

  @Column()
  community: string;

  @Column({ type: 'int', default: 50 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentOccupancy: number;

  @Column({
    type: 'enum',
    enum: LocationStatus,
    default: LocationStatus.OPEN,
  })
  status: LocationStatus;

  @Column({ type: 'text', nullable: true })
  facilities: string;

  @Column({ type: 'timestamp', nullable: true })
  openTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  closeTime: Date;

  @OneToMany(() => CheckInRecord, (record) => record.location)
  checkInRecords: CheckInRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
