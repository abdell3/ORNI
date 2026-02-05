import {
  IsDateString,
  IsInt,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(1, { message: 'Le titre est requis' })
  title: string;

  @IsString()
  @MinLength(1, { message: 'La description est requise' })
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  @MinLength(1, { message: 'Le lieu est requis' })
  location: string;

  @IsInt()
  @Min(1, { message: 'La capacité doit être au moins 1' })
  capacity: number;
}
