import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWalletDto {
    @IsString()
    @MinLength(42)
    @MaxLength(42)
    address!: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    label?: string;
}
