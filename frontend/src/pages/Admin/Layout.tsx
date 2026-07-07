import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Home, Layers, Code, MessageSquare, LogOut, Menu, X } from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex font-['Inter',sans-serif]">
            {/* Mobile Header & Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 font-black text-sm rounded-lg flex items-center justify-center border border-blue-100">
                        EP
                    </div>
                    <h2 className="font-bold text-slate-800 text-base leading-tight">Admin Portal</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 bg-slate-50 rounded-lg">
                    <Menu size={24} />
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-slate-900/50 z-30 backdrop-blur-sm"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-72 bg-white border-r border-slate-100 flex flex-col p-6 fixed h-full z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="flex items-center justify-between mb-10 pl-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 font-black text-lg rounded-xl flex items-center justify-center border border-blue-100">
                            EP
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg leading-tight">Admin</h2>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Portal</p>
                        </div>
                    </div>
                    <button onClick={closeSidebar} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavLink to="/admin" end onClick={closeSidebar} className={navLinkClass}>
                        <Home size={18} /> Dashboard
                    </NavLink>
                    <NavLink to="/admin/projects" onClick={closeSidebar} className={navLinkClass}>
                        <Layers size={18} /> Projects
                    </NavLink>
                    <NavLink to="/admin/skills" onClick={closeSidebar} className={navLinkClass}>
                        <Code size={18} /> Skills
                    </NavLink>
                    <NavLink to="/admin/messages" onClick={closeSidebar} className={navLinkClass}>
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
            <main className="flex-1 md:ml-72 pt-20 md:pt-10 p-4 md:p-10 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
