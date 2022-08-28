import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const user = await this.insertUsers();
    await this.insertNewProducts(user);
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();
    const queryBulder = await this.userRepository.createQueryBuilder();
    await queryBulder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach((user) => {
      const { password, ...data } = user;
      users.push(
        this.userRepository.create({
          ...data,
          password: bcrypt.hashSync(password, 10),
        }),
      );
    });
    const usersDb = await this.userRepository.save(users);

    return usersDb[0];
  }

  private async insertNewProducts(user: User) {
    this.productService.deleteAllProducts();
    const products = initialData.products;
    const insertPromises = [];
    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user));
    });
    await Promise.all(insertPromises);
    return true;
  }
}
