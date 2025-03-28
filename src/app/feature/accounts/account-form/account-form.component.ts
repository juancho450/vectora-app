import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountsStore } from '../../../shared/store/account.store';
import { BankAccount } from '../../../shared/interfaces/account.interface';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.css']
})
export class AccountFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private accountsStore = inject(AccountsStore);
  
  account = this.accountsStore.selectedAccount;
  error = this.accountsStore.error;
  
  accountForm: FormGroup;
  isEditMode = false;
  private accountId: string | null = null;
  
  constructor() {
    effect(() => {
      const selectedAccount = this.account();
      
      if (this.accountForm && selectedAccount && this.isEditMode) {
        this.accountForm.patchValue({
          name: selectedAccount.name,
          accountNumber: selectedAccount.accountNumber,
          accountType: selectedAccount.accountType,
          balance: selectedAccount.balance
        });
      }
    });
  }
  
  ngOnInit(): void {
    this.createAccountForm();
    
    if (this.accountsStore.accounts().length === 0) {
      this.accountsStore.loadAccounts();
    }
    
    this.route.params.subscribe(params => {
      this.accountId = params['id'];
      
      if (this.accountId !== 'new' && this.accountId) {
        this.isEditMode = true;
        this.accountsStore.selectAccount(this.accountId);
      }
    });
  }
  
  onSubmit(): void {
    if (this.accountForm.invalid) return;
    
    const formValue = this.accountForm.value;
    
    if (this.isEditMode && this.account()) {
      this.accountsStore.updateAccount({
        ...this.account()!,
        name: formValue.name,
        accountNumber: formValue.accountNumber,
        accountType: formValue.accountType,
        balance: formValue.balance,
        lastUpdated: new Date()
      });
    } else {
      this.accountsStore.createAccount({
        name: formValue.name,
        accountNumber: formValue.accountNumber,
        accountType: formValue.accountType,
        balance: formValue.balance,
        lastUpdated: new Date()
      });
    }
    
    this.router.navigate(['/accounts']);
  }

  private createAccountForm(): void {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required]],
      accountNumber: ['', [Validators.required]],
      accountType: ['CHECKING', [Validators.required]],
      balance: [0, [Validators.required, Validators.min(0)]],
    });
  }
}
