import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountsStore } from '../../shared/store/account.store';
import { TransactionsStore } from '../../shared/store/transaction.store';
import { AccountByIdPipe } from '../../shared/pipes/account-by-id.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AccountByIdPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private accountsStore = inject(AccountsStore);
  private transactionsStore = inject(TransactionsStore);
  
  // Acceder a los signals
  accounts = this.accountsStore.accounts;
  totalBalance = this.accountsStore.totalBalance;
  transactions = this.transactionsStore.transactions;
  
  isLoading = this.accountsStore.isLoading;
  error = this.accountsStore.error;
  
  ngOnInit(): void {
    // Cargar las cuentas y transacciones recientes
    this.accountsStore.loadAccounts();
    this.transactionsStore.loadTransactions(undefined); // Todas las transacciones sin filtro
  }
  
  // Obtener las 5 transacciones más recientes
  get recentTransactions() {
    return this.transactions().slice(0, 5);
  }
}
