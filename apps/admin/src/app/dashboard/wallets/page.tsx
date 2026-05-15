"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@repo/ui';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Plus, CreditCard, Receipt, TrendingUp, AlertCircle } from 'lucide-react';

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', accountInfo: '' });
  const [disclaimer, setDisclaimer] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, withdrawRes, discRes] = await Promise.all([
        api.get('/wallets/me'),
        api.get('/wallets/withdrawals'),
        api.get('/bookings/disclaimer')
      ]);
      setWallet(walletRes.data);
      setWithdrawals(withdrawRes.data);
      setDisclaimer(discRes.data.message);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/wallets/withdraw', {
        amount: Number(withdrawForm.amount),
        accountInfo: withdrawForm.accountInfo
      });
      setShowWithdraw(false);
      setWithdrawForm({ amount: '', accountInfo: '' });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const calculatedFee = Number(withdrawForm.amount) * 0.025;
  const netAmount = Number(withdrawForm.amount) - calculatedFee;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Wallet & Finance</h1>
          <p className="text-gray-400">Manage your earnings, payouts, and transaction history securely.</p>
        </div>
        <div className="flex gap-4">
           <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3 px-6 rounded-2xl flex items-center gap-2">
             <Plus size={18} /> Add Money
           </Button>
           <Button 
             onClick={() => setShowWithdraw(true)}
             className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/20"
           >
             <ArrowDownLeft size={18} /> Withdraw Funds
           </Button>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-start gap-4">
         <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
         <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Legal Safety Notice</h4>
            <p className="text-amber-200/70 text-xs leading-relaxed max-w-4xl">
               {disclaimer || "HireMe is only responsible for bookings and payments approved through this platform. If work continues without advance payment approval, HireMe will not be responsible for any inconvenience, theft, or security issues."}
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Balance Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="relative p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] shadow-2xl shadow-blue-600/20 overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet size={120} />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                  <CreditCard className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-widest mb-1">Available Balance</p>
                  <p className="text-4xl font-black text-white tracking-tight">₹{wallet?.balance.toLocaleString() || '0'}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-white/10 rounded-2xl border border-white/5">
                  <p className="text-blue-100/40 text-[10px] font-bold uppercase mb-1">Net Earnings</p>
                  <p className="text-lg font-bold text-white">₹{wallet?.balance.toLocaleString()}</p>
                </div>
                <div className="flex-1 p-4 bg-white/10 rounded-2xl border border-white/5">
                  <p className="text-blue-100/40 text-[10px] font-bold uppercase mb-1">Locked Funds</p>
                  <p className="text-lg font-bold text-white">₹0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Information */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                   <TrendingUp className="text-blue-400" size={18} />
                </div>
                <h4 className="text-sm font-bold text-white">Transaction Policies</h4>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-500">Service/Gateway Fee</span>
                   <span className="text-white font-bold">2.5%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-500">Processing Time</span>
                   <span className="text-white font-bold">Instantly to 24h</span>
                </div>
                <div className="pt-3 border-t border-white/5 text-[10px] text-gray-500 leading-relaxed">
                   Fees are deducted automatically from withdrawal requests to cover Razorpay and gateway processing costs.
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Tabs for Transactions and Withdrawals */}
        <div className="lg:col-span-2 space-y-8">
           <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 px-2">
                <History size={20} className="text-blue-400" /> Transaction Ledger
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="divide-y divide-white/5">
                  {wallet?.ledger.length === 0 ? (
                    <div className="p-16 text-center">
                      <Receipt size={48} className="mx-auto text-gray-700 mb-4" />
                      <p className="text-gray-500 font-medium">No ledger entries found</p>
                    </div>
                  ) : (
                    wallet?.ledger.map((tx: any) => (
                      <div key={tx.id} className="p-5 hover:bg-white/[0.01] transition-colors flex items-center gap-6">
                        <div className={`p-3 rounded-2xl flex items-center justify-center ${
                          tx.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {tx.type === 'CREDIT' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-sm">{tx.description}</h4>
                          <p className="text-[10px] text-gray-600 mt-1 font-mono">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-black tracking-tight ${
                            tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-white'
                          }`}>
                            {tx.type === 'CREDIT' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 px-2">
                <ArrowDownLeft size={20} className="text-purple-400" /> Payout Requests
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                       <tr>
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Service Fee</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Net Payout</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {withdrawals.length === 0 ? (
                         <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-600 text-sm">No payout requests found</td>
                         </tr>
                       ) : (
                         withdrawals.map((w) => (
                           <tr key={w.id} className="hover:bg-white/[0.01]">
                              <td className="px-6 py-4 text-white font-bold text-sm">₹{w.amount}</td>
                              <td className="px-6 py-4 text-red-400/70 text-xs">₹{w.fee}</td>
                              <td className="px-6 py-4 text-emerald-400 font-bold text-sm">₹{w.netAmount}</td>
                              <td className="px-6 py-4">
                                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                   w.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                   'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                 }`}>
                                   {w.status}
                                 </span>
                              </td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#000]/90 backdrop-blur-md" onClick={() => setShowWithdraw(false)} />
           <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">Request Payout</h2>
              <p className="text-gray-500 text-sm mb-8">Funds will be transferred to your registered account.</p>
              
              <form onSubmit={handleWithdraw} className="space-y-6">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Withdrawal Amount (₹)</label>
                    <input 
                      required
                      type="number"
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      placeholder="0.00"
                    />
                    {Number(withdrawForm.amount) > 0 && (
                      <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                         <div className="flex justify-between text-xs text-gray-500">
                            <span>Service Charge (2.5%)</span>
                            <span>- ₹{calculatedFee.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                            <span>Net Payout</span>
                            <span className="text-emerald-400">₹{netAmount.toFixed(2)}</span>
                         </div>
                      </div>
                    )}
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Payment Account / UPI</label>
                    <input 
                      required
                      value={withdrawForm.accountInfo}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, accountInfo: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      placeholder="Enter UPI ID or Bank Details"
                    />
                 </div>

                 <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-[10px] text-amber-500 leading-relaxed">
                    By requesting withdrawal, you confirm that all associated work has been completed and both parties have agreed to the terms.
                 </div>
                 
                 <div className="flex gap-4 pt-4">
                    <Button type="button" onClick={() => setShowWithdraw(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl">Cancel</Button>
                    <Button 
                      type="submit" 
                      disabled={!withdrawForm.amount || Number(withdrawForm.amount) > wallet?.balance}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                    >
                      Request Withdrawal
                    </Button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
