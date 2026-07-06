@extends('layouts.admin')

@section('title', 'Kelola Proyek')

@section('content')

<div class="page-header">
    <div>
        <h2>Kelola Proyek</h2>
        <p>Tambah, edit, atau hapus proyek di portofolio Anda.</p>
    </div>
    <button onclick="openModal('modal-add')" class="btn-primary">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Tambah Proyek
    </button>
</div>

<!-- Project Table -->
<div class="card ios-glass" style="overflow:hidden;">
    <div style="padding:20px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; background: #ffffff;">
        <span style="font-family:'Geist Mono',monospace; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em;">
            {{ $projects->count() }} PROYEK TERDAFTAR
        </span>
    </div>

    <div style="overflow-x:auto;">
        @forelse($projects as $project)
        <div style="display:flex; align-items:center; gap:20px; padding:20px 24px; border-bottom:1px solid var(--border); transition:background 0.2s ease; background: #fafafa;" onmouseover="this.style.background='#ffffff'" onmouseout="this.style.background='#fafafa'">

            <!-- Thumbnail -->
            <div style="width:90px; height:60px; border-radius:10px; overflow:hidden; background:var(--bg-hover); flex-shrink:0; border:1px solid var(--border); box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                @if($project->image)
                    <img src="{{ Storage::url($project->image) }}" alt="{{ $project->title }}" style="width:100%; height:100%; object-fit:cover;">
                @else
                    <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">
                        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                @endif
            </div>

            <!-- Info -->
            <div style="flex:1; min-width:0;">
                <div style="font-weight:600; font-size:15px; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; letter-spacing:-0.2px;">{{ $project->title }}</div>
                <div style="font-size:13.5px; color:var(--text-secondary); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ $project->description }}</div>
            </div>

            <!-- Tech Stack -->
            <div style="flex-shrink:0; max-width:240px; display:flex; flex-wrap:wrap; gap:6px; justify-content:flex-end;">
                @foreach(explode(',', $project->tech_stack) as $tech)
                    <span style="font-family:'Geist Mono',monospace; font-size:10.5px; font-weight: 500; padding:4px 10px; border-radius:6px; background:#ffffff; color:var(--text-secondary); border:1px solid var(--border); box-shadow:0 1px 2px rgba(0,0,0,0.02); white-space:nowrap;">{{ trim($tech) }}</span>
                @endforeach
            </div>

            <!-- Links -->
            <div style="display:flex; gap:8px; flex-shrink:0;">
                @if($project->github_url)
                <a href="{{ $project->github_url }}" target="_blank" class="btn-ghost" style="padding:8px 12px; font-size:13px;" title="GitHub">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                </a>
                @endif
                @if($project->demo_url)
                <a href="{{ $project->demo_url }}" target="_blank" class="btn-ghost" style="padding:8px 12px; font-size:13px;" title="Demo">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
                @endif
            </div>

            <!-- Actions -->
            <div style="display:flex; gap:8px; flex-shrink:0; border-left: 1px solid var(--border); padding-left: 20px;">
                <button onclick='openEdit(
                    {{ $project->id }},
                    @json($project->title),
                    @json($project->description),
                    @json($project->tech_stack),
                    @json($project->github_url ?? ""),
                    @json($project->demo_url ?? "")
                )' class="btn-ghost" style="padding:8px 14px;">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                </button>
                <form method="POST" action="{{ route('admin.projects.delete', $project->id) }}" onsubmit="return confirm('Hapus proyek \'{{ addslashes($project->title) }}\'?')">
                    @csrf @method('DELETE')
                    <button type="submit" class="btn-danger">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        Hapus
                    </button>
                </form>
            </div>
        </div>
        @empty
        <div style="padding:80px 24px; text-align:center; color:var(--text-muted); background: #fafafa;">
            <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto 16px; display:block; opacity:0.3;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <div style="font-size: 15px;">Belum ada proyek. Klik <strong style="color:var(--text-primary);">Tambah Proyek</strong> untuk memulai.</div>
        </div>
        @endforelse
    </div>
</div>


<!-- ═══ MODAL: TAMBAH PROYEK ═══ -->
<div id="modal-add" class="modal-overlay" onclick="if(event.target===this)closeModal('modal-add')">
    <div class="modal-box">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:28px;">
            <div class="modal-title" style="margin-bottom:0;">Tambah Proyek Baru</div>
            <button onclick="closeModal('modal-add')" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:6px; border-radius:8px; transition:all 0.2s ease;" onmouseover="this.style.background='var(--bg-hover)'; this.style.color='var(--text-primary)'" onmouseout="this.style.background='transparent'; this.style.color='var(--text-muted)'">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <form method="POST" action="{{ route('admin.projects.store') }}" enctype="multipart/form-data">
            @csrf
            <div style="display:flex; flex-direction:column; gap:18px;">
                <div>
                    <label class="form-label">Judul Proyek *</label>
                    <input type="text" name="title" class="form-input" placeholder="Misal: E-Commerce Laravel" required>
                </div>
                <div>
                    <label class="form-label">Deskripsi *</label>
                    <textarea name="description" class="form-input" placeholder="Jelaskan proyek Anda secara singkat..." rows="3" required style="resize:vertical;"></textarea>
                </div>
                <div>
                    <label class="form-label">Tech Stack *</label>
                    <input type="text" name="tech_stack" class="form-input" placeholder="Laravel, React, Tailwind CSS" required>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:6px;">Pisahkan dengan koma</div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div>
                        <label class="form-label">URL GitHub</label>
                        <input type="url" name="github_url" class="form-input" placeholder="https://github.com/...">
                    </div>
                    <div>
                        <label class="form-label">URL Demo</label>
                        <input type="url" name="demo_url" class="form-input" placeholder="https://demo.example.com">
                    </div>
                </div>
                <div>
                    <label class="form-label">Gambar Thumbnail</label>
                    <div style="border: 1px dashed var(--border-strong); border-radius: 12px; padding: 12px; background: #fafafa;">
                        <input type="file" name="image" class="form-input" accept="image/*" style="padding:10px 14px; cursor:pointer; background: transparent; border: none; box-shadow: none;">
                    </div>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:6px;">JPG, PNG, WebP, GIF — maks 10MB</div>
                </div>
            </div>
            <div style="display:flex; gap:12px; margin-top:32px;">
                <button type="submit" class="btn-primary" style="flex:1; justify-content:center;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    Simpan Proyek
                </button>
                <button type="button" onclick="closeModal('modal-add')" class="btn-ghost" style="padding: 10px 24px;">Batal</button>
            </div>
        </form>
    </div>
</div>


<!-- ═══ MODAL: EDIT PROYEK ═══ -->
<div id="modal-edit" class="modal-overlay" onclick="if(event.target===this)closeModal('modal-edit')">
    <div class="modal-box">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:28px;">
            <div class="modal-title" style="margin-bottom:0;">Edit Proyek</div>
            <button onclick="closeModal('modal-edit')" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:6px; border-radius:8px; transition:all 0.2s ease;" onmouseover="this.style.background='var(--bg-hover)'; this.style.color='var(--text-primary)'" onmouseout="this.style.background='transparent'; this.style.color='var(--text-muted)'">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <form id="form-edit" method="POST" enctype="multipart/form-data">
            @csrf @method('PUT')
            <div style="display:flex; flex-direction:column; gap:18px;">
                <div>
                    <label class="form-label">Judul Proyek *</label>
                    <input type="text" id="edit-title" name="title" class="form-input" required>
                </div>
                <div>
                    <label class="form-label">Deskripsi *</label>
                    <textarea id="edit-description" name="description" class="form-input" rows="3" required style="resize:vertical;"></textarea>
                </div>
                <div>
                    <label class="form-label">Tech Stack *</label>
                    <input type="text" id="edit-tech" name="tech_stack" class="form-input" required>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:6px;">Pisahkan dengan koma</div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div>
                        <label class="form-label">URL GitHub</label>
                        <input type="url" id="edit-github" name="github_url" class="form-input">
                    </div>
                    <div>
                        <label class="form-label">URL Demo</label>
                        <input type="url" id="edit-demo" name="demo_url" class="form-input">
                    </div>
                </div>
                <div>
                    <label class="form-label">Ganti Gambar (opsional)</label>
                    <div style="border: 1px dashed var(--border-strong); border-radius: 12px; padding: 12px; background: #fafafa;">
                        <input type="file" name="image" class="form-input" accept="image/*" style="padding:10px 14px; cursor:pointer; background: transparent; border: none; box-shadow: none;">
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
function openEdit(id, title, description, tech, github, demo) {
    document.getElementById('form-edit').action = `/admin/projects/${id}`;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-description').value = description;
    document.getElementById('edit-tech').value = tech;
    document.getElementById('edit-github').value = github;
    document.getElementById('edit-demo').value = demo;
    openModal('modal-edit');
}

// Open add modal if there were validation errors
@if($errors->any())
    openModal('modal-add');
@endif
</script>
@endsection