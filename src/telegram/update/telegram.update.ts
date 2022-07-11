import { Action, Hears, On, Start, Update } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Context } from 'telegraf';
import { TelegramClientService } from '../services/telegram-client.service';
import { TelegramMainService } from '../services/telegram-main.service';

@Update()
export class TelegramUpdate {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramMainService: TelegramMainService,
    private readonly telegramClientService: TelegramClientService,
  ) {}

  @Start()
  async startCommand(ctx: any) {
    const { id, username } = ctx.update.message.from;
    const user = await this.usersService.getUserByUsername(username);
    if (!user || !user.username) {
      await (ctx as any).scene.enter('register');
    }
  }

  @On('message')
  async message(ctx: Context) {
    await this.telegramClientService.message(ctx);
  }
}
