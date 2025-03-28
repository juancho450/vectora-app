export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  description: string;
  date: Date;
  category?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  recipientInfo?: {
    accountId?: string;
    name?: string;
  };
}
