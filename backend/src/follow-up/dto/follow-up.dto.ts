import { IsUUID, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { FollowUpStatus } from '../../entities/follow-up.entity';

export class CreateFollowUpDto {
  @IsUUID()
  personId: string;

  @IsUUID()
  @IsOptional()
  checkInRecordId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateFollowUpDto {
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  needsFurtherAction?: boolean;
}

export class FollowUpQueryDto {
  @IsUUID()
  @IsOptional()
  personId?: string;

  @IsEnum(FollowUpStatus)
  @IsOptional()
  status?: FollowUpStatus;
}
