import { IsOptional, IsString } from 'class-validator';

export class FilterPostDto {
    @IsOptional()
    @IsString()
    userID?: string;

    @IsOptional()
    page?: number;

    @IsOptional()
    perPage?: number;
    
}