import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountsStore } from '../../../shared/store/account.store';


@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit {
  private accountsStore = inject(AccountsStore);
  
  accounts = this.accountsStore.accounts;
  error = this.accountsStore.error;
  totalBalance = this.accountsStore.totalBalance;
  
  ngOnInit(): void {
    this.accountsStore.loadAccounts();
  }
  
  selectAccount(id: string): void {
    this.accountsStore.selectAccount(id);
  }
}
