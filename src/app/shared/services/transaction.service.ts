import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../interfaces/transaction.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private apiUrl = environment.apiUrl + '/transactions'; // Ajusta según tu API

  constructor(private http: HttpClient) {}

  getTransactions(accountId?: string): Observable<Transaction[]> {
    let url = this.apiUrl;
    if (accountId) {
      url += `?accountId=${accountId}`;
    }
    return this.http.get<Transaction[]>(url);
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  createTransaction(transaction: Omit<Transaction, 'id'>): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  updateTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${transaction.id}`, transaction);
  }
}
