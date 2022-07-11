import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { SheetsService } from '../../sheets/services/sheets.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class TelegramClientService {
  constructor(
    private readonly userService: UsersService,
    private readonly sheetsService: SheetsService,
  ) {}

  async checkRole(array, role, ctx) {
    if (!array.includes(role)) {
      await ctx.reply('У вас нет прав на данное действие');
      return false;
    }
    return true;
  }

  async message(ctx: Context) {
    const result = (ctx as any).update.message.text;
    const from = (ctx as any).update.message.chat.id;
    const user = await this.userService.getUserByTelegramId(from, ctx);
    if (!user) return await ctx.reply('Вас нет в базе. Отправьте /start');
    switch (result) {
      case '/addrow': {
        const check = await this.checkRole(
          ['EMPLOYEE', 'ADMIN'],
          user.role,
          ctx,
        );
        if (check) {
          await this.addRow(ctx);
        }
        return;
      }
      case '/beadmin': {
        await (ctx as any).scene.enter('make-admin');
        break;
      }
      case '/deleterow': {
        const check = await this.checkRole(['ADMIN'], user.role, ctx);
        if (check) {
          await this.deleteRow(ctx);
        }
        return;
      }
      case '/addemployee': {
        const check = await this.checkRole(['ADMIN'], user.role, ctx);
        if (check) {
          await this.addEmployee(ctx, 'empl');
        }
        return;
      }
      case '/deleteemployee': {
        const check = await this.checkRole(['ADMIN'], user.role, ctx);
        if (check) {
          await this.addEmployee(ctx, 'user');
        }
        return;
      }

      case '/adddir': {
        const check = await this.checkRole(['ADMIN'], user.role, ctx);
        if (check) {
          await this.addEmployee(ctx, 'dir');
        }
        return;
      }
    }
  }

  async deleteRow(ctx: Context) {
    const cntx = ctx as any;
    await cntx.scene.enter('delete-row');
  }

  async addEmployee(ctx: Context, add: string) {
    const cntx = ctx as any;
    cntx.session.add = add;
    await cntx.scene.enter('add-employee');
  }

  async addRow(ctx: Context) {
    const cntx = ctx as any;
    await cntx.scene.enter('add-row');
  }
}
