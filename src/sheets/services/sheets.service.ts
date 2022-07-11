import { Injectable } from '@nestjs/common';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import * as assert from 'assert';
import { dataDto } from '../dto/data.dto';
import { UsersService } from '../../users/services/users.service';
import { Context } from 'telegraf';

@Injectable()
export class SheetsService {
  private readonly doc;

  constructor(private readonly usersService: UsersService) {
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
    const email = process.env.GOOGLE_SERVICE_ACCOUNT;
    const key = process.env.GOOGLE_PRIVATE_KEY;
    assert(!!email, 'No GOOGLE_SERVICE_ACCOUNT environment variable found');
    assert(!!email, 'No GOOGLE_PRIVATE_KEY environment variable found');
    (async () => {
      await doc.useServiceAccountAuth({
        client_email: email,
        private_key: key,
      });
      await doc.loadInfo();
    })();
    this.doc = doc;
  }

  async addRow(ctx: Context) {
    const data = (ctx as any).session;
    const user = await this.usersService.getUserByTelegramId(
      data.fromTelegramId,
      ctx,
      { select: ['firstname', 'surname', 'lastname'] },
    );
    const sheet = this.getSheetById(0);
    const resRow: Record<string, string> = {
      Дата: data.date,
      Сумма: data.amount > 0 ? `'\+${data.amount}` : data.amount.toString(),
      Валюта: data.currency,
      Сделка: data.id,
      Номенклатура: data.nomen,
      Контрагент: data.contrAgent,
    };
    resRow['Источник(откуда/куда)'] = data.source;
    resRow['Кто внес'] = `${user.surname} ${user.firstname} ${user.lastname}`;
    await sheet.addRow(resRow);
  }

  async deleteRow(ctx: Context, index: number) {
    index = index - 2;
    const sheet = this.getSheetById(0);
    const rows = await sheet.getRows({ offset: index, limit: 1 });
    if (rows[0]) {
      await rows[0].delete();
      return true;
    }
    return false;
  }

  getSheetById(id: number) {
    return this.doc.sheetsById[id];
  }
}
