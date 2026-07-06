@extends('layouts.admin')

@section('title', 'Inbox Pesan')

@section('content')

<div class="page-header">
    <div>
        <h2>Inbox Pesan</h2>
    </div>
    @php $unread = $messages->where('is_read', false)->count(); @endphp
    @if($unread > 0)
        <span class="badge badge-blue" style="font-size:12px; padding:6px 14px; box-shadow:0 2px 4px rgba(10,132,255,0.15);">{{ $unread }} belum dibaca</span>
    @endif
</div>

<div style="display:flex; flex-direction:column; gap:20px;">
    @forelse($messages as $msg)
    <div class="card ios-glass" style="padding:28px 32px; {{ !$msg->is_read ? 'border-color: rgba(10,132,255,0.3); background: rgba(10,132,255,0.02); box-shadow: 0 4px 12px rgba(10,132,255,0.08);' : 'background: #ffffff;' }}">
        <div style="display:flex; align-items:flex-start; gap:20px;">

            <!-- Avatar -->
            <div style="width:48px; height:48px; border-radius:12px; background:{{ !$msg->is_read ? 'var(--accent-dim)' : 'var(--bg-hover)' }}; border:1px solid {{ !$msg->is_read ? 'rgba(10,132,255,0.15)' : 'var(--border)' }}; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:var(--font-display); font-size:16px; color:{{ !$msg->is_read ? 'var(--accent)' : 'var(--text-secondary)' }}; font-weight:700; text-transform:uppercase; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                {{ substr($msg->name, 0, 1) }}
            </div>

            <!-- Content -->
            <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px; flex-wrap:wrap;">
                    <span style="font-family:var(--font-display); font-weight:700; font-size:16px; color:var(--text-primary); letter-spacing:-0.2px;">{{ $msg->name }}</span>
                    <span style="font-size:13px; color:var(--text-muted); font-weight:500;">{{ $msg->email }}</span>
                    @if(!$msg->is_read)
                        <span class="badge badge-blue">Baru</span>
                    @else
                        <span class="badge badge-gray">Sudah Dibaca</span>
                    @endif
                    <span style="font-family:'Geist Mono',monospace; font-size:11px; font-weight:500; color:var(--text-muted); margin-left:auto;">
                        {{ $msg->created_at->format('d M Y, H:i') }} · {{ $msg->created_at->diffForHumans() }}
                    </span>
                </div>

                <!-- Message body -->
                <div style="background:#fafafa; border:1px solid rgba(0,0,0,0.06); border-radius:12px; padding:18px 20px; font-size:14.5px; color:var(--text-secondary); line-height:1.6; white-space:pre-wrap; margin-bottom:16px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);">{{ $msg->message }}</div>

                <!-- Actions -->
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <a href="mailto:{{ $msg->email }}?subject=Re: Pesan dari Portfolio&body=Halo {{ $msg->name }},%0D%0A%0D%0ATerima kasih telah menghubungi saya!%0D%0A%0D%0A"
                       class="btn-primary" style="font-size:13px; padding:8px 16px;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                        Balas via Email
                    </a>

                    @if(!$msg->is_read)
                    <form method="POST" action="{{ route('admin.messages.read', $msg->id) }}">
                        @csrf @method('PUT')
                        <button type="submit" class="btn-ghost" style="font-size:13px; padding:8px 16px;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            Tandai Dibaca
                        </button>
                    </form>
                    @endif

                    <form method="POST" action="{{ route('admin.messages.delete', $msg->id) }}" onsubmit="return confirm('Hapus pesan dari {{ addslashes($msg->name) }}?')">
                        @csrf @method('DELETE')
                        <button type="submit" class="btn-danger" style="font-size:13px; padding:8px 16px;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                            Hapus
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    @empty
    <div class="card ios-glass" style="padding:80px 24px; text-align:center; color:var(--text-muted); background: #ffffff;">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto 16px; display:block; opacity:0.3;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <div style="font-size: 15px;">Inbox kosong — belum ada pesan masuk dari pengunjung.</div>
    </div>
    @endforelse
</div>

@endsection
