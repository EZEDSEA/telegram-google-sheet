import { Injectable } from '@nestjs/common';
import { UsersEntity } from 'src/users/entities/users.entities';
import { UsersService } from 'src/users/services/users.service';
import { Context } from 'telegraf';
import { Context as Ctx } from 'vm';

@Injectable()
export class TelegramMainService {
  constructor(private readonly usersService: UsersService) {}

  async sendKeyboard(ctx: Context, id: string) {
    (ctx as any).session = undefined;
    const user = await this.usersService.getUserByTelegramId(id, ctx);
    if (!user) return;
    if (!user.telegramId) {
      user.telegramId = id.toString();
      await this.usersService.save(user);
    }
    await this.clientKeyboard(ctx);
  }

  async clientKeyboard(ctx: Context) {
    await ctx.reply('Меню клиента', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Обмены',
              callback_data: 'exchange-(menu)',
            },
          ],
          [
            {
              text: 'Фиатные и крипто перестановки',
              callback_data: 'foreign',
            },
          ],
        ],
      },
    });
  }
}
