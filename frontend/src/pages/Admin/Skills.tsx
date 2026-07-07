import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const emptyForm = { name: '', category: '' };

const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<any>(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

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

    useEffect(() => { fetchSkills(); }, []);

    const openAdd = () => {
        setEditingSkill(null);
        setForm(emptyForm);
        setIsModalOpen(true);
    };

    const openEdit = (s: any) => {
        setEditingSkill(s);
        setForm({ name: s.name, category: s.category });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSkill(null);
        setForm(emptyForm);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingSkill) {
                await api.put(`/admin/skills/${editingSkill.id}`, form);
            } else {
                await api.post('/admin/skills', form);
            }
            closeModal();
            fetchSkills();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus skill ini?')) return;
        try {
            await api.delete(`/admin/skills/${id}`);
            fetchSkills();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Skills</h1>
                    <p className="text-slate-500 mt-1 text-sm">Kelola data keahlian.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="bg-[#0a84ff] hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-[0_8px_15px_-5px_rgba(10,132,255,0.4)] transition-all flex items-center gap-2 text-sm"
                >
                    <Plus size={16} /> Tambah Skill
                </button>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500 bg-white rounded-2xl">Loading...</div>
                ) : skills.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-white rounded-2xl">Belum ada skill.</div>
                ) : (
                    skills.map((s: any) => (
                        <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-slate-800">{s.name}</div>
                                <span className="inline-block bg-purple-50 text-purple-600 text-xs font-semibold px-2 py-0.5 rounded-md border border-purple-100 mt-1">{s.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors">
                                    <Trash2 size={14} />
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
                            <th className="p-5 font-semibold text-slate-600 text-sm">Nama Keahlian</th>
                            <th className="p-5 font-semibold text-slate-600 text-sm">Kategori</th>
                            <th className="p-5 font-semibold text-slate-600 text-sm w-32">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={3} className="p-8 text-center text-slate-500">Loading...</td></tr>
                        ) : skills.length === 0 ? (
                            <tr><td colSpan={3} className="p-8 text-center text-slate-500">Belum ada skill.</td></tr>
                        ) : (
                            skills.map((s: any) => (
                                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-5 font-bold text-slate-800">{s.name}</td>
                                    <td className="p-5">
                                        <span className="inline-block bg-purple-50 text-purple-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-purple-100">{s.category}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors">
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

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">{editingSkill ? 'Edit Skill' : 'Tambah Skill Baru'}</h2>
                            <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Keahlian</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                    placeholder="cth. React, Laravel, Figma..."
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    required
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition bg-white"
                                >
                                    <option value="">Pilih Kategori</option>
                                    <option value="Frontend">Frontend</option>
                                    <option value="Backend">Backend</option>
                                    <option value="Tools">Tools</option>
                                    <option value="Design">Design</option>
                                    <option value="Mobile">Mobile</option>
                                    <option value="Database">Database</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 border border-slate-200 text-slate-600 font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSaving} className="flex-1 bg-[#0a84ff] hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl transition text-sm disabled:opacity-60">
                                    {isSaving ? 'Menyimpan...' : (editingSkill ? 'Simpan Perubahan' : 'Tambah Skill')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Skills;
