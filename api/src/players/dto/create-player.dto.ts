import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  discordId?: string;

  @IsString()
  @IsOptional()
  discordTag?: string;
}
