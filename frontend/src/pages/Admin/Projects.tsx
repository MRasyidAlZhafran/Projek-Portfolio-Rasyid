import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Link } from 'lucide-react';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/admin/projects');
            setProjects(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.delete(`/admin/projects/${id}`);
            fetchProjects();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Projects</h1>
                    <p className="text-slate-500 mt-1">Kelola data portofolio.</p>
                </div>
                <button className="bg-[#0a84ff] hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-[0_8px_15px_-5px_rgba(10,132,255,0.4)] transition-all flex items-center gap-2">
                    <Plus size={18} /> Tambah Project
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.03)] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-5 font-semibold text-slate-600 text-sm">Project</th>
                            <th className="p-5 font-semibold text-slate-600 text-sm">Tech Stack</th>
                            <th className="p-5 font-semibold text-slate-600 text-sm">Links</th>
                            <th className="p-5 font-semibold text-slate-600 text-sm w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading...</td></tr>
                        ) : projects.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada project.</td></tr>
                        ) : (
                            projects.map((p: any) => (
                                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            {p.image ? (
                                                <img src={`http://localhost:8000/storage/${p.image}`} alt={p.title} className="w-12 h-12 rounded-xl object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                                            )}
                                            <div>
                                                <div className="font-bold text-slate-800">{p.title}</div>
                                                <div className="text-sm text-slate-500 truncate max-w-[200px]">{p.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100">{p.tech_stack}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            {p.github_url && <a href={p.github_url} target="_blank" className="text-slate-400 hover:text-slate-700 transition-colors"><Link size={16} /></a>}
                                            {p.demo_url && <a href={p.demo_url} target="_blank" className="text-slate-400 hover:text-blue-500 transition-colors"><Link size={16} /></a>}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
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

export default Projects;
