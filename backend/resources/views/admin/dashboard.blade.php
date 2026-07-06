@extends('layouts.admin')

@section('title', 'Dashboard')

@section('content')

<div class="page-header">
    <div>
        <h2>Selamat datang, {{ Auth::user()->name }} 👋</h2>
        <p>Berikut ringkasan portofolio Anda hari ini — {{ now()->format('d F Y') }}</p>
    </div>
</div>

<!-- Stat Cards -->
<div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:32px;">
    <div class="card ios-glass" style="padding: 24px;">
        <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; background: rgba(10, 132, 255, 0.1); color: #007aff; border: 1px solid rgba(10, 132, 255, 0.2);">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div style="font-family: var(--font-display); font-size: 36px; font-weight: 800; color: var(--text-primary); line-height: 1; letter-spacing: -1px;">{{ $projectCount }}</div>
        <div style="font-family: 'Geist Mono', monospace; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; font-weight: 600;">Total Proyek</div>
    </div>
    <div class="card ios-glass" style="padding: 24px;">
        <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; background: rgba(16, 185, 129, 0.1); color: #047857; border: 1px solid rgba(16, 185, 129, 0.2);">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
        <div style="font-family: var(--font-display); font-size: 36px; font-weight: 800; color: var(--text-primary); line-height: 1; letter-spacing: -1px;">{{ $skillCount }}</div>
        <div style="font-family: 'Geist Mono', monospace; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; font-weight: 600;">Total Keahlian</div>
    </div>
    <div class="card ios-glass" style="padding: 24px; {{ $unreadMessages > 0 ? 'border-color: rgba(10,132,255,0.4); box-shadow: 0 0 0 4px rgba(10,132,255,0.1);' : '' }}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(10, 132, 255, 0.1); color: #007aff; border: 1px solid rgba(10, 132, 255, 0.2);">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            @if($unreadMessages > 0)
                <span class="badge badge-blue" style="font-size: 11px; padding: 4px 10px; border-radius: 8px;">{{ $unreadMessages }} baru</span>
            @endif
        </div>
        <div style="font-family: var(--font-display); font-size: 36px; font-weight: 800; color: var(--text-primary); line-height: 1; letter-spacing: -1px;">{{ $recentMessages->count() }}</div>
        <div style="font-family: 'Geist Mono', monospace; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; font-weight: 600;">Pesan Masuk</div>
    </div>
</div>

<!-- Content Grid -->
<div style="display:grid; grid-template-columns:1fr 380px; gap:24px; align-items:start;">

    <!-- Recent Messages -->
    <div class="card ios-glass" style="overflow:hidden;">
        <div style="padding:24px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; background: #ffffff;">
            <div>
                <div style="font-weight:700; font-size:16px; color:var(--text-primary); letter-spacing: -0.3px;">Pesan Terbaru</div>
                <div style="font-family:'Geist Mono',monospace; font-size:11px; font-weight:500; color:var(--text-muted); margin-top:4px;">5 PESAN TERAKHIR DARI PENGUNJUNG</div>
            </div>
            <a href="{{ route('admin.messages.index') }}" class="btn-ghost" style="font-size:13px; padding:8px 14px;">
                Lihat Semua
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
        </div>

        @forelse($recentMessages as $msg)
        <div style="padding:20px 24px; border-bottom:1px solid var(--border); display:flex; align-items:flex-start; gap:16px; {{ !$msg->is_read ? 'background: rgba(10,132,255,0.04);' : 'background: #fafafa;' }}">
            <div style="width:40px; height:40px; border-radius:10px; background:var(--accent-dim); border:1px solid rgba(10,132,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:'Geist Mono',monospace; font-size:14px; color:var(--accent); font-weight:600; text-transform:uppercase;">
                {{ substr($msg->name, 0, 1) }}
            </div>
            <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <span style="font-weight:600; font-size:14.5px; color:var(--text-primary); letter-spacing: -0.2px;">{{ $msg->name }}</span>
                    @if(!$msg->is_read)
                        <span style="width:8px; height:8px; background:var(--accent); border-radius:50%; flex-shrink:0;"></span>
                    @endif
                    <span style="font-family:'Geist Mono',monospace; font-size:11px; font-weight:500; color:var(--text-muted); margin-left:auto; white-space:nowrap;">{{ $msg->created_at->diffForHumans() }}</span>
                </div>
                <div style="font-size:14px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ $msg->message }}</div>
            </div>
        </div>
        @empty
        <div style="padding:60px 24px; text-align:center; color:var(--text-muted); font-size:14px; background: #fafafa;">
            Belum ada pesan masuk.
        </div>
        @endforelse
    </div>

    <!-- Quick Actions -->
    <div style="display:flex; flex-direction:column; gap:20px;">
        <div class="card ios-glass" style="padding:24px; background: #ffffff;">
            <div style="font-weight:700; font-size:16px; color:var(--text-primary); margin-bottom:20px; letter-spacing: -0.3px;">Aksi Cepat</div>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <a href="{{ route('admin.projects.index') }}" class="btn-primary" style="width:100%; justify-content:center; padding: 12px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Proyek Baru
                </a>
                <a href="{{ route('admin.skills.index') }}" class="btn-ghost" style="width:100%; justify-content:center; padding: 12px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                    Kelola Keahlian
                </a>
                <a href="{{ route('admin.messages.index') }}" class="btn-ghost" style="width:100%; justify-content:center; padding: 12px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    Inbox Pesan
                </a>
            </div>
        </div>

        <div class="card ios-glass" style="padding:24px; background: #ffffff;">
            <div style="font-family:'Geist Mono',monospace; font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:16px;">Ringkasan</div>
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:14px; font-weight:500; color:var(--text-secondary);">Total Proyek</span>
                    <span class="badge badge-blue" style="font-size: 11px; padding: 2px 8px;">{{ $projectCount }}</span>
                </div>
                <div style="border-top:1px solid var(--border);"></div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:14px; font-weight:500; color:var(--text-secondary);">Total Keahlian</span>
                    <span class="badge badge-green" style="font-size: 11px; padding: 2px 8px;">{{ $skillCount }}</span>
                </div>
                <div style="border-top:1px solid var(--border);"></div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:14px; font-weight:500; color:var(--text-secondary);">Pesan Belum Dibaca</span>
                    <span class="badge {{ $unreadMessages > 0 ? 'badge-blue' : 'badge-gray' }}" style="font-size: 11px; padding: 2px 8px;">{{ $unreadMessages }}</span>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection