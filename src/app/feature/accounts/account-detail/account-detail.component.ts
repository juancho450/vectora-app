import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountsStore } from '../../../shared/store/account.store';
import { TransactionsStore } from '../../../shared/store/transaction.store';
import { BankAccount } from '../../../shared/interfaces/account.interface';

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
  private router = inject(Router); // Asegúrate de inyectar el Router
  private accountsStore = inject(AccountsStore);
  private transactionsStore = inject(TransactionsStore);
  
  // Acceder a los signals
  account = this.accountsStore.selectedAccount;
  isLoading = this.accountsStore.isLoading;
  error = this.accountsStore.error;
  
  transactions = this.transactionsStore.filteredTransactions;
  transactionsLoading = this.transactionsStore.isLoading;
  transactionsError = this.transactionsStore.error;
  
  // Formulario para nueva transacción
  transactionForm: FormGroup = this.fb.group({
    type: ['DEPOSIT', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    description: ['', Validators.required],
    category: [''],
    recipientAccountId: ['']
  });
  
  showTransactionForm = false;
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const accountId = params['id'];
      
      if (accountId !== 'new') {
        this.accountsStore.selectAccount(accountId);
        this.transactionsStore.loadTransactions(accountId);
      }
    });
  }
  
  toggleTransactionForm(): void {
    this.showTransactionForm = !this.showTransactionForm;
  }
  
  submitTransaction(): void {
    if (this.transactionForm.invalid || !this.account()) return;
    
    const accountId = this.account()!.id;
    const formValue = this.transactionForm.value;
    
    // Crear nueva transacción
    this.transactionsStore.createTransaction({
      accountId,
      amount: formValue.amount,
      type: formValue.type,
      description: formValue.description,
      date: new Date(),
      category: formValue.category || undefined,
      status: 'COMPLETED',
      recipientInfo: formValue.type === 'TRANSFER' ? {
        accountId: formValue.recipientAccountId
      } : undefined
    });
    
    // Resetear formulario
    this.transactionForm.reset({
      type: 'DEPOSIT',
      amount: 0,
      description: '',
      category: '',
      recipientAccountId: ''
    });
    
    this.showTransactionForm = false;
  }

  deleteAccount(accountId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.')) {
      this.accountsStore.deleteAccount(accountId);
      
      // Simplemente navegar después de iniciar la eliminación
      this.router.navigate(['/dashboard/accounts']);
    }
  }
}
