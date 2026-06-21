import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location, LocationStatus } from '../entities/location.entity';
import { Person, PersonPriority } from '../entities/person.entity';
import { Material, MaterialCategory } from '../entities/material.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async onModuleInit() {
    try {
      const locationCount = await this.locationRepository.count();
      if (locationCount === 0) {
        await this.seedLocations();
      }
      const personCount = await this.personRepository.count();
      if (personCount === 0) {
        await this.seedPeople();
      }
      const materialCount = await this.materialRepository.count();
      if (materialCount === 0) {
        await this.seedMaterials();
      }
      this.logger.log('Seed 数据初始化完成');
    } catch (e) {
      this.logger.warn(`Seed 数据初始化跳过: ${e.message}`);
    }
  }

  private async seedLocations() {
    const locations = [
      {
        name: '阳光社区服务中心',
        address: '朝阳路101号',
        street: '朝阳街道',
        community: '阳光社区',
        capacity: 30,
        currentOccupancy: 0,
        status: LocationStatus.OPEN,
        facilities: '空调、饮水机、急救箱、座椅50个',
      },
      {
        name: '绿洲小区文化活动站',
        address: '建设东路88号',
        street: '朝阳街道',
        community: '绿洲社区',
        capacity: 50,
        currentOccupancy: 0,
        status: LocationStatus.OPEN,
        facilities: '中央空调、冷风机、急救药箱、休息床10张',
      },
      {
        name: '和平公园遮阳驿站',
        address: '人民街256号',
        street: '和平街道',
        community: '和平社区',
        capacity: 80,
        currentOccupancy: 0,
        status: LocationStatus.OPEN,
        facilities: '遮阳棚、雾化降温、电风扇、瓶装水发放点',
      },
      {
        name: '福兴街道综合文化站',
        address: '福兴路55号',
        street: '福兴街道',
        community: '福兴社区',
        capacity: 40,
        currentOccupancy: 0,
        status: LocationStatus.OPEN,
        facilities: '空调、冰箱、常用药品、阅览室',
      },
    ];
    await this.locationRepository.save(this.locationRepository.create(locations));
    this.logger.log(`已创建 ${locations.length} 个避暑点位`);
  }

  private async seedPeople() {
    const people = [
      {
        name: '张秀兰',
        idCard: '110101194501010011',
        gender: 'FEMALE',
        age: 79,
        phone: '13800000001',
        address: '朝阳路101号2栋3单元',
        priority: PersonPriority.HIGH,
        healthStatus: '高血压、糖尿病，独居',
        emergencyContact: '李明 13800001111',
        isCurrentlyCheckedIn: false,
      },
      {
        name: '王建国',
        idCard: '110101194803150022',
        gender: 'MALE',
        age: 76,
        phone: '13800000002',
        address: '建设东路88号',
        priority: PersonPriority.HIGH,
        healthStatus: '冠心病、行动不便',
        emergencyContact: '王芳 13800002222',
        isCurrentlyCheckedIn: false,
      },
      {
        name: '刘秀英',
        idCard: '110101195511200033',
        gender: 'FEMALE',
        age: 69,
        phone: '13800000003',
        address: '人民街256号小区',
        priority: PersonPriority.MEDIUM,
        healthStatus: '关节炎，可独立出行',
        emergencyContact: '儿子 13800003333',
        isCurrentlyCheckedIn: false,
      },
      {
        name: '赵德财',
        idCard: '110101195806080044',
        gender: 'MALE',
        age: 66,
        phone: '13800000004',
        address: '福兴路55号院',
        priority: PersonPriority.MEDIUM,
        healthStatus: '轻度高血压',
        emergencyContact: '赵小娟 13800004444',
        isCurrentlyCheckedIn: false,
      },
      {
        name: '孙美玲',
        idCard: '110101197204120055',
        gender: 'FEMALE',
        age: 53,
        phone: '13800000005',
        address: '朝阳路101号',
        priority: PersonPriority.LOW,
        healthStatus: '健康，户外工作者',
        emergencyContact: '',
        isCurrentlyCheckedIn: false,
      },
    ];
    await this.personRepository.save(this.personRepository.create(people));
    this.logger.log(`已创建 ${people.length} 条重点人群记录`);
  }

  private async seedMaterials() {
    const materials = [
      {
        name: '瓶装饮用水（550ml）',
        category: MaterialCategory.DRINKING_WATER,
        unit: '瓶',
        quantity: 480,
        safetyStock: 200,
        lowStockAlert: false,
      },
      {
        name: '藿香正气水',
        category: MaterialCategory.MEDICINE,
        unit: '盒',
        quantity: 8,
        safetyStock: 30,
        lowStockAlert: true,
      },
      {
        name: '仁丹',
        category: MaterialCategory.MEDICINE,
        unit: '盒',
        quantity: 25,
        safetyStock: 20,
        lowStockAlert: false,
      },
      {
        name: '清凉油',
        category: MaterialCategory.MEDICINE,
        unit: '盒',
        quantity: 12,
        safetyStock: 30,
        lowStockAlert: true,
      },
      {
        name: '降温冰贴',
        category: MaterialCategory.OTHER,
        unit: '片',
        quantity: 300,
        safetyStock: 100,
        lowStockAlert: false,
      },
      {
        name: '桶装方便面',
        category: MaterialCategory.FOOD,
        unit: '桶',
        quantity: 60,
        safetyStock: 40,
        lowStockAlert: false,
      },
    ];
    await this.materialRepository.save(this.materialRepository.create(materials));
    this.logger.log(`已创建 ${materials.length} 种物资记录`);
  }
}
