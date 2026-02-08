import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FilterEventsDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
