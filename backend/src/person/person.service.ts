import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person, PersonPriority } from '../entities/person.entity';
import { CreatePersonDto, UpdatePersonDto, PersonQueryDto } from './dto/person.dto';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  async create(createDto: CreatePersonDto): Promise<Person> {
    const existing = await this.personRepository.findOne({
      where: { idCard: createDto.idCard },
    });
    if (existing) {
      throw new ConflictException('该身份证号已存在');
    }

    const person = this.personRepository.create(createDto);
    return this.personRepository.save(person);
  }

  async findAll(query?: PersonQueryDto): Promise<Person[]> {
    const qb = this.personRepository.createQueryBuilder('person');

    if (query?.community) {
      qb.andWhere('person.community = :community', { community: query.community });
    }
    if (query?.priority) {
      qb.andWhere('person.priority = :priority', { priority: query.priority });
    }
    if (query?.name) {
      qb.andWhere('person.name LIKE :name', { name: `%${query.name}%` });
    }

    qb.leftJoinAndSelect('person.checkInRecords', 'records')
      .orderBy('person.priority', 'DESC')
      .addOrderBy('person.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.personRepository.findOne({
      where: { id },
      relations: ['checkInRecords', 'checkInRecords.location', 'followUps'],
    });
    if (!person) {
      throw new NotFoundException(`人员 ${id} 不存在`);
    }
    return person;
  }

  async update(id: string, updateDto: UpdatePersonDto): Promise<Person> {
    const person = await this.findOne(id);
    Object.assign(person, updateDto);
    return this.personRepository.save(person);
  }

  async remove(id: string): Promise<void> {
    const person = await this.findOne(id);
    if (person.isCurrentlyCheckedIn) {
      throw new ConflictException('该人员当前在站，无法删除');
    }
    await this.personRepository.delete(id);
  }

  async updateCheckInStatus(id: string, isCheckedIn: boolean): Promise<Person> {
    const person = await this.findOne(id);
    person.isCurrentlyCheckedIn = isCheckedIn;
    return this.personRepository.save(person);
  }

  async getHighPriorityList(): Promise<Person[]> {
    return this.personRepository.find({
      where: { priority: PersonPriority.HIGH },
      order: { createdAt: 'DESC' },
    });
  }

  async getStatistics(): Promise<any> {
    const [total, highPriority, mediumPriority, lowPriority, currentlyIn] = await Promise.all([
      this.personRepository.count(),
      this.personRepository.count({ where: { priority: PersonPriority.HIGH } }),
      this.personRepository.count({ where: { priority: PersonPriority.MEDIUM } }),
      this.personRepository.count({ where: { priority: PersonPriority.LOW } }),
      this.personRepository.count({ where: { isCurrentlyCheckedIn: true } }),
    ]);

    return {
      total,
      highPriority,
      mediumPriority,
      lowPriority,
      currentlyIn,
    };
  }
}
