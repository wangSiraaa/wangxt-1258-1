import { IsString, IsInt, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { LocationStatus } from '../entities/location.entity';

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  street: string;

  @IsString()
  community: string;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  facilities?: string;
}

export class UpdateLocationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(LocationStatus)
  @IsOptional()
  status?: LocationStatus;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  facilities?: string;
}

export class LocationQueryDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  community?: string;

  @IsEnum(LocationStatus)
  @IsOptional()
  status?: LocationStatus;
}
