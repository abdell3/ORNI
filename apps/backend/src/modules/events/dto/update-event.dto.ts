import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Le titre est requis' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'La description est requise' })
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Le lieu est requis' })
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'La capacité doit être au moins 1' })
  capacity?: number;
}
