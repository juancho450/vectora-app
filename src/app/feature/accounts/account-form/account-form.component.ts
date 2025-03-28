import { Component, OnInit, inject } from '@angular/core';
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
  
  // Acceder a los signals
  account = this.accountsStore.selectedAccount;
  isLoading = this.accountsStore.isLoading;
  error = this.accountsStore.error;
  
  accountForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    accountNumber: ['', [Validators.required]],
    accountType: ['CHECKING', [Validators.required]],
    balance: [0, [Validators.required, Validators.min(0)]],
  });
  
  isEditMode = false;
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const accountId = params['id'];
      
      if (accountId !== 'new') {
        this.isEditMode = true;
        this.accountsStore.selectAccount(accountId);
        
        if (this.account()) {
          this.accountForm.patchValue({
            name: this.account()!.name,
            accountNumber: this.account()!.accountNumber,
            accountType: this.account()!.accountType,
            balance: this.account()!.balance
          });
        }
      }
    });
  }
  
  onSubmit(): void {
    if (this.accountForm.invalid) return;
    
    const formValue = this.accountForm.value;
    
    if (this.isEditMode && this.account()) {
      // Actualizar cuenta existente
      this.accountsStore.updateAccount({
        ...this.account()!,
        name: formValue.name,
        accountNumber: formValue.accountNumber,
        accountType: formValue.accountType,
        balance: formValue.balance,
        lastUpdated: new Date()
      });
    } else {
      // Crear nueva cuenta
      this.accountsStore.createAccount({
        name: formValue.name,
        accountNumber: formValue.accountNumber,
        accountType: formValue.accountType,
        balance: formValue.balance,
        lastUpdated: new Date()
      });
    }
    
    // Navegar de vuelta a la lista de cuentas
    this.router.navigate(['/dashboard/accounts']);
  }
}
