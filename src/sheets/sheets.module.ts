import { Module } from '@nestjs/common';
import { SheetsService } from './services/sheets.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [SheetsService],
  exports: [SheetsService],
})
export class SheetsModule {}
