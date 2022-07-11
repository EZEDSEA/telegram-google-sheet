import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { config } from './common/config';
import { TelegramModule } from './telegram/telegram.module';
import { UsersModule } from './users/users.module';
import { AddRowWizard } from './telegram/wizards/addRow.wizard';
import { SheetsModule } from './sheets/sheets.module';
import { RegisterWizard } from './telegram/wizards/register.wizard';
import { AddEmployeeWizard } from './telegram/wizards/addEmployee.wizard';
import { DeleteRowWizard } from './telegram/wizards/deleteRow.wizard';
import { MakeAdminWizard } from './telegram/wizards/makeAdmin.wizard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => config.getDatabaseOptions(),
    }),
    TelegramModule,
    TelegrafModule.forRootAsync({
      useFactory: () => {
        return {
          token: config.telegramToken(),
          middlewares: [session()],
        };
      },
    }),
    UsersModule,
    SheetsModule,
  ],
  providers: [
    AddRowWizard,
    RegisterWizard,
    AddEmployeeWizard,
    DeleteRowWizard,
    MakeAdminWizard,
  ],
})
export class AppModule {}
