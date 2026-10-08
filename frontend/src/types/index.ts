export interface Transaction {
  id: number;
  amount: number;
  paymentDate: string;
  rrn?: string;
  accountLastFour?: string;
  transactionType: 'DEBIT' | 'CREDIT' | 'UNKNOWN';
  bankBalance?: number;
  bankName?: string;
  merchant?: string;
  upiId?: string;
  rawSmsId?: number;
  extractionConfidence: number;
  parserVersion?: string;
  validationStatus: string;
  createdAt?: string;
}

export interface FinancialSummary {
  totalSpent: number;
  totalReceived: number;
  netFlow: number;
  totalTransactions: number;
  totalRawSms: number;
}

export interface AccountSummary {
  accountLastFour: string;
  bankName: string;
  latestBalance?: number;
  totalSpent: number;
  totalReceived: number;
  netFlow: number;
  transactionCount: number;
  lastTransactionDate?: string;
}

export interface SpendingTrend {
  date: string;
  debit: number;
  credit: number;
}

export interface MerchantStat {
  merchant: string;
  count: number;
  totalAmount: number;
}

export interface BankStat {
  bankName: string;
  count: number;
  totalAmount: number;
}

export interface RawSms {
  id: number;
  sender: string;
  message: string;
  timestamp: number;
  processingStatus: string;
  processingError?: string;
  createdAt: string;
}

export interface AblationMetric {
  id: string;
  name: string;
  bandwidthReduction: string;
  macroF1: string;
  amountF1: string;
  merchantF1: string;
  status: 'baseline' | 'active' | 'optimal';
  description: string;
}
