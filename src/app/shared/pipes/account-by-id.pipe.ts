import { Pipe, PipeTransform } from '@angular/core';
import { BankAccount } from '../interfaces/account.interface';

@Pipe({
  name: 'accountById',
  standalone: true
})
export class AccountByIdPipe implements PipeTransform {
  transform(accounts: BankAccount[], accountId: string): BankAccount | undefined {
    return accounts.find(account => account.id === accountId);
  }
}
