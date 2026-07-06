<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login — Portfolio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Hanken+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --bg-top: #ffffff;
            --bg-mid: #f1f5f9;
            --bg-bottom: #94a3b8;
            
            --bg-card: rgba(255, 255, 255, 0.75);
            --bg-input: #ffffff;
            
            --border: rgba(0, 0, 0, 0.08);
            --border-glass: rgba(255, 255, 255, 0.8);
            
            --accent: #0a84ff;
            --accent-glow: rgba(10, 132, 255, 0.25);
            --accent-dim: rgba(10, 132, 255, 0.1);
            
            --text-primary: #0F172A;
            --text-secondary: #475569;
            --text-muted: #64748B;
            --red: #ef4444;
            
            --font-body: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, 'Inter';
            --font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, 'Hanken Grotesk';
        }

        body {
            font-family: var(--font-body);
            background: linear-gradient(135deg, var(--bg-top) 0%, var(--bg-mid) 50%, var(--bg-bottom) 100%);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            -webkit-font-smoothing: antialiased;
            position: relative;
            overflow: hidden;
        }

        /* Ambient subtle shapes matching the light theme */
        .ambient-shape {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            pointer-events: none;
            z-index: 0;
            opacity: 0.6;
        }

        .ambient-shape-1 {
            width: 500px; height: 500px;
            background: radial-gradient(circle, rgba(10,132,255,0.15), transparent 70%);
            top: -100px; right: -150px;
            animation: drift 20s ease-in-out infinite;
        }

        .ambient-shape-2 {
            width: 400px; height: 400px;
            background: radial-gradient(circle, rgba(14,165,233,0.1), transparent 70%);
            bottom: -100px; left: -100px;
            animation: drift 15s ease-in-out infinite reverse;
        }

        @keyframes drift {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -40px) scale(1.05); }
            66% { transform: translate(-20px, 30px) scale(0.95); }
        }

        .login-card {
            position: relative;
            z-index: 1;
            background: var(--bg-card);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 48px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.06), inset 0 1px 0 var(--border-glass);
        }

        .brand-mark {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 32px;
        }

        .brand-icon {
            width: 44px; height: 44px;
            background: var(--accent-dim);
            border: 1px solid rgba(10,132,255,0.15);
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            color: var(--accent);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
        }

        .brand-text h1 {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            letter-spacing: -0.4px;
        }

        .brand-text p {
            font-family: 'Geist Mono', monospace;
            font-size: 10px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 2px;
        }

        .login-title {
            font-family: var(--font-display);
            font-size: 28px;
            font-weight: 800;
            color: var(--text-primary);
            letter-spacing: -0.8px;
            margin-bottom: 8px;
        }

        .login-sub {
            font-size: 14.5px;
            color: var(--text-secondary);
            margin-bottom: 32px;
            line-height: 1.5;
        }

        .form-group {
            margin-bottom: 18px;
        }

        .form-label {
            display: block;
            font-family: 'Geist Mono', monospace;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
        }

        .input-wrap {
            position: relative;
        }

        .input-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            display: flex;
        }

        .form-input {
            width: 100%;
            background: var(--bg-input);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 13px 14px 13px 44px;
            color: var(--text-primary);
            font-size: 14.5px;
            font-family: var(--font-body);
            transition: all 0.2s ease;
            outline: none;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
        }

        .form-input:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px rgba(10,132,255,0.15), inset 0 2px 4px rgba(0,0,0,0.01);
        }

        .form-input::placeholder { color: #94a3b8; }

        .toggle-pass {
            position: absolute;
            right: 14px;
            top: 50%; transform: translateY(-50%);
            background: none; border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 4px;
            display: flex;
            transition: color 0.15s ease;
            border-radius: 6px;
        }

        .toggle-pass:hover { 
            color: var(--text-secondary);
            background: rgba(0,0,0,0.04);
        }

        .btn-login {
            width: 100%;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            padding: 14px;
            background: var(--accent);
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 28px;
            transition: all 0.2s ease;
            letter-spacing: -0.2px;
            box-shadow: 0 4px 12px rgba(10,132,255,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .btn-login:hover {
            background: #007aff;
            box-shadow: 0 6px 16px rgba(10,132,255,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
            transform: translateY(-1px);
        }

        .btn-login:active { transform: scale(0.98); }

        .error-alert {
            background: rgba(239,68,68,0.1);
            border: 1px solid rgba(239,68,68,0.2);
            border-radius: 10px;
            padding: 12px 16px;
            margin-bottom: 24px;
            display: flex; align-items: center; gap: 10px;
            font-size: 13.5px;
            color: var(--red);
            font-weight: 500;
        }

        .back-link {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 13.5px;
            color: var(--text-muted);
            text-decoration: none;
            margin-top: 24px;
            transition: color 0.15s ease;
            width: 100%;
            justify-content: center;
            font-weight: 500;
        }

        .back-link:hover { color: var(--text-primary); }

    </style>
</head>
<body>
    <!-- Ambient Shapes -->
    <div class="ambient-shape ambient-shape-1"></div>
    <div class="ambient-shape ambient-shape-2"></div>

    <div class="login-card">
        <!-- Brand -->
        <div class="brand-mark">
            <div class="brand-icon">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div class="brand-text">
                <h1>Portfolio Admin</h1>
                <p>Control Center</p>
            </div>
        </div>

        <div class="login-title">Masuk ke Dashboard</div>
        <div class="login-sub">Masuk untuk mengelola proyek, keahlian, dan membaca pesan dari pengunjung portofolio Anda.</div>

        <!-- Error Messages -->
        @if($errors->any())
        <div class="error-alert">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ $errors->first() }}
        </div>
        @endif

        <!-- Login Form -->
        <form method="POST" action="{{ route('login.post') }}">
            @csrf

            <div class="form-group">
                <label class="form-label" for="email">Email</label>
                <div class="input-wrap">
                    <span class="input-icon">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </span>
                    <input type="email" id="email" name="email" class="form-input"
                        placeholder="admin@portfolio.com"
                        value="{{ old('email') }}"
                        required autocomplete="email" autofocus>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="password">Password</label>
                <div class="input-wrap">
                    <span class="input-icon">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input type="password" id="password" name="password" class="form-input"
                        placeholder="••••••••"
                        required autocomplete="current-password">
                    <button type="button" class="toggle-pass" onclick="togglePassword()" title="Tampilkan password">
                        <svg id="eye-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
            </div>

            <button type="submit" class="btn-login">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Masuk ke Dashboard
            </button>
        </form>

        <a href="{{ route('portfolio.home') }}" class="back-link">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Kembali ke Portofolio
        </a>
    </div>

    <script>
        function togglePassword() {
            const input = document.getElementById('password');
            const icon = document.getElementById('eye-icon');
            if (input.type === 'password') {
                input.type = 'text';
                icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
            } else {
                input.type = 'password';
                icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
            }
        }
    </script>
</body>
</html>