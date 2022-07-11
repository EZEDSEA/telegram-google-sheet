import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Scenes } from 'telegraf';
import { RoleEnum } from '../../users/enums/Role.enum';

@Wizard('make-admin')
export class MakeAdminWizard {
  constructor(private readonly usersService: UsersService) {}

  async deleteMessage(ctx) {
    try {
      await ctx.deleteMessage();
    } catch (e) {}
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    await ctx.reply(`Введите secret_key. Для выхода отправьте /exit`, {
      reply_markup: { remove_keyboard: true },
    });
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    const key = result.message.text.trim();
    if (key === '/exit') {
      ctx.scene.leave();
      return;
    }

    if (key === process.env.SECRET_KEY) {
      const { username } = (ctx as any).update.message.from;
      await this.usersService.register({
        username: username,
        role: RoleEnum.ADMIN,
      });
      await ctx.reply('Вы админ!');
      ctx.scene.leave();
      return;
    }
    await ctx.reply('Неправильный пароль');
    ctx.scene.leave();
    return;
  }
}
