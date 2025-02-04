import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { Order } from './orders/order.entity';
import * as bcrypt from 'bcrypt';

async function insertTestOrders() {
  const app = await NestFactory.create(AppModule);

  try {
    // Get repositories
    const userRepository = app.get(getRepositoryToken(User));
    const productRepository = app.get(getRepositoryToken(Product));
    const orderRepository = app.get(getRepositoryToken(Order));

    // Find existing users or create them
    let buyer = await userRepository.findOne({ where: { email: 'Joy@gmail.com' } });
    let seller = await userRepository.findOne({ where: { email: 'admin@example.com' } });

    if (!buyer || !seller) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      if (!buyer) {
        buyer = await userRepository.save({
          email: 'Joy@gmail.com',
          password: hashedPassword,
          firstName: 'Joy',
          lastName: 'User'
        });
        console.log('Created buyer user');
      }

      if (!seller) {
        seller = await userRepository.save({
          email: 'admin@example.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User'
        });
        console.log('Created seller user');
      }
    }

    // Find products by their names
    const productNames = ['Formal Shirt', 'Jeans', 'Zoggers'];
    const products = await Promise.all(
      productNames.map(name => productRepository.findOne({ where: { name } }))
    );

    if (products.some(p => !p)) {
      console.error('Some products not found. Please make sure all products exist.');
      return;
    }

    // Create test orders with different statuses for each product
    const orderData = products.map((product, index) => {
      const quantity = Math.floor(Math.random() * 2) + 1; // Random quantity between 1 and 2
      const statuses = ['Pending', 'Shipped', 'Delivered'];
      const status = statuses[index % 3];

      const baseOrder = {
        product,
        buyer,
        seller,
        quantity,
        amount: product.price * quantity,
        status,
        shippingAddress: `${123 + index} Main Street, Test City, ${12345 + index}`
      };

      // Add tracking number for shipped and delivered orders
      if (status === 'Shipped' || status === 'Delivered') {
        Object.assign(baseOrder, {
          trackingNumber: `TRK${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        });
      }

      // Add invoice number for delivered orders
      if (status === 'Delivered') {
        Object.assign(baseOrder, {
          invoiceNumber: `INV${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        });
      }

      return baseOrder;
    });

    // Insert the orders
    for (const data of orderData) {
      const order = await orderRepository.save(data);
      console.log(`Created order for ${data.product.name} with status: ${data.status}`);
    }

    console.log('Test orders inserted successfully');
  } catch (error) {
    console.error('Error inserting test orders:', error);
  } finally {
    await app.close();
  }
}

insertTestOrders(); 