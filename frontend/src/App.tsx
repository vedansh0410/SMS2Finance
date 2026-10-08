import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AccountSelector } from './components/AccountSelector';
import { KpiCards } from './components/KpiCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionTable } from './components/TransactionTable';
import { TransactionModal } from './components/TransactionModal';
import { SmsIngestionFeed } from './components/SmsIngestionFeed';
import { ResearchBenchmarkModal } from './components/ResearchBenchmarkModal';
import {
  fetchAccounts,
  fetchTransactions,
  fetchFinancialSummary,
  fetchSpendingTrends,
  fetchTopMerchants,
  fetchBankDistribution,
  fetchRawSmsList,
} from './services/api';
import { Transaction, FinancialSummary, AccountSummary, SpendingTrend, MerchantStat, BankStat, RawSms } from './types';
import { RefreshCw, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'pipeline'>('overview');
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('1541'); // Default to primary account so accounts are separated!
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalSpent: 0,
    totalReceived: 0,
    netFlow: 0,
    totalTransactions: 0,
    totalRawSms: 0,
  });
  const [trends, setTrends] = useState<SpendingTrend[]>([]);
  const [merchants, setMerchants] = useState<MerchantStat[]>([]);
  const [banks, setBanks] = useState<BankStat[]>([]);
  const [rawSmsList, setRawSmsList] = useState<RawSms[]>([]);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);

  const [selectedBank, setSelectedBank] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load account list
  const loadAccounts = async () => {
    try {
      const accList = await fetchAccounts();
      setAccounts(accList);
      // If selectedAccount is not set or not in list, default to first real account
      if (accList.length > 0 && selectedAccount !== 'ALL') {
        const found = accList.find((a) => a.accountLastFour === selectedAccount);
        if (!found) {
          setSelectedAccount(accList[0].accountLastFour);
        }
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [accList, txns, summ, tr, m, b, sms] = await Promise.all([
        fetchAccounts(),
        fetchTransactions(selectedBank, selectedType, searchQuery, selectedAccount),
        fetchFinancialSummary(selectedAccount),
        fetchSpendingTrends(selectedAccount),
        fetchTopMerchants(selectedAccount),
        fetchBankDistribution(selectedAccount),
        fetchRawSmsList(),
      ]);

      setAccounts(accList);
      setTransactions(txns);
      setSummary(summ);
      setTrends(tr);
      setMerchants(m);
      setBanks(b);
      setRawSmsList(sms);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    loadAllData();
  }, [selectedAccount, selectedBank, selectedType, searchQuery]);

  const activeAccountObj = accounts.find((a) => a.accountLastFour === selectedAccount);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
      <Navbar
        onRefresh={loadAllData}
        onOpenResearchModal={() => setIsResearchModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center py-2 mb-4 text-xs text-indigo-400 space-x-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Synchronizing live transactions for selected account...</span>
          </div>
        )}

        {/* Tab 1: Overview & Analytics */}
        {activeTab === 'overview' && (
          <div>
            {/* Account Selector Cards */}
            <AccountSelector
              accounts={accounts}
              selectedAccount={selectedAccount}
              onSelectAccount={(acc) => setSelectedAccount(acc)}
            />

            {/* Account-Specific KPI Cards */}
            <KpiCards
              summary={summary}
              activeBalance={activeAccountObj?.latestBalance}
              activeAccountLabel={
                selectedAccount === 'ALL'
                  ? undefined
                  : `${activeAccountObj?.bankName || 'Bank'} (•••• ${selectedAccount})`
              }
            />

            {/* Account-Specific Trends & Breakdowns */}
            <AnalyticsCharts trends={trends} banks={banks} merchants={merchants} />

            {/* Quick Recent Transactions Section for this Account */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {selectedAccount === 'ALL'
                      ? 'Recent Structured Transactions (All Accounts)'
                      : `Transactions for A/c •••• ${selectedAccount} (${activeAccountObj?.bankName || 'Bank'})`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Latest financial records normalized and reconciled for this account
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
                >
                  <span>View All Transactions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <TransactionTable
                transactions={transactions}
                onSelectTransaction={(txn) => setSelectedTransaction(txn)}
                selectedBank={selectedBank}
                setSelectedBank={setSelectedBank}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedAccount={selectedAccount}
                setSelectedAccount={setSelectedAccount}
                accounts={accounts}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Transactions Explorer */}
        {activeTab === 'transactions' && (
          <div>
            {/* Account Selector Cards */}
            <AccountSelector
              accounts={accounts}
              selectedAccount={selectedAccount}
              onSelectAccount={(acc) => setSelectedAccount(acc)}
            />

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Transactions Explorer
              </h2>
              <p className="text-xs text-slate-400">
                Search, filter, and inspect entities extracted by hybrid NER and deterministic regex
              </p>
            </div>

            <TransactionTable
              transactions={transactions}
              onSelectTransaction={(txn) => setSelectedTransaction(txn)}
              selectedBank={selectedBank}
              setSelectedBank={setSelectedBank}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedAccount={selectedAccount}
              setSelectedAccount={setSelectedAccount}
              accounts={accounts}
            />
          </div>
        )}

        {/* Tab 3: Android Ingestion Monitor */}
        {activeTab === 'pipeline' && (
          <div>
            <SmsIngestionFeed smsList={rawSmsList} />
          </div>
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      {isResearchModalOpen && (
        <ResearchBenchmarkModal onClose={() => setIsResearchModalOpen(false)} />
      )}
    </div>
  );
};
