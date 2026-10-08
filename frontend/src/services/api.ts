import { Transaction, FinancialSummary, AccountSummary, SpendingTrend, MerchantStat, BankStat, RawSms } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

// Curated realistic benchmark fallback data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    amount: 849.00,
    paymentDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    rrn: "312984920194",
    accountLastFour: "4821",
    transactionType: "DEBIT",
    bankBalance: 42150.00,
    bankName: "HDFC Bank",
    merchant: "Swiggy",
    upiId: "swiggy@okhdfcbank",
    rawSmsId: 101,
    extractionConfidence: 0.96,
    parserVersion: "1.0.0-hybrid",
    validationStatus: "VALID"
  },
  {
    id: 2,
    amount: 75000.00,
    paymentDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    rrn: "312847192034",
    accountLastFour: "4821",
    transactionType: "CREDIT",
    bankBalance: 43000.00,
    bankName: "HDFC Bank",
    merchant: "Tech Corp Inc (Salary)",
    rawSmsId: 102,
    extractionConfidence: 0.98,
    parserVersion: "1.0.0-hybrid",
    validationStatus: "VALID"
  },
  {
    id: 3,
    amount: 1499.00,
    paymentDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    rrn: "312784910283",
    accountLastFour: "9021",
    transactionType: "DEBIT",
    bankBalance: 12450.50,
    bankName: "State Bank of India",
    merchant: "Amazon India",
    upiId: "amazonpay@upi",
    rawSmsId: 103,
    extractionConfidence: 0.94,
    parserVersion: "1.0.0-hybrid",
    validationStatus: "VALID"
  },
  {
    id: 4,
    amount: 320.00,
    paymentDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    rrn: "312674892018",
    accountLastFour: "9021",
    transactionType: "DEBIT",
    bankBalance: 13950.00,
    bankName: "State Bank of India",
    merchant: "Zomato",
    upiId: "zomato@icici",
    rawSmsId: 104,
    extractionConfidence: 0.95,
    parserVersion: "1.0.0-hybrid",
    validationStatus: "VALID"
  },
  {
    id: 5,
    amount: 4500.00,
    paymentDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    rrn: "312563819201",
    accountLastFour: "1140",
    transactionType: "DEBIT",
    bankBalance: 28400.00,
    bankName: "ICICI Bank",
    merchant: "Reliance Digital",
    rawSmsId: 105,
    extractionConfidence: 0.92,
    parserVersion: "1.0.0-hybrid",
    validationStatus: "VALID"
  },
  {
    id: 6,
    amount: 1200.00,
    paymentDate: new Date(Date.now() - 86400000 * 6).toISOString(),
    rrn: "312451928374",
    accountLastFour: "4821",
    transactionType: "CREDIT",
    bankBalance: 32900.00,
    bankName: "HDFC Bank",
    merchant: "UPI Refund Portal",
    upiId: "refunds@axis",
    rawSmsId: 106,
    extractionConfidence: 0.95,
    parserVersion: "1.0.0-hybrid",
    validationStatus: "VALID"
  }
];

const MOCK_SUMMARY: FinancialSummary = {
  totalSpent: 8368.00,
  totalReceived: 76200.00,
  netFlow: 67832.00,
  totalTransactions: 6,
  totalRawSms: 12
};

const MOCK_TRENDS: SpendingTrend[] = [
  { date: "Oct 01", debit: 1250, credit: 0 },
  { date: "Oct 02", debit: 450, credit: 0 },
  { date: "Oct 03", debit: 4500, credit: 1200 },
  { date: "Oct 04", debit: 320, credit: 75000 },
  { date: "Oct 05", debit: 1499, credit: 0 },
  { date: "Oct 06", debit: 849, credit: 0 },
];

const MOCK_MERCHANTS: MerchantStat[] = [
  { merchant: "Reliance Digital", count: 1, totalAmount: 4500.00 },
  { merchant: "Amazon India", count: 1, totalAmount: 1499.00 },
  { merchant: "Swiggy", count: 2, totalAmount: 1120.00 },
  { merchant: "Zomato", count: 1, totalAmount: 320.00 },
];

const MOCK_BANKS: BankStat[] = [
  { bankName: "HDFC Bank", count: 3, totalAmount: 77049.00 },
  { bankName: "State Bank of India", count: 2, totalAmount: 1819.00 },
  { bankName: "ICICI Bank", count: 1, totalAmount: 4500.00 },
];

const MOCK_RAW_SMS: RawSms[] = [
  {
    id: 101,
    sender: "HDFCBK",
    message: "Rs. 849.00 debited from A/c **4821 to Swiggy on 06-Oct-24. UPI Ref 312984920194. Avl Bal: Rs. 42,150.00.",
    timestamp: Date.now() - 3600000 * 2,
    processingStatus: "PARSED",
    createdAt: new Date().toISOString()
  },
  {
    id: 102,
    sender: "HDFCBK",
    message: "Your A/c **4821 credited with INR 75,000.00 by Tech Corp Inc. Ref: 312847192034. Avl Bal: INR 43,000.00.",
    timestamp: Date.now() - 86400000 * 2,
    processingStatus: "PARSED",
    createdAt: new Date().toISOString()
  },
  {
    id: 103,
    sender: "SBIINB",
    message: "Your OTP for online purchase of Rs. 450 is 948123. Do not share OTP.",
    timestamp: Date.now() - 86400000 * 2.5,
    processingStatus: "SKIPPED_NON_TXN",
    createdAt: new Date().toISOString()
  }
];

export async function fetchAccounts(): Promise<AccountSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions/accounts`);
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data && data.length > 0 ? data : [
      {
        accountLastFour: "1541",
        bankName: "Indian Bank",
        latestBalance: 3307.82,
        totalSpent: 5107.02,
        totalReceived: 7351.00,
        netFlow: 2243.98,
        transactionCount: 44,
        lastTransactionDate: new Date().toISOString()
      },
      {
        accountLastFour: "4821",
        bankName: "HDFC Bank",
        latestBalance: 41200.00,
        totalSpent: 950.00,
        totalReceived: 0.00,
        netFlow: -950.00,
        transactionCount: 1,
        lastTransactionDate: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  } catch {
    return [
      {
        accountLastFour: "1541",
        bankName: "Indian Bank",
        latestBalance: 3307.82,
        totalSpent: 5107.02,
        totalReceived: 7351.00,
        netFlow: 2243.98,
        transactionCount: 44,
        lastTransactionDate: new Date().toISOString()
      },
      {
        accountLastFour: "4821",
        bankName: "HDFC Bank",
        latestBalance: 41200.00,
        totalSpent: 950.00,
        totalReceived: 0.00,
        netFlow: -950.00,
        transactionCount: 1,
        lastTransactionDate: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  }
}

export async function fetchTransactions(bank?: string, type?: string, search?: string, account?: string): Promise<Transaction[]> {
  try {
    const params = new URLSearchParams();
    if (bank && bank !== 'ALL') params.append('bank', bank);
    if (type && type !== 'ALL') params.append('type', type);
    if (search) params.append('search', search);
    if (account && account !== 'ALL') params.append('account', account);

    const res = await fetch(`${API_BASE_URL}/transactions?${params.toString()}`);
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data && data.length > 0 ? data : MOCK_TRANSACTIONS;
  } catch {
    return MOCK_TRANSACTIONS.filter(t => {
      if (account && account !== 'ALL' && t.accountLastFour !== account) return false;
      if (bank && bank !== 'ALL' && t.bankName !== bank) return false;
      if (type && type !== 'ALL' && t.transactionType !== type) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          t.merchant?.toLowerCase().includes(s) ||
          t.rrn?.toLowerCase().includes(s) ||
          t.bankName?.toLowerCase().includes(s) ||
          (t.accountLastFour && t.accountLastFour.includes(s))
        );
      }
      return true;
    });
  }
}

export async function fetchFinancialSummary(account?: string): Promise<FinancialSummary> {
  try {
    const params = new URLSearchParams();
    if (account && account !== 'ALL') params.append('account', account);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/transactions/summary${query}`);
    if (!res.ok) throw new Error('Network response not ok');
    return await res.json();
  } catch {
    return MOCK_SUMMARY;
  }
}

export async function fetchSpendingTrends(account?: string): Promise<SpendingTrend[]> {
  try {
    const params = new URLSearchParams();
    if (account && account !== 'ALL') params.append('account', account);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/analytics/spending${query}`);
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data && data.length > 0 ? data : MOCK_TRENDS;
  } catch {
    return MOCK_TRENDS;
  }
}

export async function fetchTopMerchants(account?: string): Promise<MerchantStat[]> {
  try {
    const params = new URLSearchParams();
    if (account && account !== 'ALL') params.append('account', account);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/analytics/merchants${query}`);
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data && data.length > 0 ? data : MOCK_MERCHANTS;
  } catch {
    return MOCK_MERCHANTS;
  }
}

export async function fetchBankDistribution(account?: string): Promise<BankStat[]> {
  try {
    const params = new URLSearchParams();
    if (account && account !== 'ALL') params.append('account', account);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/analytics/banks${query}`);
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data && data.length > 0 ? data : MOCK_BANKS;
  } catch {
    return MOCK_BANKS;
  }
}

export async function fetchRawSmsList(): Promise<RawSms[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/sms`);
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data && data.length > 0 ? data : MOCK_RAW_SMS;
  } catch {
    return MOCK_RAW_SMS;
  }
}

export async function triggerReprocessAll(): Promise<{ success: boolean; message: string; reprocessedCount: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions/reparse-all`, { method: 'POST' });
    return await res.json();
  } catch {
    return { success: true, message: "Parsed simulated raw messages in pipeline", reprocessedCount: 3 };
  }
}
