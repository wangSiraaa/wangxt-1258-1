import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material, MaterialCategory } from '../entities/material.entity';
import { ReplenishmentService } from '../replenishment/replenishment.service';
import { CreateMaterialDto, UpdateMaterialDto, MaterialQueryDto } from './dto/material.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
    private replenishmentService: ReplenishmentService,
  ) {}

  async create(createDto: CreateMaterialDto): Promise<Material> {
    const material = this.materialRepository.create({
      quantity: 0,
      safetyStock: 20,
      ...createDto,
    });
    material.lowStockAlert = material.quantity <= material.safetyStock;
    const saved = await this.materialRepository.save(material);

    if (saved.lowStockAlert) {
      await this.replenishmentService.autoGenerateIfNeeded(saved);
    }

    return saved;
  }

  async findAll(query?: MaterialQueryDto): Promise<Material[]> {
    const qb = this.materialRepository.createQueryBuilder('material');

    if (query?.category) {
      qb.andWhere('material.category = :category', { category: query.category });
    }
    if (query?.name) {
      qb.andWhere('material.name LIKE :name', { name: `%${query.name}%` });
    }

    qb.leftJoinAndSelect('material.allocations', 'allocations')
      .orderBy('material.lowStockAlert', 'DESC')
      .addOrderBy('material.quantity', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<Material> {
    const material = await this.materialRepository.findOne({
      where: { id },
      relations: ['allocations'],
    });
    if (!material) {
      throw new NotFoundException(`物资 ${id} 不存在`);
    }
    return material;
  }

  async update(id: string, updateDto: UpdateMaterialDto): Promise<Material> {
    const material = await this.findOne(id);
    Object.assign(material, updateDto);
    material.lowStockAlert = material.quantity <= material.safetyStock;

    const saved = await this.materialRepository.save(material);

    if (saved.lowStockAlert) {
      await this.replenishmentService.autoGenerateIfNeeded(saved);
    }

    return saved;
  }

  async updateQuantity(id: string, delta: number): Promise<Material> {
    const material = await this.findOne(id);
    const newQuantity = material.quantity + delta;

    if (newQuantity < 0) {
      throw new BadRequestException('库存数量不能为负数');
    }

    material.quantity = newQuantity;
    material.lowStockAlert = newQuantity <= material.safetyStock;

    const saved = await this.materialRepository.save(material);

    if (saved.lowStockAlert) {
      await this.replenishmentService.autoGenerateIfNeeded(saved);
    }

    return saved;
  }

  async getLowStockMaterials(): Promise<Material[]> {
    return this.materialRepository.find({
      where: { lowStockAlert: true },
      order: { quantity: 'ASC' },
    });
  }

  async checkAndGenerateReplenishments(): Promise<void> {
    const lowStockMaterials = await this.getLowStockMaterials();
    for (const material of lowStockMaterials) {
      await this.replenishmentService.autoGenerateIfNeeded(material);
    }
  }

  async getStatistics(): Promise<any> {
    const [total, lowStock, drinkingWater, medicine] = await Promise.all([
      this.materialRepository.count(),
      this.materialRepository.count({ where: { lowStockAlert: true } }),
      this.materialRepository.findOne({ where: { category: MaterialCategory.DRINKING_WATER } }),
      this.materialRepository.findOne({ where: { category: MaterialCategory.MEDICINE } }),
    ]);

    const totalValue = await this.materialRepository
      .createQueryBuilder('material')
      .select('SUM(material.quantity)', 'totalQuantity')
      .getRawOne();

    return {
      total,
      lowStock,
      totalQuantity: parseInt(totalValue.totalQuantity) || 0,
      drinkingWaterQuantity: drinkingWater?.quantity || 0,
      medicineQuantity: medicine?.quantity || 0,
    };
  }
}
