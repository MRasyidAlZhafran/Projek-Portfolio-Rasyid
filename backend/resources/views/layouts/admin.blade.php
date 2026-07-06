<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin') — Portfolio Manager</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Hanken+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            /* Portfolio Light Theme Colors */
            --bg: #F8FAFC;
            --bg-glass: rgba(255, 255, 255, 0.7);
            --bg-hover: rgba(0, 0, 0, 0.04);
            --bg-active: rgba(10, 132, 255, 0.08);
            
            --border: rgba(0, 0, 0, 0.08);
            --border-strong: rgba(0, 0, 0, 0.15);
            --border-glass: rgba(255, 255, 255, 1);
            
            --accent: #0a84ff;
            --accent-glow: rgba(10, 132, 255, 0.25);
            --accent-dim: rgba(10, 132, 255, 0.1);
            
            --text-primary: #0F172A;
            --text-secondary: #475569;
            --text-muted: #64748B;
            
            --red: #ef4444;
            --red-dim: rgba(239, 68, 68, 0.1);
            --green: #10b981;
            --green-dim: rgba(16, 185, 129, 0.1);
            --yellow: #f59e0b;
            
            --sidebar-w: 260px;
            
            --font-body: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, 'Inter';
            --font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, 'Hanken Grotesk';
        }

        html, body { height: 100%; }

        body {
            font-family: var(--font-body);
            background-color: var(--bg);
            color: var(--text-primary);
            -webkit-font-smoothing: antialiased;
            min-height: 100vh;
            display: flex;
            background-image: 
                radial-gradient(circle at 15% 50%, rgba(10, 132, 255, 0.03), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(10, 132, 255, 0.04), transparent 25%);
        }

        /* ─── Scrollbar ─── */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }

        /* ─── Glassmorphism Utilities ─── */
        .ios-glass {
            background: var(--bg-glass);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid var(--border);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 var(--border-glass);
        }

        .card {
            background: #ffffff;
            border: 1px solid var(--border);
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
            transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .card:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
            border-color: rgba(0,0,0,0.12);
        }

        /* ─── Sidebar ─── */
        .sidebar {
            position: fixed;
            top: 0; left: 0;
            width: var(--sidebar-w);
            height: 100vh;
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            z-index: 50;
        }

        .sidebar-brand {
            padding: 32px 24px 24px;
        }

        .sidebar-brand .brand-icon {
            width: 40px; height: 40px;
            background: var(--accent-dim);
            border: 1px solid rgba(10,132,255,0.15);
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 16px;
            color: var(--accent);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
        }

        .sidebar-brand h1 {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            letter-spacing: -0.4px;
        }

        .sidebar-brand p {
            font-family: 'Geist Mono', monospace;
            font-size: 10px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 4px;
        }

        .sidebar-nav {
            flex: 1;
            padding: 16px 16px;
            overflow-y: auto;
        }

        .nav-section-label {
            font-family: 'Geist Mono', monospace;
            font-size: 10px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 0 12px;
            margin-bottom: 8px;
            margin-top: 20px;
            font-weight: 600;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            border-radius: 10px;
            text-decoration: none;
            color: var(--text-secondary);
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            margin-bottom: 4px;
            position: relative;
        }

        .nav-item:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
        }

        .nav-item.active {
            background: var(--bg-active);
            color: var(--accent);
            font-weight: 600;
        }

        .nav-item .nav-icon {
            width: 18px; height: 18px;
            flex-shrink: 0;
        }

        .nav-item .badge {
            margin-left: auto;
            background: var(--accent);
            color: #fff;
            font-family: 'Geist Mono', monospace;
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 20px;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(10,132,255,0.2);
        }

        .sidebar-footer {
            padding: 20px 16px;
        }

        .user-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 12px;
            background: #ffffff;
            border: 1px solid var(--border);
            margin-bottom: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .user-avatar {
            width: 36px; height: 36px;
            border-radius: 10px;
            background: var(--bg);
            border: 1px solid var(--border);
            display: flex; align-items: center; justify-content: center;
            font-family: var(--font-display);
            font-size: 14px;
            color: var(--text-primary);
            font-weight: 600;
            flex-shrink: 0;
        }

        .user-info .user-name {
            font-size: 13.5px;
            font-weight: 600;
            color: var(--text-primary);
            letter-spacing: -0.2px;
        }

        .user-info .user-role {
            font-family: 'Geist Mono', monospace;
            font-size: 10.5px;
            color: var(--text-muted);
            margin-top: 2px;
        }

        .logout-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px;
            border-radius: 10px;
            border: 1px solid var(--border);
            background: #ffffff;
            color: var(--text-secondary);
            font-size: 13.5px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .logout-btn:hover {
            background: var(--red-dim);
            border-color: rgba(239, 68, 68, 0.2);
            color: var(--red);
        }

        /* ─── Main Content ─── */
        .main-wrapper {
            margin-left: var(--sidebar-w);
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        .topbar {
            position: sticky;
            top: 0;
            z-index: 40;
            border-bottom: 1px solid var(--border);
            padding: 0 40px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
        }

        .topbar-title {
            font-family: 'Geist Mono', monospace;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .topbar-title span {
            color: var(--text-primary);
        }

        .topbar-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .topbar-time {
            font-family: 'Geist Mono', monospace;
            font-size: 12px;
            color: var(--text-muted);
            font-weight: 500;
        }

        .topbar-view-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid var(--border);
            background: #ffffff;
            color: var(--text-secondary);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .topbar-view-btn:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
            border-color: var(--border-strong);
        }

        .main-content {
            flex: 1;
            padding: 40px;
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
        }

        /* ─── Page Header ─── */
        .page-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 32px;
            gap: 16px;
        }

        .page-header h2 {
            font-family: var(--font-display);
            font-size: 28px;
            font-weight: 700;
            color: var(--text-primary);
            letter-spacing: -0.8px;
        }

        .page-header p {
            color: var(--text-secondary);
            font-size: 14.5px;
            margin-top: 6px;
        }

        /* ─── Buttons ─── */
        .btn-primary {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 20px;
            background: var(--accent);
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(10, 132, 255, 0.25), inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .btn-primary:hover {
            background: #007aff;
            box-shadow: 0 6px 16px rgba(10, 132, 255, 0.35), inset 0 1px 0 rgba(255,255,255,0.2);
            transform: translateY(-1px);
        }
        .btn-primary:active { transform: scale(0.97); }

        .btn-ghost {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 16px;
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
        }

        .btn-ghost:hover {
            background: var(--bg-hover);
            color: var(--text-primary);
            border-color: var(--border-strong);
        }

        .btn-danger {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 14px;
            background: transparent;
            color: var(--red);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-danger:hover {
            background: var(--red-dim);
            border-color: rgba(239, 68, 68, 0.4);
        }

        /* ─── Forms ─── */
        .form-input {
            width: 100%;
            background: #ffffff;
            border: 1px solid var(--border-strong);
            border-radius: 10px;
            padding: 12px 16px;
            color: var(--text-primary);
            font-size: 14.5px;
            font-family: var(--font-body);
            transition: all 0.2s ease;
            outline: none;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
        }

        .form-input:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.15), inset 0 2px 4px rgba(0,0,0,0.01);
        }

        .form-input::placeholder { color: #94a3b8; }

        .form-label {
            display: block;
            font-family: 'Geist Mono', monospace;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
        }

        /* ─── Alerts ─── */
        .alert-success {
            display: flex; align-items: center; gap: 12px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #047857;
            padding: 14px 20px;
            border-radius: 12px;
            margin-bottom: 28px;
            font-size: 14px;
            font-weight: 500;
        }

        .alert-error {
            display: flex; align-items: center; gap: 12px;
            background: var(--red-dim);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #b91c1c;
            padding: 14px 20px;
            border-radius: 12px;
            margin-bottom: 28px;
            font-size: 14px;
            font-weight: 500;
        }

        /* ─── Badges ─── */
        .badge {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 3px 10px;
            border-radius: 20px;
            font-family: 'Geist Mono', monospace;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .badge-blue { background: rgba(10, 132, 255, 0.1); color: #005bb5; border: 1px solid rgba(10, 132, 255, 0.2); }
        .badge-green { background: rgba(16, 185, 129, 0.1); color: #047857; border: 1px solid rgba(16, 185, 129, 0.2); }
        .badge-gray { background: #f1f5f9; color: var(--text-secondary); border: 1px solid var(--border); }

        /* ─── Modal ─── */
        .modal-overlay {
            position: fixed; inset: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 100;
            display: flex; align-items: center; justify-content: center;
            padding: 24px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
        }
        
        .modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .modal-box {
            background: #ffffff;
            border: 1px solid var(--border-glass);
            border-radius: 20px;
            width: 100%;
            max-width: 540px;
            padding: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            transform: scale(0.95);
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .modal-overlay.active .modal-box {
            transform: scale(1);
        }

        .modal-title {
            font-family: var(--font-display);
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
            letter-spacing: -0.5px;
            margin-bottom: 24px;
        }

        /* ─── Tables ─── */
        .data-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .data-table thead th {
            padding: 14px 20px;
            font-family: 'Geist Mono', monospace;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-align: left;
            border-bottom: 1px solid var(--border);
            background: #f8fafc;
        }
        .data-table thead th:first-child { border-top-left-radius: 12px; }
        .data-table thead th:last-child { border-top-right-radius: 12px; }
        
        .data-table tbody tr {
            transition: background 0.15s ease;
        }
        .data-table tbody tr:hover { background: #f8fafc; }
        .data-table tbody td {
            padding: 16px 20px;
            font-size: 14px;
            color: var(--text-primary);
            vertical-align: middle;
            border-bottom: 1px solid var(--border-strong);
        }
        .data-table tbody tr:last-child td { border-bottom: none; }

        @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); }
            .main-wrapper { margin-left: 0; }
        }
    </style>
</head>
<body>

    <!-- Sidebar (ios-glass) -->
    <aside class="sidebar ios-glass">
        <div class="sidebar-brand">
            <div class="brand-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <h1>Portfolio Admin</h1>
            <p>Control Center</p>
        </div>

        <nav class="sidebar-nav">
            <div class="nav-section-label">Menu Utama</div>
            <a href="{{ route('admin.dashboard') }}" class="nav-item {{ Route::is('admin.dashboard') ? 'active' : '' }}">
                <svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                Dashboard
            </a>
            <a href="{{ route('admin.projects.index') }}" class="nav-item {{ Route::is('admin.projects.*') ? 'active' : '' }}">
                <svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                Kelola Proyek
            </a>
            <a href="{{ route('admin.skills.index') }}" class="nav-item {{ Route::is('admin.skills.*') ? 'active' : '' }}">
                <svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                Kelola Keahlian
            </a>
            <a href="{{ route('admin.messages.index') }}" class="nav-item {{ Route::is('admin.messages.*') ? 'active' : '' }}">
                <svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Inbox Pesan
            </a>

            <div class="nav-section-label" style="margin-top:28px;">Aksi Cepat</div>
            <a href="{{ route('portfolio.home') }}" target="_blank" class="nav-item">
                <svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Lihat Portfolio
            </a>
        </nav>

        <div class="sidebar-footer">
            <div class="user-card">
                <div class="user-avatar">{{ substr(Auth::user()->name, 0, 1) }}</div>
                <div class="user-info">
                    <div class="user-name">{{ Auth::user()->name }}</div>
                    <div class="user-role">Administrator</div>
                </div>
            </div>
            <form action="{{ route('logout') }}" method="POST">
                @csrf
                <button type="submit" class="logout-btn">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Keluar Sesi
                </button>
            </form>
        </div>
    </aside>

    <!-- Main Wrapper -->
    <div class="main-wrapper">
        <!-- Topbar -->
        <header class="topbar ios-glass">
            <div class="topbar-title">Admin <span>/ @yield('title', 'Dashboard')</span></div>
            <div class="topbar-right">
                <span class="topbar-time">{{ now()->format('H:i') }} WIB</span>
                <a href="{{ route('portfolio.home') }}" target="_blank" class="topbar-view-btn">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Buka Website
                </a>
            </div>
        </header>

        <!-- Content -->
        <main class="main-content">
            @if(session('success'))
                <div class="alert-success">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    {{ session('success') }}
                </div>
            @endif

            @if($errors->any())
                <div class="alert-error">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {{ $errors->first() }}
                </div>
            @endif

            @yield('content')
        </main>
    </div>

    <script>
        lucide.createIcons();
        
        // Modal functions
        function openModal(id) {
            const modal = document.getElementById(id);
            modal.style.display = 'flex';
            // slight delay to allow display:flex to apply before adding class for transition
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            document.body.style.overflow = 'hidden';
        }

        function closeModal(id) {
            const modal = document.getElementById(id);
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 200); // match transition duration
            document.body.style.overflow = '';
        }
    </script>
    @yield('scripts')
</body>
</html>
