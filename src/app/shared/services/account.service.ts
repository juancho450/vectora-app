import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAccount } from '../interfaces/account.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private apiUrl = environment.apiUrl + '/accounts'; // Ajusta según tu API

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(this.apiUrl);
  }

  getAccountById(id: string): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.apiUrl}/${id}`);
  }

  createAccount(account: Omit<BankAccount, 'id'>): Observable<BankAccount> {
    return this.http.post<BankAccount>(this.apiUrl, account);
  }

  updateAccount(account: BankAccount): Observable<BankAccount> {
    return this.http.put<BankAccount>(`${this.apiUrl}/${account.id}`, account);
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
