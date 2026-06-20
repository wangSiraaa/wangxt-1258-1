import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUp, FollowUpStatus } from '../entities/follow-up.entity';
import { CheckInRecord } from '../entities/checkin-record.entity';
import { CreateFollowUpDto, UpdateFollowUpDto, FollowUpQueryDto } from './dto/follow-up.dto';

@Injectable()
export class FollowUpService {
  constructor(
    @InjectRepository(FollowUp)
    private followUpRepository: Repository<FollowUp>,
  ) {}

  async create(createDto: CreateFollowUpDto): Promise<FollowUp> {
    const followUp = this.followUpRepository.create(createDto);
    return this.followUpRepository.save(followUp);
  }

  async createFromCheckIn(checkInRecord: CheckInRecord): Promise<FollowUp> {
    const followUp = this.followUpRepository.create({
      personId: checkInRecord.personId,
      checkInRecordId: checkInRecord.id,
      status: FollowUpStatus.PENDING,
      notes: '离站时未确认，需要回访确认安全',
    });
    return this.followUpRepository.save(followUp);
  }

  async findAll(query?: FollowUpQueryDto): Promise<FollowUp[]> {
    const qb = this.followUpRepository.createQueryBuilder('followUp');

    if (query?.personId) {
      qb.andWhere('followUp.personId = :personId', { personId: query.personId });
    }
    if (query?.status) {
      qb.andWhere('followUp.status = :status', { status: query.status });
    }

    qb.leftJoinAndSelect('followUp.person', 'person')
      .leftJoinAndSelect('followUp.checkInRecord', 'record')
      .orderBy('followUp.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<FollowUp> {
    const followUp = await this.followUpRepository.findOne({
      where: { id },
      relations: ['person', 'checkInRecord'],
    });
    if (!followUp) {
      throw new NotFoundException(`回访记录 ${id} 不存在`);
    }
    return followUp;
  }

  async update(id: string, updateDto: UpdateFollowUpDto): Promise<FollowUp> {
    const followUp = await this.findOne(id);
    Object.assign(followUp, updateDto);
    if (updateDto.status && updateDto.status !== FollowUpStatus.PENDING) {
      followUp.followUpTime = new Date();
    }
    return this.followUpRepository.save(followUp);
  }

  async getPendingFollowUps(): Promise<FollowUp[]> {
    return this.followUpRepository.find({
      where: { status: FollowUpStatus.PENDING },
      relations: ['person'],
      order: { createdAt: 'ASC' },
    });
  }

  async getStatistics(): Promise<any> {
    const [total, pending, completed, needsAssistance] = await Promise.all([
      this.followUpRepository.count(),
      this.followUpRepository.count({ where: { status: FollowUpStatus.PENDING }),
      this.followUpRepository.count({ where: { status: FollowUpStatus.COMPLETED }),
      this.followUpRepository.count({ where: { needsFurtherAction: true }),
    ]);

    return {
      total,
      pending,
      completed,
      needsAssistance,
    };
  }
}
