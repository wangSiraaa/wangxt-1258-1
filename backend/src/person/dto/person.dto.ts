import { IsString, IsOptional, IsEnum, IsPhoneNumber } from 'class-validator';
import { PersonPriority } from '../../entities/person.entity';

export class CreatePersonDto {
  @IsString()
  name: string;

  @IsString()
  idCard: string;

  @IsPhoneNumber('CN')
  phone: string;

  @IsString()
  address: string;

  @IsString()
  community: string;

  @IsEnum(PersonPriority)
  @IsOptional()
  priority?: PersonPriority;

  @IsString()
  @IsOptional()
  medicalConditions?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;
}

export class UpdatePersonDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsPhoneNumber('CN')
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(PersonPriority)
  @IsOptional()
  priority?: PersonPriority;

  @IsString()
  @IsOptional()
  medicalConditions?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;
}

export class PersonQueryDto {
  @IsString()
  @IsOptional()
  community?: string;

  @IsEnum(PersonPriority)
  @IsOptional()
  priority?: PersonPriority;

  @IsString()
  @IsOptional()
  name?: string;
}
