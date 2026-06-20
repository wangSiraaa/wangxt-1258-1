import { IsUUID, IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { AllocationStatus } from '../../entities/allocation.entity';

export class CreateAllocationDto {
  @IsUUID()
  materialId: string;

  @IsString()
  fromLocation: string;

  @IsUUID()
  toLocationId: string;

  @IsInt()
  quantity: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateAllocationDto {
  @IsEnum(AllocationStatus)
  @IsOptional()
  status?: AllocationStatus;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class AllocationQueryDto {
  @IsUUID()
  @IsOptional()
  materialId?: string;

  @IsUUID()
  @IsOptional()
  toLocationId?: string;

  @IsEnum(AllocationStatus)
  @IsOptional()
  status?: AllocationStatus;
}
