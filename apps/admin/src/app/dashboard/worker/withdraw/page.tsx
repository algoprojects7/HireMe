"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Wallet, ArrowRight, IndianRupee, Landmark, Send, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@repo/ui';

export default function WithdrawalPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [accountInfo, setAccountInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchData = async () => {
    try {
      const [walletRes, withdrawRes] = await Promise.all([
        api.get('/wallets/me'),
        api.get('/wallets/withdrawals')
      ]);
      setWallet(walletRes.data);
      setWithdrawals(withdrawRes.data);
    } catch (err) {
      console.error('Failed to fetch wallet data', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return alert('Enter valid amount');
    if (numAmount > wallet.balance) return alert('Insufficient balance');
    if (!accountInfo) return alert('Enter account details');

    setLoading(true);
    try {
      await api.post('/wallets/withdraw', { amount: numAmount, accountInfo });
      setAmount('');
      setAccountInfo('');
      fetchData();
      alert('Withdrawal request submitted successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const serviceCharge = amount ? parseFloat(amount) * 0.025 : 0;
  const netAmount = amount ? parseFloat(amount) - serviceCharge : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Wallet & Withdrawals</h1>
        <p className="text-gray-400">Transfer your earnings to your bank account or UPI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
             <Wallet size={120} />
          </div>
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
          <h2 className="text-4xl font-black mb-6">₹{wallet?.balance?.toFixed(2) || "0.00"}</h2>
          <div className="flex items-center gap-2 text-[10px] bg-white/20 w-fit px-2 py-1 rounded-full font-bold">
            <ShieldCheck size={12} />
            SECURED BY RAZORPAY
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Amount to Withdraw</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bank Details / UPI ID</label>
              <div className="relative">
                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={accountInfo}
                  onChange={(e) => setAccountInfo(e.target.value)}
                  placeholder="A/C No, IFSC or UPI"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {amount && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-400">Withdrawal Amount</span>
                 <span className="text-white font-bold">₹{parseFloat(amount).toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-400">Razorpay Service Charge (2.5%)</span>
                 <span className="text-red-400 font-bold">- ₹{serviceCharge.toFixed(2)}</span>
               </div>
               <div className="border-t border-white/5 pt-2 flex justify-between text-base">
                 <span className="text-white font-bold">Net Settlement</span>
                 <span className="text-emerald-400 font-black">₹{netAmount.toFixed(2)}</span>
               </div>
            </div>
          )}

          <Button 
            onClick={handleWithdraw}
            disabled={loading || !amount || !accountInfo}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all"
          >
            {loading ? 'Processing...' : (
              <>
                <Send size={18} className="mr-2" />
                Confirm Withdrawal
              </>
            )}
          </Button>

          <p className="text-[10px] text-center text-gray-500 flex items-center justify-center gap-1">
            <AlertCircle size={10} />
            Funds will be transferred to your account within 24-48 business hours.
          </p>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock size={20} className="text-gray-400" />
          Withdrawal History
        </h3>

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">Settlement</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">No history found</td>
                </tr>
              ) : (
                withdrawals.map((w: any) => (
                  <tr key={w.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      ₹{w.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-400">
                      ₹{w.netAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        w.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
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
  );
}
