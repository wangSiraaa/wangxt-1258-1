import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckInRecord, CheckInStatus } from '../entities/checkin-record.entity';
import { LocationService } from '../location/location.service';
import { PersonService } from '../person/person.service';
import { FollowUpService } from '../follow-up/follow-up.service';
import { CheckInDto, CheckOutDto, CheckInQueryDto } from './dto/checkin.dto';

@Injectable()
export class CheckInService {
  constructor(
    @InjectRepository(CheckInRecord)
    private checkInRepository: Repository<CheckInRecord>,
    private locationService: LocationService,
    private personService: PersonService,
    private followUpService: FollowUpService,
  ) {}

  async checkIn(checkInDto: CheckInDto): Promise<CheckInRecord> {
    const { personId, locationId, notes } = checkInDto;

    const person = await this.personService.findOne(personId);
    if (person.isCurrentlyCheckedIn) {
      throw new BadRequestException('该人员当前已在其他点位登记');
    }

    const capacity = await this.locationService.checkCapacity(locationId);
    if (!capacity.available) {
      throw new BadRequestException('点位容量已满，无法继续登记');
    }

    const record = this.checkInRepository.create({
      personId,
      locationId,
      checkInTime: new Date(),
      status: CheckInStatus.CHECKED_IN,
      notes,
    });

    const savedRecord = await this.checkInRepository.save(record);

    await Promise.all([
      this.locationService.updateOccupancy(locationId, 1),
      this.personService.updateCheckInStatus(personId, true),
    ]);

    return savedRecord;
  }

  async checkOut(checkOutDto: CheckOutDto): Promise<CheckInRecord> {
    const { recordId, notes, confirmed = true } = checkOutDto;

    const record = await this.findOne(recordId);
    if (record.status !== CheckInStatus.CHECKED_IN) {
      throw new BadRequestException('该记录当前状态不允许出站');
    }

    record.checkOutTime = new Date();
    record.notes = notes || record.notes;

    if (!confirmed) {
      record.status = CheckInStatus.LEFT_UNCONFIRMED;
      await this.followUpService.createFromCheckIn(record);
    } else {
      record.status = CheckInStatus.CHECKED_OUT;
    }

    const savedRecord = await this.checkInRepository.save(record);

    await Promise.all([
      this.locationService.updateOccupancy(record.locationId, -1),
      this.personService.updateCheckInStatus(record.personId, false),
    ]);

    return savedRecord;
  }

  async findAll(query?: CheckInQueryDto): Promise<CheckInRecord[]> {
    const qb = this.checkInRepository.createQueryBuilder('record');

    if (query?.locationId) {
      qb.andWhere('record.locationId = :locationId', { locationId: query.locationId });
    }
    if (query?.personId) {
      qb.andWhere('record.personId = :personId', { personId: query.personId });
    }
    if (query?.status) {
      qb.andWhere('record.status = :status', { status: query.status });
    }

    qb.leftJoinAndSelect('record.person', 'person')
      .leftJoinAndSelect('record.location', 'location')
      .orderBy('record.checkInTime', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<CheckInRecord> {
    const record = await this.checkInRepository.findOne({
      where: { id },
      relations: ['person', 'location'],
    });
    if (!record) {
      throw new NotFoundException(`登记记录 ${id} 不存在`);
    }
    return record;
  }

  async getUnconfirmedCheckOuts(): Promise<CheckInRecord[]> {
    return this.checkInRepository.find({
      where: { status: CheckInStatus.LEFT_UNCONFIRMED, followUpReminderSent: false },
      relations: ['person', 'location'],
      order: { checkOutTime: 'ASC' },
    });
  }

  async markReminderSent(id: string): Promise<void> {
    await this.checkInRepository.update(id, { followUpReminderSent: true });
  }

  async getCurrentByLocation(locationId: string): Promise<CheckInRecord[]> {
    return this.checkInRepository.find({
      where: { locationId, status: CheckInStatus.CHECKED_IN },
      relations: ['person'],
      order: { checkInTime: 'ASC' },
    });
  }

  async getStatistics(): Promise<any> {
    const [todayCheckIns, todayCheckOuts, currentlyIn, unconfirmed] = await Promise.all([
      this.checkInRepository
        .createQueryBuilder('r')
        .where('DATE(r.checkInTime) = CURRENT_DATE')
        .getCount(),
      this.checkInRepository
        .createQueryBuilder('r')
        .where('DATE(r.checkOutTime) = CURRENT_DATE')
        .andWhere('r.status != :status', { status: CheckInStatus.CHECKED_IN })
        .getCount(),
      this.checkInRepository.count({ where: { status: CheckInStatus.CHECKED_IN } }),
      this.checkInRepository.count({ where: { status: CheckInStatus.LEFT_UNCONFIRMED } }),
    ]);

    return {
      todayCheckIns,
      todayCheckOuts,
      currentlyIn,
      unconfirmed,
    };
  }
}
