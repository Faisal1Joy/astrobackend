import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './orders/order.entity';

async function cleanupOrders() {
  const app = await NestFactory.create(AppModule);

  try {
    const orderRepository = app.get(getRepositoryToken(Order));
    
    // Delete all orders
    await orderRepository.createQueryBuilder()
      .delete()
      .execute();

    console.log('All orders have been removed successfully');
  } catch (error) {
    console.error('Error removing orders:', error);
  } finally {
    await app.close();
  }
}

cleanupOrders(); 