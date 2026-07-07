import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Link as LinkIcon, X } from 'lucide-react';

const CATEGORIES = ['Web App', 'Mobile App', 'UI/UX Design', 'API', 'Desktop', 'Game', 'AI/ML', 'Lainnya'];

const emptyForm = { title: '', description: '', tech_stack: '', category: '', github_url: '', demo_url: '', image: null as File | null };

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

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

    useEffect(() => { fetchProjects(); }, []);

    const openAdd = () => {
        setEditingProject(null);
        setForm(emptyForm);
        setIsModalOpen(true);
    };

    const openEdit = (p: any) => {
        setEditingProject(p);
        setForm({ title: p.title, description: p.description, tech_stack: p.tech_stack, category: p.category || '', github_url: p.github_url || '', demo_url: p.demo_url || '', image: null });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
        setForm(emptyForm);
        setIsCategoryOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('title', form.title);
            data.append('description', form.description);
            data.append('tech_stack', form.tech_stack);
            data.append('category', form.category);
            data.append('github_url', form.github_url);
            data.append('demo_url', form.demo_url);
            if (form.image) data.append('image', form.image);

            if (editingProject) {
                data.append('_method', 'PUT');
                await api.post(`/admin/projects/${editingProject.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/admin/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            closeModal();
            fetchProjects();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus project ini?')) return;
        try {
            await api.delete(`/admin/projects/${id}`);
            fetchProjects();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Projects</h1>
                    <p className="text-slate-500 mt-1 text-sm">Kelola data portofolio.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="bg-[#0a84ff] hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-[0_8px_15px_-5px_rgba(10,132,255,0.4)] transition-all flex items-center gap-2 text-sm"
                >
                    <Plus size={16} /> Tambah Project
                </button>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500 bg-white rounded-2xl">Loading...</div>
                ) : projects.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-white rounded-2xl">Belum ada project.</div>
                ) : (
                    projects.map((p: any) => (
                        <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                            <div className="flex items-start gap-3 mb-3">
                                {p.image ? (
                                    <img src={`${import.meta.env.VITE_STORAGE_URL || ''}/storage/${p.image}`} alt={p.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-slate-800 text-sm">{p.title}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.description}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-md border border-blue-100">{p.tech_stack}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
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
                                                <img src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000'}/storage/${p.image}`} alt={p.title} className="w-12 h-12 rounded-xl object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl" />
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
                                            {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-700 transition-colors"><LinkIcon size={16} /></a>}
                                            {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors"><LinkIcon size={16} /></a>}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors">
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

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
                            <h2 className="text-lg font-bold text-slate-800">{editingProject ? 'Edit Project' : 'Tambah Project Baru'}</h2>
                            <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Project</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    required
                                    placeholder="cth. Website Portofolio"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    required
                                    rows={3}
                                    placeholder="Jelaskan tentang project ini..."
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tech Stack</label>
                                <input
                                    type="text"
                                    value={form.tech_stack}
                                    onChange={e => setForm({ ...form, tech_stack: e.target.value })}
                                    required
                                    placeholder="cth. React, Laravel, Tailwind CSS"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        onFocus={() => setIsCategoryOpen(true)}
                                        placeholder="Cari atau pilih kategori..."
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                                    />
                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                {isCategoryOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                                        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                            {CATEGORIES.filter(c => c.toLowerCase().includes(form.category.toLowerCase())).map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => { setForm({ ...form, category: cat }); setIsCategoryOpen(false); }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition ${form.category === cat ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                            {form.category && !CATEGORIES.some(c => c.toLowerCase() === form.category.toLowerCase()) && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCategoryOpen(false)}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 transition border-t border-slate-100"
                                                >
                                                    + Tambah "{form.category}"
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">GitHub URL</label>
                                    <input
                                        type="url"
                                        value={form.github_url}
                                        onChange={e => setForm({ ...form, github_url: e.target.value })}
                                        placeholder="https://github.com/..."
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Demo URL</label>
                                    <input
                                        type="url"
                                        value={form.demo_url}
                                        onChange={e => setForm({ ...form, demo_url: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gambar {editingProject && <span className="text-slate-400 font-normal">(kosongkan jika tidak diganti)</span>}</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setForm({ ...form, image: e.target.files?.[0] || null })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 border border-slate-200 text-slate-600 font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSaving} className="flex-1 bg-[#0a84ff] hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl transition text-sm disabled:opacity-60">
                                    {isSaving ? 'Menyimpan...' : (editingProject ? 'Simpan Perubahan' : 'Tambah Project')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
