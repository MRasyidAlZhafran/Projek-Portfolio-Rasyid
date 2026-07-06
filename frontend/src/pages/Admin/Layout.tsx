import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Home, Layers, Code, MessageSquare, LogOut } from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-[#0a84ff] text-white shadow-[0_4px_15px_-3px_rgba(10,132,255,0.4)]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`;

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex font-['Inter',sans-serif]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col p-6 fixed h-full z-20">
                <div className="flex items-center gap-3 mb-10 pl-2">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 font-black text-lg rounded-xl flex items-center justify-center border border-blue-100">
                        EP
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg leading-tight">Admin</h2>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Portal</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavLink to="/admin" end className={navLinkClass}>
                        <Home size={18} /> Dashboard
                    </NavLink>
                    <NavLink to="/admin/projects" className={navLinkClass}>
                        <Layers size={18} /> Projects
                    </NavLink>
                    <NavLink to="/admin/skills" className={navLinkClass}>
                        <Code size={18} /> Skills
                    </NavLink>
                    <NavLink to="/admin/messages" className={navLinkClass}>
                        <MessageSquare size={18} /> Messages
                    </NavLink>
                </nav>

                <div className="pt-6 border-t border-slate-100 mt-auto">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full transition-all font-medium text-left">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-10 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
