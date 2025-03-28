import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountsStore } from '../../../shared/store/account.store';
import { TransactionsStore } from '../../../shared/store/transaction.store';
import { BankAccount } from '../../../shared/interfaces/account.interface';

@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer-form.component.html',
  styleUrls: ['./transfer-form.component.css']
})
export class TransferFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private accountsStore = inject(AccountsStore);
  private transactionsStore = inject(TransactionsStore);

  accounts = this.accountsStore.accounts;
  
  transferForm: FormGroup;
  
  sourceAccount: BankAccount | null = null;
  showConfirmation = false;
  errorMessage = '';
  
  ngOnInit(): void {
    this.createTransferForm();

    if (this.accounts().length === 0) {
      this.accountsStore.loadAccounts();
    }
    
    this.transferForm.get('sourceAccountId')?.valueChanges.subscribe(accountId => {
      if (accountId) {
        this.sourceAccount = this.accounts().find(acc => acc.id === accountId) || null;
        
        if (this.sourceAccount) {
          this.transferForm.get('amount')?.setValidators([
            Validators.required,
            Validators.min(0.01),
            Validators.max(this.sourceAccount.balance)
          ]);
          this.transferForm.get('amount')?.updateValueAndValidity();
        }
      } else {
        this.sourceAccount = null;
      }
    });
    
  }

  confirmTransfer(): void {
    if (this.transferForm.invalid) return;

    if (this.errorMessage) return;
    
    this.showConfirmation = true;
  }
  
  cancelTransfer(): void {
    this.showConfirmation = false;
  }
  
  processTransfer(): void {
    if (this.transferForm.invalid) return;
    
    const formValue = this.transferForm.value;
    const sourceAccount = this.accounts().find(acc => acc.id === formValue.sourceAccountId);
    const destinationAccount = this.accounts().find(acc => acc.id === formValue.destinationAccountId);
    
    if (!sourceAccount || !destinationAccount) {
      this.errorMessage = 'Cuenta de origen o destino no encontrada';
      return;
    }
    
    this.transactionsStore.createTransaction({
      accountId: formValue.sourceAccountId,
      amount: formValue.amount,
      type: 'TRANSFER',
      description: formValue.description,
      date: new Date(),
      category: 'Transferencias',
      status: 'COMPLETED',
      recipientInfo: {
        accountId: formValue.destinationAccountId,
        name: destinationAccount.name
      }
    });
    
    this.accountsStore.updateAccount({
      ...sourceAccount,
      balance: sourceAccount.balance - formValue.amount,
      lastUpdated: new Date()
    });
    
    this.accountsStore.updateAccount({
      ...destinationAccount,
      balance: destinationAccount.balance + formValue.amount,
      lastUpdated: new Date()
    });
    
    this.router.navigate(['/accounts']);
  }
  
  get availableDestinationAccounts() {
    const sourceId = this.transferForm.get('sourceAccountId')?.value;
    return this.accounts().filter(account => account.id !== sourceId);
  }
  
  getAccountById(id: string | undefined): any {
    if (!id) return null;
    return this.accounts().find(account => account.id === id);
  }

  private createTransferForm(): void {
    this.transferForm = this.fb.group({
      sourceAccountId: ['', Validators.required],
      destinationAccountId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });
  }
} 