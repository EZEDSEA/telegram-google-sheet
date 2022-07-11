import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { UsersService } from 'src/users/services/users.service';
import { Scenes } from 'telegraf';
import { format } from 'date-fns';
import { CURRS, SOURCE } from '../../common/constants';
import { SheetsService } from '../../sheets/services/sheets.service';
import { dataDto } from '../../sheets/dto/data.dto';

@Wizard('add-row')
export class AddRowWizard {
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
    await ctx.reply(`Какая сумма? Для отмены введите /exit`, {
      reply_markup: { remove_keyboard: true },
    });
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    const text = result.message.text.trim();
    if (text === '/exit') {
      try {
        await ctx.scene.leave();
        return;
      } catch (e) {}
    }

    if (!/^\-?\d+$/.test(text)) {
      await ctx.reply('Введите число');
      ctx.wizard.selectStep(1);
      return;
    }
    (ctx as any).session.amount = Number(text);
    const keyboard = [
      CURRS.map((e) => {
        return { text: e };
      }),
    ];
    await ctx.reply(`Какая валюта?`, {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    ctx.wizard.next();
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    const text = result.message.text.toUpperCase();
    if (!CURRS.includes(text)) {
      await ctx.reply(`Валюта не принадлежит списку - ${CURRS}`);
      await ctx.wizard.selectStep(2);
    } else {
      (ctx as any).session.currency = text;
      await ctx.reply('№ сделки?', {
        reply_markup: { remove_keyboard: true, one_time_keyboard: true },
      });
      ctx.wizard.next();
    }
  }

  @WizardStep(4)
  async step4(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    const text = result.message.text.toUpperCase();
    (ctx as any).session.id = text;
    await ctx.reply('Номенклатура прихода/расхода');
    await ctx.wizard.next();
  }

  @WizardStep(5)
  async step5(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    (ctx as any).session.nomen = result.message.text;
    await ctx.reply('Контрагент');
    await ctx.wizard.next();
  }

  @WizardStep(6)
  async step6(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    (ctx as any).session.contrAgent = result.message.text;
    const keyB = [];
    for (let i = 0; i < Math.floor(SOURCE.length / 3); i++) {
      keyB.push(SOURCE.slice(i, i + 3));
    }
    const keyboard = keyB.map((curr) => {
      return curr.map((e) => {
        return { text: e };
      });
    });
    await ctx.reply('Источник?', {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    await ctx.wizard.next();
  }

  @WizardStep(7)
  async step7(@Context() ctx: Scenes.WizardContext) {
    const result = ctx.update as unknown as { message: { text: string } };
    const text = result.message.text;
    if (!SOURCE.includes(text)) {
      await ctx.reply(`Источник не принадлежит списку - ${SOURCE}`);
      await ctx.wizard.selectStep(6);
    } else {
      (ctx as any).session.source = result.message.text;
      (ctx as any).session.date = format(Date.now(), 'dd.MM.yyyy');
      (ctx as any).session.fromTelegramId = (ctx as any).update.message.chat.id;
      await this.sheetsService.addRow(ctx);
      await ctx.reply('Данные внеслись!', {
        reply_markup: { remove_keyboard: true },
      });
      await ctx.scene.leave();
    }
  }
}
