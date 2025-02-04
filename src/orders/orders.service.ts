import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const product = await this.productsRepository.findOne({ 
      where: { id: createOrderDto.productId },
      relations: ['seller']
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.seller.id === userId) {
      throw new UnauthorizedException('Sellers cannot buy their own products');
    }

    const buyer = await this.usersRepository.findOne({
      where: { id: userId }
    });
    if (!buyer) {
      throw new NotFoundException('User not found');
    }

    const order = this.ordersRepository.create({
      ...createOrderDto,
      product,
      buyer,
      seller: product.seller,
      amount: product.price * createOrderDto.quantity,
      status: 'Pending',
    });

    return this.ordersRepository.save(order);
  }

  async findAll(userId: number) {
    return this.ordersRepository.find({
      where: [
        { buyer: { id: userId } },
        { seller: { id: userId } }
      ],
      relations: ['product', 'buyer', 'seller'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number, userId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['product', 'buyer', 'seller']
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyer.id !== userId && order.seller.id !== userId) {
      throw new UnauthorizedException('Not authorized to view this order');
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto, userId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['product', 'buyer', 'seller']
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.seller.id !== userId) {
      throw new UnauthorizedException('Only sellers can update order status');
    }

    // Generate tracking number if status is changed to 'Shipped'
    if (updateOrderDto.status === 'Shipped' && order.status !== 'Shipped') {
      updateOrderDto.trackingNumber = this.generateTrackingNumber();
    }

    // Generate invoice number if status is changed to 'Delivered'
    if (updateOrderDto.status === 'Delivered' && order.status !== 'Delivered') {
      updateOrderDto.invoiceNumber = this.generateInvoiceNumber();
    }

    Object.assign(order, updateOrderDto);
    return this.ordersRepository.save(order);
  }

  async generateInvoice(id: number, userId: number) {
    const order = await this.findOne(id, userId);
    
    if (order.status !== 'Delivered') {
      throw new Error('Can only generate invoice for delivered orders');
    }

    // In a real application, this would generate a PDF invoice
    // For now, we'll return the order details
    return {
      invoiceNumber: order.invoiceNumber || this.generateInvoiceNumber(),
      orderDetails: order,
      total: order.amount,
      tax: order.amount * 0.1, // 10% tax
      grandTotal: order.amount * 1.1,
    };
  }

  private generateTrackingNumber(): string {
    return `TRK${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
  }

  private generateInvoiceNumber(): string {
    return `INV${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
  }
} 