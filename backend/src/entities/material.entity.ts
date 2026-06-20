import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Allocation } from './allocation.entity';

export enum MaterialCategory {
  DRINKING_WATER = 'drinking_water',
  MEDICINE = 'medicine',
  FOOD = 'food',
  OTHER = 'other',
}

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: MaterialCategory,
    default: MaterialCategory.OTHER,
  })
  category: MaterialCategory;

  @Column()
  unit: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 20 })
  safetyStock: number;

  @Column({ default: false })
  lowStockAlert: boolean;

  @Column({ type: 'text', nullable: true })
  specifications: string;

  @Column({ type: 'text', nullable: true })
  storageLocation: string;

  @OneToMany(() => Allocation, (allocation) => allocation.material)
  allocations: Allocation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
