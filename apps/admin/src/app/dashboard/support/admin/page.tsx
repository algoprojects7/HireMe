"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@repo/ui';
import { 
  MessageSquare, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  User,
  ShieldCheck,
  Phone,
  Briefcase
} from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/support/admin/all');
      setTickets(response.data);
    } catch (err) {
      console.error('Error fetching tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const response = await api.post(`/support/${selectedTicket.id}/messages`, { message: newMessage });
      setSelectedTicket({
        ...selectedTicket,
        status: 'IN_PROGRESS', // Backend also updates this
        messages: [...selectedTicket.messages, response.data]
      });
      setNewMessage('');
      await fetchTickets(); // Refresh list to see updated status
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/support/${id}/status`, { status });
      setSelectedTicket({ ...selectedTicket, status });
      await fetchTickets();
    } catch (err) {
      alert('Failed to update status');
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

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Support Ticket Management</h1>
        <p className="text-gray-400">Review and resolve issues raised by workers and providers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
        {/* Ticket List Area */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                 type="text"
                 placeholder="Search tickets..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
           </div>

           <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  onClick={() => viewTicket(ticket.id)}
                  className={`p-4 bg-white/5 border transition-all cursor-pointer rounded-2xl ${
                    selectedTicket?.id === ticket.id ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                     <StatusBadge status={ticket.status} />
                     <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">{ticket.priority}</span>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1 line-clamp-1">{ticket.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                     <User size={10} /> {ticket.user.name}
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Conversation Area */}
        <div className="lg:col-span-3">
           {selectedTicket ? (
             <div className="bg-white/5 border border-white/10 rounded-3xl flex flex-col h-full shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-blue-400">
                         {selectedTicket.user.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-white leading-tight">{selectedTicket.title}</h3>
                         <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium"><Phone size={10} /> {selectedTicket.user.phone}</span>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium"><Briefcase size={10} /> {selectedTicket.user.role}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <select 
                         value={selectedTicket.status}
                         onChange={(e) => updateStatus(selectedTicket.id, e.target.value)}
                         className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      >
                         <option value="OPEN" className="bg-[#0a0a0a]">Open</option>
                         <option value="IN_PROGRESS" className="bg-[#0a0a0a]">In Progress</option>
                         <option value="RESOLVED" className="bg-[#0a0a0a]">Resolved</option>
                         <option value="CLOSED" className="bg-[#0a0a0a]">Closed</option>
                      </select>
                   </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                   <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl mb-8 relative">
                      <div className="absolute top-0 right-0 p-4">
                         <AlertCircle size={20} className="text-blue-400/20" />
                      </div>
                      <p className="text-blue-100 font-medium mb-2">Original Request:</p>
                      <p className="text-white/80 text-sm leading-relaxed">{selectedTicket.description}</p>
                   </div>

                   {selectedTicket.messages.map((msg: any) => (
                     <div key={msg.id} className={`flex gap-4 ${msg.sender.role === 'ADMIN' ? 'flex-row-reverse text-right' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          msg.sender.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-600/10 text-blue-400'
                        }`}>
                           {msg.sender.role === 'ADMIN' ? <ShieldCheck size={20} /> : <User size={20} />}
                        </div>
                        <div className="space-y-1 max-w-[80%]">
                           <div className={`text-[10px] font-bold uppercase tracking-widest text-gray-500`}>
                             {msg.sender.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                           <div className={`p-4 rounded-2xl text-sm ${
                             msg.sender.role === 'ADMIN' ? 'bg-amber-600 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'
                           }`}>
                             {msg.message}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Reply Box */}
                <form onSubmit={handleReply} className="p-6 border-t border-white/10 flex gap-4 bg-white/[0.02]">
                   <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your official reply here..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                   />
                   <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white px-8 h-[52px]">
                      <Send size={18} />
                   </Button>
                </form>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center bg-white/5 border border-dashed border-white/10 rounded-3xl space-y-4">
                <ShieldCheck size={64} className="text-gray-800" />
                <div>
                   <p className="text-white font-bold">Admin Support Panel</p>
                   <p className="text-gray-500 text-sm">Select a pending ticket to provide professional assistance</p>
                </div>
             </div>
           )}
        </div>
      </div>
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
