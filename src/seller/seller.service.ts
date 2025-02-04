import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>
  ) {}

  async getDashboardData() {
    // For now, return mock data
    // In a real application, you would query the database for this information
    return {
      totalSales: 156,
      pendingOrders: 23,
      totalEarnings: 12750,
      recentSales: [
        { date: '2024-02-01', amount: 1200 },
        { date: '2024-02-02', amount: 1500 },
        { date: '2024-02-03', amount: 800 },
      ],
      monthlyEarnings: [
        { month: 'Jan', earnings: 4500 },
        { month: 'Feb', earnings: 5900 },
        { month: 'Mar', earnings: 8000 },
        { month: 'Apr', earnings: 8100 },
        { month: 'May', earnings: 5600 },
        { month: 'Jun', earnings: 5500 },
      ],
    };
  }
} 