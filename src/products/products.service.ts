import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Order } from '../orders/order.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async create(createProductDto: CreateProductDto, sellerId: number) {
    const product = this.productsRepository.create({
      ...createProductDto,
      seller: { id: sellerId },
    });
    return await this.productsRepository.save(product);
  }

  async findAll(sellerId: number) {
    return await this.productsRepository.find({
      where: { seller: { id: sellerId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, sellerId: number) {
    const product = await this.productsRepository.findOne({
      where: { id, seller: { id: sellerId } },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, sellerId: number) {
    const product = await this.findOne(id, sellerId);
    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: number, sellerId: number) {
    const product = await this.findOne(id, sellerId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    // Check if there are any orders associated with this product
    const existingOrders = await this.ordersRepository.count({
      where: { product: { id: product.id } }
    });
    
    if (existingOrders > 0) {
      throw new BadRequestException(
        'Cannot delete this product because it has associated orders. Consider deactivating it instead.'
      );
    }
    
    const result = await this.productsRepository.delete({ 
      id: product.id, 
      seller: { id: sellerId } 
    });
    
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found or already deleted`);
    }
    
    return { message: 'Product deleted successfully' };
  }

  async updateStock(id: number, quantity: number, sellerId: number) {
    const product = await this.findOne(id, sellerId);
    product.stock = quantity;
    return await this.productsRepository.save(product);
  }

  async setDiscount(id: number, discountPrice: number, sellerId: number) {
    const product = await this.findOne(id, sellerId);
    product.discountPrice = discountPrice;
    return await this.productsRepository.save(product);
  }

  async toggleActive(id: number, sellerId: number) {
    const product = await this.findOne(id, sellerId);
    product.isActive = !product.isActive;
    return await this.productsRepository.save(product);
  }
} 