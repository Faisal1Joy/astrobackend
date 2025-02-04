import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { Order } from './orders/order.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.create(AppModule);

  // Get repositories
  const userRepository = app.get(getRepositoryToken(User));
  const productRepository = app.get(getRepositoryToken(Product));
  const orderRepository = app.get(getRepositoryToken(Order));

  // Create seller
  const hashedPassword = await bcrypt.hash('password123', 10);
  const seller = await userRepository.save({
    email: 'seller3@example.com',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Seller',
    role: 'seller'
  });

  // Create buyer
  const buyer = await userRepository.save({
    email: 'buyer3@example.com',
    password: hashedPassword,
    firstName: 'Jane',
    lastName: 'Buyer',
    role: 'buyer'
  });

  // Create product
  const product = await productRepository.save({
    name: 'Sample Product',
    description: 'This is a sample product',
    price: 100,
    stock: 10,
    seller,
    isActive: true,
    category: 'Electronics',
    images: ['https://example.com/sample-product.jpg']
  });

  // Create order
  await orderRepository.save({
    product,
    buyer,
    seller,
    quantity: 2,
    amount: product.price * 2,
    status: 'Pending',
    shippingAddress: '123 Sample St, Sample City'
  });

  console.log('Seed data inserted successfully');
  await app.close();
}

seed().catch(console.error); 