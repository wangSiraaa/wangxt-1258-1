import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allocation, AllocationStatus } from '../entities/allocation.entity';
import { MaterialService } from '../material/material.service';
import { LocationService } from '../location/location.service';
import { CreateAllocationDto, UpdateAllocationDto, AllocationQueryDto } from './dto/allocation.dto';

@Injectable()
export class AllocationService {
  constructor(
    @InjectRepository(Allocation)
    private allocationRepository: Repository<Allocation>,
    private materialService: MaterialService,
    private locationService: LocationService,
  ) {}

  async create(createDto: CreateAllocationDto): Promise<Allocation> {
    const { materialId, quantity, toLocationId } = createDto;

    const material = await this.materialService.findOne(materialId);
    if (material.quantity < quantity) {
      throw new BadRequestException('库存不足，无法调拨');
    }

    await this.locationService.findOne(toLocationId);

    const allocation = this.allocationRepository.create({
      ...createDto,
      status: AllocationStatus.PENDING,
    });

    const saved = await this.allocationRepository.save(allocation);

    await this.materialService.updateQuantity(materialId, -quantity);

    return saved;
  }

  async findAll(query?: AllocationQueryDto): Promise<Allocation[]> {
    const qb = this.allocationRepository.createQueryBuilder('allocation');

    if (query?.materialId) {
      qb.andWhere('allocation.materialId = :materialId', { materialId: query.materialId });
    }
    if (query?.toLocationId) {
      qb.andWhere('allocation.toLocationId = :toLocationId', { toLocationId: query.toLocationId });
    }
    if (query?.status) {
      qb.andWhere('allocation.status = :status', { status: query.status });
    }

    qb.leftJoinAndSelect('allocation.material', 'material')
      .leftJoinAndSelect('allocation.toLocation', 'toLocation')
      .orderBy('allocation.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<Allocation> {
    const allocation = await this.allocationRepository.findOne({
      where: { id },
      relations: ['material', 'toLocation'],
    });
    if (!allocation) {
      throw new NotFoundException(`调拨单 ${id} 不存在`);
    }
    return allocation;
  }

  async update(id: string, updateDto: UpdateAllocationDto): Promise<Allocation> {
    const allocation = await this.findOne(id);

    if (updateDto.status === AllocationStatus.IN_TRANSIT && allocation.status === AllocationStatus.PENDING) {
      allocation.dispatchedAt = new Date();
    }

    if (updateDto.status === AllocationStatus.DELIVERED && allocation.status !== AllocationStatus.DELIVERED) {
      allocation.deliveredAt = new Date();
    }

    if (updateDto.status === AllocationStatus.CANCELLED && allocation.status === AllocationStatus.PENDING) {
      await this.materialService.updateQuantity(allocation.materialId, allocation.quantity);
    }

    Object.assign(allocation, updateDto);
    return this.allocationRepository.save(allocation);
  }

  async confirmDelivery(id: string): Promise<Allocation> {
    const allocation = await this.findOne(id);
    if (allocation.status === AllocationStatus.DELIVERED) {
      throw new BadRequestException('该调拨单已确认收货');
    }
    if (allocation.status === AllocationStatus.CANCELLED) {
      throw new BadRequestException('该调拨单已取消');
    }

    allocation.status = AllocationStatus.DELIVERED;
    allocation.deliveredAt = new Date();

    return this.allocationRepository.save(allocation);
  }

  async getStatistics(): Promise<any> {
    const [total, pending, inTransit, delivered, cancelled] = await Promise.all([
      this.allocationRepository.count(),
      this.allocationRepository.count({ where: { status: AllocationStatus.PENDING } }),
      this.allocationRepository.count({ where: { status: AllocationStatus.IN_TRANSIT } }),
      this.allocationRepository.count({ where: { status: AllocationStatus.DELIVERED } }),
      this.allocationRepository.count({ where: { status: AllocationStatus.CANCELLED } }),
    ]);

    const todayAllocations = await this.allocationRepository
      .createQueryBuilder('a')
      .where('DATE(a.createdAt) = CURRENT_DATE')
      .getCount();

    return {
      total,
      pending,
      inTransit,
      delivered,
      cancelled,
      todayAllocations,
    };
  }
}
