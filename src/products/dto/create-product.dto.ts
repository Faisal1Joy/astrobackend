import { IsString, IsNumber, IsArray, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountPrice?: number;
} 