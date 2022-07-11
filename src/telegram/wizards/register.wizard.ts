import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Scenes } from 'telegraf';

@Wizard('register')
export class RegisterWizard {
  constructor(private readonly usersService: UsersService) {}

  async deleteMessage(ctx) {
    try {
      await ctx.deleteMessage();
    } catch (e) {}
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    const { username, id } = (ctx as any).update.message.from;
    if (!username) {
      await ctx.reply(
        'У вас отстутсвует username в аккаунте. Для добавления перейдите в настройки-изменить профиль и измениете username',
      );
      ctx.scene.leave();
      return;
    }
    (ctx as any).session.username = username;
    (ctx as any).session.telegramId = id.toString();
    await ctx.reply(`Введите ваше имя`, {
      reply_markup: { remove_keyboard: true },
    });
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    (ctx as any).session.firstname = result.message.text.trim();
    await ctx.reply(`Введите вашу фамилию`);
    ctx.wizard.next();
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    (ctx as any).session.surname = result.message.text.trim();
    await ctx.reply(`Введите ваше отчество`);
    ctx.wizard.next();
  }

  @WizardStep(4)
  async step4(@Context() ctx: Scenes.WizardContext) {
    const answer = (ctx as any).update.callback_query?.data;
    if (answer) {
      await this.deleteMessage(ctx);
      switch (answer) {
        case 'yes':
          await this.usersService.register((ctx as any).session);
          await ctx.reply(`Приветсвую ${(ctx as any).session.firstname}`);
          ctx.scene.leave();
          break;
        case 'no':
          await ctx.reply('Введите ваше имя');
          ctx.wizard.selectStep(1);
          break;
      }
      return;
    }

    const result = ctx.update as unknown as { message: { text: string } };
    (ctx as any).session.lastname = result.message.text.trim();
    const wholeName = `${(ctx as any).session.surname} ${
      (ctx as any).session.firstname
    } ${(ctx as any).session.lastname}`;
    await ctx.reply(`Вас зовут - ${wholeName}, верно?`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Да', callback_data: 'yes' },
            {
              text: 'Нет',
              callback_data: 'no',
            },
          ],
        ],
      },
    });
  }
}
