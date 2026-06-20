import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Material } from './material.entity';
import { Location } from './location.entity';

export enum AllocationStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('allocations')
export class Allocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  materialId: string;

  @Column()
  fromLocation: string;

  @Column()
  toLocationId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'enum',
    enum: AllocationStatus,
    default: AllocationStatus.PENDING,
  })
  status: AllocationStatus;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'timestamp', nullable: true })
  dispatchedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @ManyToOne(() => Material, (material) => material.allocations)
  @JoinColumn({ name: 'materialId' })
  material: Material;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'toLocationId' })
  toLocation: Location;

  @CreateDateColumn()
  createdAt: Date;
}
