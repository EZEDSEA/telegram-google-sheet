import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { UserDto } from '../dto/user.dto';
import { UsersEntity } from '../entities/users.entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async register(data) {
    const check = await this.usersRepository.findOne({
      where: { username: data.username },
    });
    if (!check) {
      const res = this.usersRepository.create(data);
      return await this.usersRepository.save(res);
    } else {
      return await this.usersRepository.save({ ...check, ...data });
    }
  }

  async notFound(ctx: any) {
    await ctx.reply(
      'Вас нет в базе. Для начала работы зарегистрируйтесь. Для регистрации введите /start',
    );
  }

  async getUserByTelegramId(
    telegramId: string,
    ctx: any,
    options?: FindOneOptions<UsersEntity>,
  ) {
    const user = await this.usersRepository.findOne({
      where: { telegramId: telegramId.toString() },
      ...options,
    });
    if (!user) await this.notFound(ctx);
    return user;
  }

  async getUserById(id: string) {
    return await this.usersRepository.findOne(id);
  }

  async getUserByUsername(username: string) {
    return await this.usersRepository.findOne({ where: { username } });
  }

  async save(data) {
    return await this.usersRepository.save(data);
  }
}
