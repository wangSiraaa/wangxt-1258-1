import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location, LocationStatus } from '../entities/location.entity';
import { CreateLocationDto, UpdateLocationDto, LocationQueryDto } from './dto/location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async create(createDto: CreateLocationDto): Promise<Location> {
    const location = this.locationRepository.create({
      ...createDto,
      status: LocationStatus.OPEN,
      openTime: new Date(),
    });
    return this.locationRepository.save(location);
  }

  async findAll(query?: LocationQueryDto): Promise<Location[]> {
    const qb = this.locationRepository.createQueryBuilder('location');

    if (query?.street) {
      qb.andWhere('location.street = :street', { street: query.street });
    }
    if (query?.community) {
      qb.andWhere('location.community = :community', { community: query.community });
    }
    if (query?.status) {
      qb.andWhere('location.status = :status', { status: query.status });
    }

    qb.leftJoinAndSelect('location.checkInRecords', 'records')
      .orderBy('location.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: ['checkInRecords', 'checkInRecords.person'],
    });
    if (!location) {
      throw new NotFoundException(`点位 ${id} 不存在`);
    }
    return location;
  }

  async update(id: string, updateDto: UpdateLocationDto): Promise<Location> {
    const location = await this.findOne(id);
    Object.assign(location, updateDto);
    return this.locationRepository.save(location);
  }

  async remove(id: string): Promise<void> {
    const result = await this.locationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`点位 ${id} 不存在`);
    }
  }

  async updateOccupancy(id: string, delta: number): Promise<Location> {
    const location = await this.findOne(id);
    const newOccupancy = location.currentOccupancy + delta;

    if (newOccupancy < 0) {
      throw new BadRequestException('当前人数不能为负数');
    }

    if (newOccupancy > location.capacity) {
      throw new BadRequestException('点位容量已满，无法继续登记');
    }

    location.currentOccupancy = newOccupancy;

    if (newOccupancy >= location.capacity) {
      location.status = LocationStatus.FULL;
    } else if (location.status === LocationStatus.FULL && newOccupancy < location.capacity) {
      location.status = LocationStatus.OPEN;
    }

    return this.locationRepository.save(location);
  }

  async checkCapacity(id: string): Promise<{ available: boolean; remaining: number }> {
    const location = await this.findOne(id);
    const remaining = location.capacity - location.currentOccupancy;
    return {
      available: remaining > 0 && location.status === LocationStatus.OPEN,
      remaining,
    };
  }

  async getStatistics(): Promise<any> {
    const [total, open, full, closed] = await Promise.all([
      this.locationRepository.count(),
      this.locationRepository.count({ where: { status: LocationStatus.OPEN } }),
      this.locationRepository.count({ where: { status: LocationStatus.FULL } }),
      this.locationRepository.count({ where: { status: LocationStatus.CLOSED } }),
    ]);

    const occupancyResult = await this.locationRepository
      .createQueryBuilder('location')
      .select('SUM(location.currentOccupancy)', 'totalPeople')
      .addSelect('SUM(location.capacity)', 'totalCapacity')
      .getRawOne();

    return {
      total,
      open,
      full,
      closed,
      totalPeople: parseInt(occupancyResult.totalPeople) || 0,
      totalCapacity: parseInt(occupancyResult.totalCapacity) || 0,
    };
  }
}
