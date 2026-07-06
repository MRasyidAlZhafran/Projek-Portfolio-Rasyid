import { useEffect, useState } from 'react';
import { Layers, Code, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({ projects: 0, skills: 0, messages: 0 });

    useEffect(() => {
        // Fetch stats (we can just fetch the counts or lists)
        const fetchStats = async () => {
            try {
                const [projRes, skillRes, msgRes] = await Promise.all([
                    api.get('/admin/projects'),
                    api.get('/admin/skills'),
                    api.get('/admin/messages')
                ]);
                setStats({
                    projects: projRes.data.length,
                    skills: skillRes.data.length,
                    messages: msgRes.data.length
                });
            } catch (e) {
                console.error(e);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, count, icon, color, link }: any) => (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-sm`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-slate-400 font-medium text-sm mb-1">{title}</p>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tight leading-none">{count}</h3>
                </div>
            </div>
            <Link to={link} className="flex items-center text-sm font-semibold text-slate-600 hover:text-[#0a84ff] transition-colors mt-4">
                Kelola {title} <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Overview</h1>
                <p className="text-slate-500 mt-1">Selamat datang kembali di Admin Portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Projects" 
                    count={stats.projects} 
                    icon={<Layers size={22} />} 
                    color="bg-blue-50 text-blue-600 border border-blue-100" 
                    link="/admin/projects" 
                />
                <StatCard 
                    title="Skills" 
                    count={stats.skills} 
                    icon={<Code size={22} />} 
                    color="bg-purple-50 text-purple-600 border border-purple-100" 
                    link="/admin/skills" 
                />
                <StatCard 
                    title="Messages" 
                    count={stats.messages} 
                    icon={<MessageSquare size={22} />} 
                    color="bg-green-50 text-green-600 border border-green-100" 
                    link="/admin/messages" 
                />
            </div>
        </div>
    );
};

export default Dashboard;
