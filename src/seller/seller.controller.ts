import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SellerService } from './seller.service';

@Controller('seller')
@UseGuards(JwtAuthGuard)
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('dashboard')
  async getDashboardData() {
    return this.sellerService.getDashboardData();
  }
} 