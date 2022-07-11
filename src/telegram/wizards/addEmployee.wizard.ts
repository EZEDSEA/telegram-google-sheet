import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Scenes } from 'telegraf';
import { RoleEnum } from '../../users/enums/Role.enum';

@Wizard('add-employee')
export class AddEmployeeWizard {
  constructor(private readonly usersService: UsersService) {}

  async deleteMessage(ctx) {
    try {
      await ctx.deleteMessage();
    } catch (e) {}
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    await ctx.reply(
      `Введите username пользователя. Для выхода отправьте /exit`,
      {
        reply_markup: { remove_keyboard: true },
      },
    );
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const answer = (ctx as any).update.callback_query?.data;
    if (answer) {
      await this.deleteMessage(ctx);
      let role;
      let text;
      switch ((ctx as any).session.add) {
        case 'user':
          text = `${(ctx as any).session.username} добавлен как работник`;
          role = RoleEnum.EMPLOYEE;
          break;
        case 'empl':
          text = `${(ctx as any).session.username} теперь пользователь`;
          role = RoleEnum.USER;
          break;
        case 'dir':
          text = `${(ctx as any).session.username} теперь директор`;
          role = RoleEnum.ADMIN;
          break;
      }
      switch (answer) {
        case 'yes':
          await this.usersService.register({
            username: (ctx as any).session.username.slice(1),
            role,
          });
          await ctx.reply(text);
          ctx.scene.leave();
          break;
        case 'no':
          await ctx.reply('Введите username пользователя');
          ctx.wizard.selectStep(1);
          break;
      }
      return;
    }

    const result = ctx.update as unknown as { message: { text: string } };
    let username = result.message.text.trim();
    if (username === '/exit') {
      ctx.scene.leave();
      return;
    }
    if (!username.startsWith('@')) {
      username = '@' + username;
    }

    (ctx as any).session.username = username;
    let element;
    switch ((ctx as any).session.add) {
      case 'user':
        element = 'понизить';
        break;
      case 'empl':
        element = 'добавить';
        break;
      case 'dir':
        element = 'повысить';
        break;
    }
    await ctx.reply(
      `Вы хотите ${element} - ${(ctx as any).session.username}, верно?`,
      {
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
      },
    );
  }
}
