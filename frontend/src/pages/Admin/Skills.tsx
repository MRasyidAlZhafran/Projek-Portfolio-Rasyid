import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSkills = async () => {
        try {
            const res = await api.get('/admin/skills');
            setSkills(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this skill?')) return;
        try {
            await api.delete(`/admin/skills/${id}`);
            fetchSkills();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Skills</h1>
                    <p className="text-slate-500 mt-1">Kelola data keahlian.</p>
                </div>
                <button className="bg-[#0a84ff] hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-[0_8px_15px_-5px_rgba(10,132,255,0.4)] transition-all flex items-center gap-2">
                    <Plus size={18} /> Tambah Skill
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.03)] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-5 font-semibold text-slate-600 text-sm">Nama Keahlian</th>
                            <th className="p-5 font-semibold text-slate-600 text-sm">Level (%)</th>
                            <th className="p-5 font-semibold text-slate-600 text-sm">Kategori</th>
                            <th className="p-5 font-semibold text-slate-600 text-sm w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading...</td></tr>
                        ) : skills.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada skill.</td></tr>
                        ) : (
                            skills.map((s: any) => (
                                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-5 font-bold text-slate-800">{s.name}</td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.level}%` }}></div>
                                            </div>
                                            <span className="text-sm text-slate-500 font-medium">{s.level}%</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="inline-block bg-purple-50 text-purple-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-purple-100">{s.category}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
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

export default Skills;
