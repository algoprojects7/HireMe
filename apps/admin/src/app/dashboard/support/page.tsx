"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@repo/ui';
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Send,
  User,
  ShieldCheck
} from 'lucide-react';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/support/me');
      setTickets(response.data);
    } catch (err) {
      console.error('Error fetching tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/support', form);
      setShowCreate(false);
      setForm({ title: '', description: '', priority: 'MEDIUM' });
      await fetchTickets();
    } catch (err) {
      alert('Failed to create ticket');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const response = await api.post(`/support/${selectedTicket.id}/messages`, { message: newMessage });
      setSelectedTicket({
        ...selectedTicket,
        messages: [...selectedTicket.messages, response.data]
      });
      setNewMessage('');
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const viewTicket = async (id: string) => {
    try {
      const response = await api.get(`/support/${id}`);
      setSelectedTicket(response.data);
    } catch (err) {
      alert('Failed to load ticket details');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Help & Support</h1>
          <p className="text-gray-400">Need assistance? Open a ticket and our team will get back to you.</p>
        </div>
        <Button 
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2"
        >
          <Plus size={18} /> New Support Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">My Tickets</h3>
          {tickets.length === 0 ? (
            <div className="p-12 text-center bg-white/5 border border-white/10 rounded-2xl">
              <MessageSquare size={40} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500 text-sm">No tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div 
                key={ticket.id}
                onClick={() => viewTicket(ticket.id)}
                className={`p-4 bg-white/5 border transition-all cursor-pointer rounded-2xl ${
                  selectedTicket?.id === ticket.id ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                   <StatusBadge status={ticket.status} />
                   <span className="text-[10px] text-gray-600 font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1 line-clamp-1">{ticket.title}</h4>
                <p className="text-gray-500 text-xs line-clamp-1">{ticket.description}</p>
              </div>
            ))
          )}
        </div>

        {/* Ticket Detail / Conversation */}
        <div className="lg:col-span-2">
           {selectedTicket ? (
             <div className="bg-white/5 border border-white/10 rounded-3xl flex flex-col h-[600px]">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                   <div>
                      <h3 className="text-lg font-bold text-white">{selectedTicket.title}</h3>
                      <p className="text-xs text-gray-500">Ticket ID: {selectedTicket.id}</p>
                   </div>
                   <StatusBadge status={selectedTicket.status} />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                   <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl mb-8">
                      <p className="text-white text-sm">{selectedTicket.description}</p>
                   </div>

                   {selectedTicket.messages.map((msg: any) => (
                     <div key={msg.id} className={`flex gap-4 ${msg.sender.role === 'ADMIN' ? 'flex-row' : 'flex-row-reverse text-right'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          msg.sender.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-600/10 text-blue-400'
                        }`}>
                           {msg.sender.role === 'ADMIN' ? <ShieldCheck size={20} /> : <User size={20} />}
                        </div>
                        <div className="space-y-1 max-w-[80%]">
                           <div className={`text-[10px] font-bold uppercase tracking-widest text-gray-500`}>
                             {msg.sender.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                           <div className={`p-3 rounded-2xl text-sm ${
                             msg.sender.role === 'ADMIN' ? 'bg-white/10 text-white rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'
                           }`}>
                             {msg.message}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Reply Box */}
                <form onSubmit={handleReply} className="p-6 border-t border-white/10 flex gap-4">
                   <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                   />
                   <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6">
                      <Send size={18} />
                   </Button>
                </form>
             </div>
           ) : (
             <div className="h-[600px] flex flex-col items-center justify-center text-center bg-white/5 border border-dashed border-white/10 rounded-3xl space-y-4">
                <MessageSquare size={64} className="text-gray-800" />
                <div>
                   <p className="text-white font-bold">No Ticket Selected</p>
                   <p className="text-gray-500 text-sm">Select a ticket from the list to view the conversation</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
           <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">Create New Ticket</h2>
              <p className="text-gray-400 text-sm mb-6">Explain your issue in detail and our team will assist you.</p>
              
              <form onSubmit={handleCreate} className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Subject / Title</label>
                    <input 
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      placeholder="e.g. Wallet balance not updating"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Priority</label>
                    <select 
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none"
                    >
                       <option value="LOW" className="bg-[#0a0a0a]">Low</option>
                       <option value="MEDIUM" className="bg-[#0a0a0a]">Medium</option>
                       <option value="HIGH" className="bg-[#0a0a0a]">High</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Description</label>
                    <textarea 
                      required
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                      placeholder="Describe your issue in detail..."
                    />
                 </div>
                 
                 <div className="flex gap-4 pt-4">
                    <Button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white">Cancel</Button>
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">Submit Ticket</Button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    OPEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    RESOLVED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CLOSED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[status] || colors.OPEN}`}>
      {status}
    </span>
  );
}
