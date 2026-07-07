import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash2, CheckCircle, Mail } from 'lucide-react';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/admin/messages');
            setMessages(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleRead = async (id: number) => {
        try {
            await api.put(`/admin/messages/${id}/read`);
            fetchMessages();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await api.delete(`/admin/messages/${id}`);
            fetchMessages();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Messages</h1>
                    <p className="text-slate-500 mt-1 text-sm">Pesan masuk dari pengunjung.</p>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500 bg-white rounded-2xl">Loading...</div>
                ) : messages.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-white rounded-2xl">Belum ada pesan.</div>
                ) : (
                    messages.map((m: any) => (
                        <div key={m.id} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 ${!m.is_read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">{m.name}</div>
                                    <div className="text-xs text-slate-500">{m.email}</div>
                                </div>
                                {m.is_read ? (
                                    <span className="inline-block bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0">Dibaca</span>
                                ) : (
                                    <span className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-md border border-blue-200 flex-shrink-0">Baru</span>
                                )}
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{m.message}</p>
                            <div className="flex items-center gap-2">
                                {!m.is_read && (
                                    <button onClick={() => handleRead(m.id)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-600 transition-colors flex items-center gap-1">
                                        <CheckCircle size={12} /> Tandai Dibaca
                                    </button>
                                )}
                                <button onClick={() => handleDelete(m.id)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center gap-1">
                                    <Trash2 size={12} /> Hapus
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.03)] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-5 font-semibold text-slate-600 text-sm">Pengirim</th>
                            <th className="p-5 font-semibold text-slate-600 text-sm">Pesan</th>
                            <th className="p-5 font-semibold text-slate-600 text-sm">Status</th>
                            <th className="p-5 font-semibold text-slate-600 text-sm w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading...</td></tr>
                        ) : messages.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada pesan.</td></tr>
                        ) : (
                            messages.map((m: any) => (
                                <tr key={m.id} className={`border-b border-slate-50 transition-colors ${m.is_read ? 'hover:bg-slate-50/50' : 'bg-blue-50/30 hover:bg-blue-50/50'}`}>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${m.is_read ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-500'}`}>
                                                <Mail size={16} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{m.name}</div>
                                                <div className="text-xs text-slate-500">{m.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <p className="text-sm text-slate-600 max-w-md">{m.message}</p>
                                    </td>
                                    <td className="p-5">
                                        {m.is_read ? (
                                            <span className="inline-block bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-md">Dibaca</span>
                                        ) : (
                                            <span className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-200">Baru</span>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            {!m.is_read && (
                                                <button onClick={() => handleRead(m.id)} title="Tandai Dibaca" className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-green-100 hover:text-green-600 transition-colors">
                                                    <CheckCircle size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(m.id)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Messages;
