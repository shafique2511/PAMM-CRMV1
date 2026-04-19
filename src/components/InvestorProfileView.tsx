import React, { useState } from 'react';
import { Investor } from '../types';
import { User, Key, Building2, QrCode, Save, CheckCircle2 } from 'lucide-react';
import { hashPassword } from '../lib/utils';

export function InvestorProfileView({ investor, onUpdateInvestor }: { investor: Investor, onUpdateInvestor: (id: string, updates: Partial<Investor>) => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [bankAccount, setBankAccount] = useState(investor.bankAccount || '');
  const [qrCodeData, setQrCodeData] = useState(investor.qrCode || '');
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpdateProfile = () => {
    onUpdateInvestor(investor.id, {
      bankAccount,
      qrCode: qrCodeData
    });
    setStatusMessage('Profile updated successfully.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handlePasswordChange = async () => {
    if (!newPassword.trim()) return;
    const hashed = await hashPassword(newPassword);
    onUpdateInvestor(investor.id, { password: hashed });
    setStatusMessage('Password updated successfully.');
    setNewPassword('');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{investor.investorName}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Manage your personal details and payment preferences</p>
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Payout Details</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank / Crypto Address</label>
              <textarea 
                 rows={3}
                 placeholder="e.g. Bank Name, Account Number, Routing/Swift OR Crypto Wallet Address"
                 className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white resize-none"
                 value={bankAccount}
                 onChange={e => setBankAccount(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receiving QR Code (Data/URL)</label>
              <div className="relative">
                 <QrCode className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="e.g. USDT TRC20 Address or Invoice URL"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                    value={qrCodeData}
                    onChange={e => setQrCodeData(e.target.value)}
                 />
              </div>
            </div>

            <button 
              onClick={handleUpdateProfile}
              className="mt-2 w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 font-bold shadow-lg active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Details
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Account Security</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
              <input 
                 type="password" 
                 placeholder="Leave blank to keep current password"
                 className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:text-white"
                 value={newPassword}
                 onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            <button 
              onClick={handlePasswordChange}
              disabled={!newPassword.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <Key className="w-4 h-4" />
              Update Password
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 md:p-8 flex items-start gap-4">
        <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0 shadow-sm">
           <Building2 className="w-5 h-5 text-slate-400" />
        </div>
        <div>
           <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">PAMM Information</h4>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
              <div>
                 <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Account Group</span>
                 <span className="font-medium text-slate-900 dark:text-slate-200">{investor.group || 'Standard'}</span>
              </div>
              <div>
                 <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Joined Date</span>
                 <span className="font-medium text-slate-900 dark:text-slate-200">{investor.joinedAt ? new Date(investor.joinedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                 <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                 <span className="font-medium text-emerald-600 dark:text-emerald-400 capitalize">{investor.status || 'Active'}</span>
              </div>
              <div className="space-y-1.5">
                 <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Display Currency</span>
                 <select 
                    value={investor.baseCurrency || 'USD'}
                    onChange={e => onUpdateInvestor(investor.id, { baseCurrency: e.target.value })}
                    className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 dark:text-slate-200 pb-1"
                 >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="MYR">MYR (RM)</option>
                    <option value="CHF">CHF (Fr)</option>
                 </select>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
