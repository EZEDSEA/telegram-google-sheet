import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Scenes } from 'telegraf';
import { format } from 'date-fns';
import { CURRS, SOURCE } from '../../common/constants';
import { SheetsService } from '../../sheets/services/sheets.service';
import { dataDto } from '../../sheets/dto/data.dto';

@Wizard('delete-row')
export class DeleteRowWizard {
  constructor(
    private readonly usersService: UsersService,
    private readonly sheetsService: SheetsService,
  ) {}

  async deleteMessage(ctx) {
    try {
      await ctx.deleteMessage();
      await ctx.deleteMessage();
    } catch (e) {}
  }

  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    await ctx.reply(`Какая индекс? Для отмены введите /exit`, {
      reply_markup: { remove_keyboard: true },
    });
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const answer = (ctx as any).update.callback_query?.data;
    if (answer) {
      await this.deleteMessage(ctx);
      switch (answer) {
        case 'yes':
          const res = await this.sheetsService.deleteRow(
            ctx,
            (ctx as any).session.index,
          );
          if (res) {
            await ctx.reply(`Строка ${(ctx as any).session.index} удалена`);
            ctx.scene.leave();
          } else {
            await ctx.reply(
              `Такой строки нет. Введите существующую или напишите /exit`,
            );
            ctx.wizard.selectStep(1);
          }
          break;
        case 'no':
          await ctx.reply('Введите индекс');
          ctx.wizard.selectStep(1);
          break;
      }
      return;
    }

    const result = ctx.update as unknown as { message: { text: string } };
    const text = result.message.text.trim();
    if (text === '/exit') {
      try {
        await ctx.scene.leave();
        return;
      } catch (e) {}
    }

    if (!/^-?\d+$/.test(text) || Number(text) < 1) {
      await ctx.reply('Введите число, от 2');
      ctx.wizard.selectStep(1);
      return;
    }
    (ctx as any).session.index = Number(text);
    await ctx.reply(
      `Вы уверены, что хотите удалить строку - ${(ctx as any).session.index}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Да', callback_data: 'yes' },
              { text: 'Нет', callback_data: 'no' },
            ],
          ],
        },
      },
    );
  }
}
