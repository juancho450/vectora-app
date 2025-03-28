export interface BankAccount {
  id: string;
  accountNumber: string;
  accountType: 'CORRIENTE' | 'AHORROS' | 'CREDITO';
  balance: number;
  name: string;
  lastUpdated: Date;
}
