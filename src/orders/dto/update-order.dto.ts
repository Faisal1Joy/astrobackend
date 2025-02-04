import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateOrderDto {
  @IsString()
  @IsIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'])
  status: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  invoiceNumber?: string;
} 