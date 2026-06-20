import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';
import { MaterialCategory } from '../../entities/material.entity';

export class CreateMaterialDto {
  @IsString()
  name: string;

  @IsEnum(MaterialCategory)
  category: MaterialCategory;

  @IsString()
  unit: string;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsInt()
  @IsOptional()
  safetyStock?: number;

  @IsString()
  @IsOptional()
  specifications?: string;

  @IsString()
  @IsOptional()
  storageLocation?: string;
}

export class UpdateMaterialDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(MaterialCategory)
  @IsOptional()
  category?: MaterialCategory;

  @IsInt()
  @IsOptional()
  quantity?: number;

  @IsInt()
  @IsOptional()
  safetyStock?: number;

  @IsString()
  @IsOptional()
  specifications?: string;

  @IsString()
  @IsOptional()
  storageLocation?: string;
}

export class MaterialQueryDto {
  @IsEnum(MaterialCategory)
  @IsOptional()
  category?: MaterialCategory;

  @IsString()
  @IsOptional()
  name?: string;
}
