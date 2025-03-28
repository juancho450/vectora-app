import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TransactionsStore } from '../../../shared/store/transaction.store';
import { AccountsStore } from '../../../shared/store/account.store';
import { AccountByIdPipe } from '../../../shared/pipes/account-by-id.pipe';
import { Transaction } from '../../../shared/interfaces/transaction.interface';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.css']
})
export class TransactionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private transactionsStore = inject(TransactionsStore);
  private accountsStore = inject(AccountsStore);
  
  transaction: Transaction | null = null;
  private transactionId: string | null = null;
  private errorMessage: string | null = null;
  
  transactions = this.transactionsStore.transactions;
  accounts = this.accountsStore.accounts;
  error = this.transactionsStore.error;
  
  constructor() {
    effect(() => {
      this.transactionId = this.route.snapshot.params['id'];
      
      if (this.transactions().length > 0 && this.transactionId) {
        this.loadTransaction();
      }
    });
  }
  
  ngOnInit(): void {
    if (this.transactions().length === 0) {
      this.transactionsStore.loadTransactions(undefined);
    }
    
    if (this.accounts().length === 0) {
      this.accountsStore.loadAccounts();
    }
  }
  
  private loadTransaction(): void {
    if (!this.transactionId) return;
    
    const foundTransaction = this.transactions().find(tx => tx.id === this.transactionId);
    
    if (foundTransaction) {
      this.transaction = foundTransaction;
      this.errorMessage = null;
    } else {
      this.errorMessage = 'Transacción no encontrada';
      this.transaction = null;
    }
  }
  
  getTransactionTypeColor(type: string | undefined): string {
    switch (type) {
      case 'DEPOSIT':
        return 'bg-green-100 text-green-800';
      case 'WITHDRAWAL':
        return 'bg-red-100 text-red-800';
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  getAmountColor(type: string | undefined): string {
    switch (type) {
      case 'DEPOSIT':
        return 'text-green-600';
      case 'WITHDRAWAL':
      case 'TRANSFER':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
  
  getTransactionTypeLabel(type: string | undefined): string {
    switch (type) {
      case 'DEPOSIT':
        return 'Depósito';
      case 'WITHDRAWAL':
        return 'Retiro';
      case 'TRANSFER':
        return 'Transferencia';
      default:
        return type || '';
    }
  }
  
  getAmountPrefix(type: string | undefined): string {
    switch (type) {
      case 'DEPOSIT':
        return '+';
      case 'WITHDRAWAL':
      case 'TRANSFER':
        return '-';
      default:
        return '';
    }
  }
  
  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'COMPLETED':
        return 'Completada';
      case 'PENDING':
        return 'Pendiente';
      case 'FAILED':
        return 'Fallida';
      default:
        return status || '';
    }
  }
  
  getAccountById(id: string | undefined): any {
    if (!id) return null;
    return this.accounts().find(account => account.id === id);
  }
} 