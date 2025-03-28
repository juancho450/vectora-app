import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountsStore } from '../../../shared/store/account.store';
import { TransactionsStore } from '../../../shared/store/transaction.store';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.css']
})
export class AccountDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private accountsStore = inject(AccountsStore);
  private transactionsStore = inject(TransactionsStore);
  
  account = this.accountsStore.selectedAccount;
  error = this.accountsStore.error;
  
  transactions = this.transactionsStore.filteredTransactions;
  
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const accountId = params['id'];

      if (accountId !== 'new') {
        this.accountsStore.loadAccountById(accountId);
        this.accountsStore.selectAccount(accountId);
        this.transactionsStore.loadTransactions(accountId);
      }
    });
  }
  

  deleteAccount(accountId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.')) {
      this.accountsStore.deleteAccount(accountId);
      
      this.router.navigate(['/accounts']);
    }
  }
}
