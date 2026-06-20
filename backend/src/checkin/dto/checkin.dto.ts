import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CheckInDto {
  @IsUUID()
  personId: string;

  @IsUUID()
  locationId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CheckOutDto {
  @IsUUID()
  recordId: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  confirmed?: boolean;
}

export class CheckInQueryDto {
  @IsUUID()
  @IsOptional()
  locationId?: string;

  @IsUUID()
  @IsOptional()
  personId?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
