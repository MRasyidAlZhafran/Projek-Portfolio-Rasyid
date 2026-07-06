import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', { email, password });
            localStorage.setItem('admin_token', res.data.token);
            navigate('/admin');
        } catch (err: any) {
            setError('Login failed. Check your credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6 font-['Inter',sans-serif]">
            <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 font-black text-2xl rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                        EP
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Portal</h2>
                    <p className="text-slate-500 text-sm mt-2">Masuk ke sistem manajemen konten.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-6 border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-200 transition-all placeholder-slate-400 font-medium"
                            placeholder="admin@ethereal.id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-200 transition-all placeholder-slate-400 font-medium"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#0a84ff] hover:bg-blue-600 text-white font-semibold rounded-xl py-4 mt-4 transition-all shadow-[0_8px_20px_-6px_rgba(10,132,255,0.4)] active:scale-[0.98]"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
