import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TransactionsStore } from '../../../shared/store/transaction.store';
import { AccountsStore } from '../../../shared/store/account.store';
import { Transaction } from '../../../shared/interfaces/transaction.interface';
import { AccountByIdPipe } from '../../../shared/pipes/account-by-id.pipe';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AccountByIdPipe],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  private transactionsStore = inject(TransactionsStore);
  private accountsStore = inject(AccountsStore);
  private fb = inject(FormBuilder);
  
  transactions = this.transactionsStore.transactions;
  accounts = this.accountsStore.accounts;
  error = this.transactionsStore.error;
  
  filterForm: FormGroup;
  
  filteredTransactions: Transaction[] = [];
  
  constructor() {
    effect(() => {
      const currentTransactions = this.transactions();
      
      if (!this.hasFiltersApplied()) {
        this.filteredTransactions = [...currentTransactions];
      } else {
        this.applyFilters();
      }
    });
  }
  
  ngOnInit(): void {
    this.createFilterForm();

    if (this.transactions().length === 0) {
      this.transactionsStore.loadTransactions(undefined);
    }
    
    if (this.accounts().length === 0) {
      this.accountsStore.loadAccounts();
    }
    
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  private hasFiltersApplied(): boolean {
    if (!this.filterForm) return false;
    return !!this.filterForm.value.accountId || !!this.filterForm.value.transactionType;
  }
  
  applyFilters(): void {
    if (!this.filterForm) return;
    
    const { accountId, transactionType } = this.filterForm.value;
    
    let filtered = this.transactions();
    
    if (accountId) {
      filtered = filtered.filter(tx => tx.accountId === accountId);
    }
    
    if (transactionType) {
      filtered = filtered.filter(tx => tx.type === transactionType);
    }
    
    this.filteredTransactions = filtered;
  }
  
  clearFilters(): void {
    this.filterForm.reset({
      accountId: '',
      transactionType: ''
    });
    this.filteredTransactions = this.transactions();
  }
  
  getTransactionTypeColor(type: string): string {
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
  
  getAmountColor(type: string): string {
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
  
  getTransactionTypeLabel(type: string): string {
    switch (type) {
      case 'DEPOSIT':
        return 'Depósito';
      case 'WITHDRAWAL':
        return 'Retiro';
      case 'TRANSFER':
        return 'Transferencia';
      default:
        return type;
    }
  }
  
  getAmountPrefix(type: string): string {
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

  private createFilterForm(): void {
    this.filterForm = this.fb.group({
      accountId: [''],
      transactionType: ['']
    });
  }
} 