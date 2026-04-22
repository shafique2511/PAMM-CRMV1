import React, { useState } from 'react';
import { Investor, Transaction, Trade, PeriodHistory } from '../types';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, DollarSign, Users, AlertCircle, Wallet, Percent, Award, Activity, Target, TrendingDown, ArrowRight, Clock, Building2, Landmark, ShieldCheck, ArrowDownToLine, Repeat } from 'lucide-react';

interface DashboardStatsProps {
  investors: Investor[];
  transactions: Transaction[];
  trades?: Trade[];
  history?: PeriodHistory[];
  isAdmin: boolean;
  onAddTransaction?: (t: Partial<Transaction>) => void;
  brokerBalance?: number;
}

export function DashboardStats({ investors, transactions, trades = [], history = [], isAdmin, onAddTransaction, brokerBalance }: DashboardStatsProps) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');

  // Math Logic Overhaul - Professional Grade True All-Time Calculations
  const safeSum = (arr: any[], key: string) => arr.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);

  const totalStartingCapital = safeSum(investors, 'startingCapital'); // Current active period opening equity
  const totalEndingCapital = safeSum(investors, 'endingCapital');     // Current active period closing equity
  
  const totalUnpaidFees = investors.reduce((sum, inv) => sum + (Number(inv.unpaidFee) || 0) + (Number(inv.yourFee) || 0), 0);
  const totalFeeCollected = safeSum(investors, 'feeCollected'); // feeCollected natively accrues all-time in the system

  const managerWithdrawalTxs = transactions.filter(t => t.type === 'manager_withdrawal');
  const managerWithdrawals = safeSum(managerWithdrawalTxs, 'amount');
  const managerWalletBalance = totalFeeCollected - managerWithdrawals;
  const managerFeeProfit = totalFeeCollected + totalUnpaidFees;

  const totalInvestors = investors.length;
  // Computed entire current broker equity (Investors + Manager Wallet)
  const computedBrokerBalance = totalEndingCapital + managerWalletBalance;

  // -- TRUE ALL-TIME INVESTOR METRICS RECONSTRUCTION --
  
  // 1. All-Time Net Profit
  // Combines current floating net profit with all historical snapshot net profits
  const currentNetProfit = safeSum(investors, 'netProfit');
  const historicalNetProfit = history.reduce((sum, h) => 
    sum + h.investorSnapshots.reduce((s, inv) => s + (Number(inv.netProfit) || 0), 0)
  , 0);
  const totalProfitGeneratedAllTime = currentNetProfit + historicalNetProfit;

  // 2. All-Time Cash Payouts & Dividend Extractions
  // Because 'cashPayout' resets on rollover and isn't saved to history directly, we reverse-engineer it 
  // mathematically from the snapshot invariant: EndingCap = StartingCap + Profit - Payout
  // Therefore: Payout = StartingCap + Profit - EndingCap
  const currentCashPayouts = safeSum(investors, 'cashPayout');
  const historicalCashPayouts = history.reduce((sum, h) => 
    sum + h.investorSnapshots.reduce((s, inv) => {
      const rebuiltPayout = (Number(inv.startingCapital) || 0) + (Number(inv.netProfit) || 0) - (Number(inv.endingCapital) || 0);
      return s + Math.max(0, rebuiltPayout); // Prevent edge anomalies
    }, 0)
  , 0);
  
  // Also include explicit 'withdrawal' transactions just in case they were processed outside of period roll-overs
  const externalWithdrawals = safeSum(transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed'), 'amount');
  
  const totalInvestorPayoutsAllTime = currentCashPayouts + historicalCashPayouts + externalWithdrawals;

  // 3. All-Time Reinvested Profit
  // Reinvestment is simply the profit that was NOT paid out.
  const totalReinvestedAllTime = Math.max(0, totalProfitGeneratedAllTime - totalInvestorPayoutsAllTime);

  // 4. True All-Time ROI 
  // To avoid shrinking ROI against a growing reinvested denominator, we reverse-engineer the pure Total Net Deposits:
  // Since: Current Ending Capital = Total Net Deposits + All-Time Profit - All-Time Payouts
  // Then: Total Net Deposits = Current Ending Capital + All-Time Payouts - All-Time Profit
  const totalNetOriginalDeposits = Math.max(0, totalEndingCapital + totalInvestorPayoutsAllTime - totalProfitGeneratedAllTime);
  const professionalROI = totalNetOriginalDeposits > 0 
    ? (totalProfitGeneratedAllTime / totalNetOriginalDeposits) * 100 
    : 0;

  // Evaluate highest performer across current state
  const highestPerformingInvestor = [...investors].sort((a, b) => (Number(b.netProfit) || 0) - (Number(a.netProfit) || 0))[0];
  const highestPerformerText = highestPerformingInvestor && highestPerformingInvestor.netProfit > 0 
    ? `${highestPerformingInvestor.investorName} (${formatCurrency(highestPerformingInvestor.netProfit)})`
    : 'N/A';

  // Advanced Trading Analytics
  const winningTrades = trades.filter(t => t.profit > 0);
  const losingTrades = trades.filter(t => t.profit < 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  
  const grossProfit = safeSum(winningTrades, 'profit');
  const grossLoss = Math.abs(safeSum(losingTrades, 'profit'));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 999 : 0);

  // Approximate Max Drawdown from Period History
  let peak = 0;
  let maxDrawdown = 0;
  
  const capitalHistory = history.map(h => h.investorSnapshots.reduce((sum, s) => sum + s.endingCapital, 0));
  capitalHistory.push(totalEndingCapital); // Include current state

  capitalHistory.forEach(cap => {
    if (cap > peak) peak = cap;
    const drawdown = peak > 0 ? ((peak - cap) / peak) * 100 : 0;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > managerWalletBalance) {
      alert("Please enter a valid amount.");
      return;
    }
    if (onAddTransaction) {
      onAddTransaction({
        type: 'manager_withdrawal',
        amount,
        date: new Date().toISOString(),
        status: 'completed',
        notes: withdrawNotes || 'Dashboard Withdrawal',
        referenceId: `TX-MGR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        method: 'Internal Transfer',
        category: 'Internal'
      });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawNotes('');
    }
  };

  const gridStats = [
    {
      title: "Current Broker Balance",
      value: formatCurrency(computedBrokerBalance),
      icon: Building2,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      show: true
    },
    {
      title: "MT5 Sync Balance",
      value: formatCurrency(brokerBalance || 0),
      icon: Wallet,
      color: "text-teal-600",
      bg: "bg-teal-100",
      show: isAdmin && (brokerBalance || 0) > 0
    },
    {
      title: "Max Drawdown",
      value: `${maxDrawdown.toFixed(2)}%`,
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-100",
      show: isAdmin && history.length > 0
    },
    {
      title: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      icon: Target,
      color: "text-cyan-600",
      bg: "bg-cyan-100",
      show: isAdmin && trades.length > 0
    },
    {
      title: "Profit Factor",
      value: profitFactor === 999 ? '∞' : profitFactor.toFixed(2),
      icon: TrendingUp,
      color: "text-fuchsia-600",
      bg: "bg-fuchsia-100",
      show: isAdmin && trades.length > 0
    }
  ].filter(s => s.show);

  return (
    <div className="space-y-8 mb-8 animate-in fade-in duration-500">
      {isAdmin && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Manager Ecosystem */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Landmark className="w-48 h-48 text-white" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold tracking-tight text-white mb-6 flex items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                  Manager Ecosystem
                </h3>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                  <div>
                    <p className="text-slate-400 font-bold tracking-wider text-xs mb-1 uppercase">Wallet Balance</p>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">{formatCurrency(managerWalletBalance)}</h2>
                  </div>
                  <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="px-5 py-3 w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 active:scale-95 text-sm"
                  >
                    Withdraw Payout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 md:p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                  <div>
                    <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Fee Profit</p>
                    <p className="font-bold text-sm md:text-lg text-white truncate">{formatCurrency(managerFeeProfit)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Collected</p>
                    <p className="font-bold text-sm md:text-lg text-cyan-400 truncate">{formatCurrency(totalFeeCollected)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Payouts</p>
                    <p className="font-bold text-sm md:text-lg text-rose-400 truncate">{formatCurrency(managerWithdrawals)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Unpaid</p>
                    <p className="font-bold text-sm md:text-lg text-amber-400 truncate">{formatCurrency(totalUnpaidFees)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Investor Ecosystem */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none">
                <Users className="w-48 h-48 text-slate-900 dark:text-white" />
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Investor Ecosystem
                </h3>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold tracking-wider text-xs mb-1 uppercase">Total Ending Capital</p>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">{formatCurrency(totalEndingCapital)}</h2>
                  </div>
                  <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-slate-500 dark:text-slate-400 font-bold tracking-wider text-xs mb-1 uppercase">Active Profiles</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{totalInvestors}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest hidden md:block">Net Profit</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest md:hidden">Profit</p>
                    </div>
                    <p className="font-bold text-sm md:text-lg text-slate-900 dark:text-white truncate">{formatCurrency(totalProfitGeneratedAllTime)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Repeat className="w-3 h-3 text-blue-500" />
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Reinvest</p>
                    </div>
                    <p className="font-bold text-sm md:text-lg text-blue-600 dark:text-blue-400 truncate">{formatCurrency(totalReinvestedAllTime)}</p>
                  </div>
                  <div>
                     <div className="flex items-center gap-1.5 mb-1">
                      <ArrowDownToLine className="w-3 h-3 text-rose-500" />
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Payouts</p>
                    </div>
                    <p className="font-bold text-sm md:text-lg text-rose-600 dark:text-rose-400 truncate">{formatCurrency(totalInvestorPayoutsAllTime)}</p>
                  </div>
                  <div>
                     <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="w-3 h-3 text-slate-500" />
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest hidden md:block">Orig. Cap</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest md:hidden">Orig.</p>
                    </div>
                    <p className="font-bold text-sm md:text-lg text-slate-900 dark:text-white truncate">{formatCurrency(totalNetOriginalDeposits)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* High-Level Performance Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ROI Highlight */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-violet-500/20 dark:group-hover:bg-violet-500/30"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-2xl">
                  <Percent className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Yield (ROI)</h3>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{professionalROI.toFixed(2)}%</h2>
                <div className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> All-Time
                </div>
              </div>
            </div>

            {/* Net Return Highlight */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Global Net Return</h3>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(totalProfitGeneratedAllTime)}</h2>
                <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-1 rounded-lg uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  Generated
                </div>
              </div>
            </div>

            {/* Top Performer Highlight */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20 dark:group-hover:bg-amber-500/30"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Top Performer</h3>
              </div>
              <div className="flex flex-col relative z-10 min-h-[48px] justify-center">
                {highestPerformingInvestor ? (
                   <>
                     <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">{highestPerformingInvestor.investorName}</h2>
                     <p className="text-amber-600 dark:text-amber-400 font-bold text-sm sm:text-base mt-0.5">{formatCurrency(highestPerformingInvestor.netProfit)} generated</p>
                   </>
                ) : (
                   <h2 className="text-2xl font-black text-slate-400 dark:text-slate-600 tracking-tight">N/A</h2>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Stats section */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {gridStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.bg} dark:bg-opacity-20`}>
                <Icon className={`w-6 h-6 ${stat.color} dark:brightness-150`} />
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 line-clamp-1" title={stat.title}>{stat.title}</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate" title={stat.value}>{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Withdraw Earnings</h2>
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Available for Withdrawal</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(managerWalletBalance)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount to Withdraw</label>
                <input 
                  type="number" 
                  min="0"
                  max={managerWalletBalance}
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none font-bold"
                  value={withdrawAmount}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                      setWithdrawAmount('');
                      return;
                    }
                    const num = parseFloat(val);
                    if (!isNaN(num)) {
                      if (num > managerWalletBalance) {
                        setWithdrawAmount(managerWalletBalance.toString());
                      } else if (num < 0) {
                        setWithdrawAmount('0');
                      } else {
                        setWithdrawAmount(val);
                      }
                    }
                  }}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Notes (Optional)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none font-medium text-sm"
                  value={withdrawNotes}
                  onChange={e => setWithdrawNotes(e.target.value)}
                  placeholder="e.g. Bank Transfer"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 px-4 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > managerWalletBalance}
                  className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
