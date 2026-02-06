import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  password: string;

  @IsString()
  @MinLength(1, { message: 'Le prénom est requis' })
  firstName: string;

  @IsString()
  @MinLength(1, { message: 'Le nom est requis' })
  lastName: string;
}
