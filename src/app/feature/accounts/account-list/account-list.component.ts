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
  
  // Acceder a los signals
  accounts = this.accountsStore.accounts;
  isLoading = this.accountsStore.isLoading;
  error = this.accountsStore.error;
  totalBalance = this.accountsStore.totalBalance;
  
  ngOnInit(): void {
    // Cargar las cuentas al inicializar el componente
    this.accountsStore.loadAccounts();
  }
  
  selectAccount(id: string): void {
    this.accountsStore.selectAccount(id);
  }
}
