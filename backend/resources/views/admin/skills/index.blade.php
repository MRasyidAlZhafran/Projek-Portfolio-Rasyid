@extends('layouts.admin')

@section('title', 'Kelola Keahlian')

@section('content')

<div class="page-header">
    <div>
        <h2>Kelola Keahlian</h2>
        <p>Atur daftar teknologi dan keahlian yang ditampilkan di portofolio.</p>
    </div>
    <button onclick="openModal('modal-add')" class="btn-primary">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Tambah Keahlian
    </button>
</div>

<!-- Skills grouped by category -->
@php $grouped = $skills->groupBy('category'); @endphp

@forelse($grouped as $category => $items)
<div class="card ios-glass" style="overflow:hidden; margin-bottom:24px;">
    <div style="padding:16px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:12px; background:rgba(10,132,255,0.04);">
        <span style="width:8px; height:8px; border-radius:50%; background:var(--accent); flex-shrink:0;"></span>
        <span style="font-family:'Geist Mono',monospace; font-size:12px; color:var(--accent); text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">{{ $category }}</span>
        <span style="font-family:'Geist Mono',monospace; font-size:11px; color:var(--text-muted); margin-left:auto; font-weight:500;">{{ $items->count() }} KEAHLIAN</span>
    </div>

    <div style="overflow-x:auto;">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nama Keahlian</th>
                    <th>Level</th>
                    <th style="width:240px;">Profisiensi</th>
                    <th style="text-align:right;">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @foreach($items as $skill)
                <tr>
                    <td>
                        <div style="font-weight:600; font-size:14.5px; color:var(--text-primary);">{{ $skill->name }}</div>
                    </td>
                    <td>
                        <span style="font-family:'Geist Mono',monospace; font-size:13px; color:
                            {{ $skill->level >= 80 ? 'var(--green)' : ($skill->level >= 60 ? 'var(--accent)' : 'var(--text-secondary)') }}; font-weight:600; background: {{ $skill->level >= 80 ? 'rgba(16, 185, 129, 0.1)' : ($skill->level >= 60 ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0,0,0,0.05)') }}; padding: 4px 8px; border-radius: 6px;">
                            {{ $skill->level }}%
                        </span>
                    </td>
                    <td>
                        <div style="height: 6px; background: rgba(0,0,0,0.06); border-radius: 10px; overflow: hidden; width: 100%;">
                            <div style="height: 100%; background: {{ $skill->level >= 80 ? 'var(--green)' : 'var(--accent)' }}; width:{{ $skill->level }}%; border-radius: 10px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);"></div>
                        </div>
                    </td>
                    <td>
                        <div style="display:flex; gap:8px; justify-content:flex-end;">
                            <button onclick='openEdit({{ $skill->id }}, @json($skill->name), {{ $skill->level }}, @json($skill->category))' class="btn-ghost" style="padding:6px 12px; font-size:12.5px;">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit
                            </button>
                            <form method="POST" action="{{ route('admin.skills.delete', $skill->id) }}" onsubmit="return confirm('Hapus keahlian \'{{ addslashes($skill->name) }}\'?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="btn-danger" style="padding:6px 12px; font-size:12.5px;">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                                    Hapus
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@empty
<div class="card ios-glass" style="padding:80px 24px; text-align:center; color:var(--text-muted);">
    <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto 16px; display:block; opacity:0.3;"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    <div style="font-size: 15px;">Belum ada keahlian. Klik <strong style="color:var(--text-primary);">Tambah Keahlian</strong> untuk memulai.</div>
</div>
@endforelse


<!-- ═══ MODAL: TAMBAH KEAHLIAN ═══ -->
<div id="modal-add" class="modal-overlay" onclick="if(event.target===this)closeModal('modal-add')">
    <div class="modal-box">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:28px;">
            <div class="modal-title" style="margin-bottom:0;">Tambah Keahlian Baru</div>
            <button onclick="closeModal('modal-add')" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:6px; border-radius:8px; transition:all 0.2s ease;" onmouseover="this.style.background='var(--bg-hover)'; this.style.color='var(--text-primary)'" onmouseout="this.style.background='transparent'; this.style.color='var(--text-muted)'">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <form method="POST" action="{{ route('admin.skills.store') }}">
            @csrf
            <div style="display:flex; flex-direction:column; gap:18px;">
                <div>
                    <label class="form-label">Nama Keahlian *</label>
                    <input type="text" name="name" class="form-input" placeholder="Misal: Laravel, React, Figma..." required>
                </div>
                <div>
                    <label class="form-label">Kategori *</label>
                    <input type="text" name="category" class="form-input" placeholder="Misal: Backend, Frontend, Tools" required list="category-list">
                    <datalist id="category-list">
                        @foreach($grouped->keys() as $cat)
                            <option value="{{ $cat }}">
                        @endforeach
                        <option value="Backend">
                        <option value="Frontend">
                        <option value="Tools">
                        <option value="Database">
                        <option value="DevOps">
                        <option value="Design">
                    </datalist>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:6px;">Ketik atau pilih kategori yang ada</div>
                </div>
                <div>
                    <label class="form-label">Level Profisiensi: <span id="add-level-display" style="color:var(--accent); font-weight:700;">80%</span></label>
                    <div style="padding: 12px 0;">
                        <input type="range" name="level" min="0" max="100" value="80" class="form-input"
                            style="padding:0; height:6px; cursor:pointer; accent-color:var(--accent); border:none; background: rgba(0,0,0,0.06); box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);"
                            oninput="document.getElementById('add-level-display').textContent=this.value+'%'">
                    </div>
                    <div style="display:flex; justify-content:space-between; font-family:'Geist Mono',monospace; font-size:11px; color:var(--text-muted); margin-top:2px;">
                        <span>Pemula (0)</span><span>Mahir (100)</span>
                    </div>
                </div>
            </div>
            <div style="display:flex; gap:12px; margin-top:32px;">
                <button type="submit" class="btn-primary" style="flex:1; justify-content:center;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    Simpan Keahlian
                </button>
                <button type="button" onclick="closeModal('modal-add')" class="btn-ghost" style="padding: 10px 24px;">Batal</button>
            </div>
        </form>
    </div>
</div>


<!-- ═══ MODAL: EDIT KEAHLIAN ═══ -->
<div id="modal-edit" class="modal-overlay" onclick="if(event.target===this)closeModal('modal-edit')">
    <div class="modal-box">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:28px;">
            <div class="modal-title" style="margin-bottom:0;">Edit Keahlian</div>
            <button onclick="closeModal('modal-edit')" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:6px; border-radius:8px; transition:all 0.2s ease;" onmouseover="this.style.background='var(--bg-hover)'; this.style.color='var(--text-primary)'" onmouseout="this.style.background='transparent'; this.style.color='var(--text-muted)'">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <form id="form-edit" method="POST">
            @csrf @method('PUT')
            <div style="display:flex; flex-direction:column; gap:18px;">
                <div>
                    <label class="form-label">Nama Keahlian *</label>
                    <input type="text" id="edit-name" name="name" class="form-input" required>
                </div>
                <div>
                    <label class="form-label">Kategori *</label>
                    <input type="text" id="edit-category" name="category" class="form-input" required list="category-list-edit">
                    <datalist id="category-list-edit">
                        @foreach($grouped->keys() as $cat)
                            <option value="{{ $cat }}">
                        @endforeach
                    </datalist>
                </div>
                <div>
                    <label class="form-label">Level Profisiensi: <span id="edit-level-display" style="color:var(--accent); font-weight:700;">80%</span></label>
                    <div style="padding: 12px 0;">
                        <input type="range" id="edit-level" name="level" min="0" max="100" class="form-input"
                            style="padding:0; height:6px; cursor:pointer; accent-color:var(--accent); border:none; background: rgba(0,0,0,0.06); box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);"
                            oninput="document.getElementById('edit-level-display').textContent=this.value+'%'">
                    </div>
                    <div style="display:flex; justify-content:space-between; font-family:'Geist Mono',monospace; font-size:11px; color:var(--text-muted); margin-top:2px;">
                        <span>Pemula (0)</span><span>Mahir (100)</span>
                    </div>
                </div>
            </div>
            <div style="display:flex; gap:12px; margin-top:32px;">
                <button type="submit" class="btn-primary" style="flex:1; justify-content:center;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    Simpan Perubahan
                </button>
                <button type="button" onclick="closeModal('modal-edit')" class="btn-ghost" style="padding: 10px 24px;">Batal</button>
            </div>
        </form>
    </div>
</div>

@endsection

@section('scripts')
<script>
function openEdit(id, name, level, category) {
    document.getElementById('form-edit').action = `/admin/skills/${id}`;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-category').value = category;
    document.getElementById('edit-level').value = level;
    document.getElementById('edit-level-display').textContent = level + '%';
    openModal('modal-edit');
}

@if($errors->any())
    openModal('modal-add');
@endif
</script>
@endsection