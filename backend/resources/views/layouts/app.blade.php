<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Portfolio Personal yang Menarik dan Profesional dibangun dengan Laravel Terbaru.">
    <title>@yield('title', 'My Web Portfolio')</title>
    
    <!-- Google Fonts: Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Vite Assets -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #475569;
        }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white overflow-x-hidden">
    
    <!-- Navigation Bar -->
    <nav class="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <!-- Logo -->
                <div class="flex-shrink-0">
                    <a href="{{ route('portfolio.home') }}" class="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 hover:opacity-80 transition duration-300">
                        Developer.Porto
                    </a>
                </div>
                <!-- Menu Desktop -->
                <div class="hidden md:block">
                    <div class="ml-10 flex items-baseline space-x-6">
                        <a href="#home" class="text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300">Beranda</a>
                        <a href="#about" class="text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300">Tentang</a>
                        <a href="#skills" class="text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300">Keahlian</a>
                        <a href="#projects" class="text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300">Proyek</a>
                        <a href="#contact" class="text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition duration-300">Kontak</a>
                    </div>
                </div>
                <!-- Admin link (optional trigger) -->
                <div class="hidden md:block">
                    <a href="/login" class="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg transition duration-300">
                        Admin Login
                    </a>
                </div>
                <!-- Mobile menu button -->
                <div class="md:hidden">
                    <button id="mobile-menu-btn" class="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none transition duration-300">
                        <i data-lucide="menu" class="w-6 h-6"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden bg-slate-950/95 border-b border-slate-900 px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#home" class="block text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-base font-medium">Beranda</a>
            <a href="#about" class="block text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-base font-medium">Tentang</a>
            <a href="#skills" class="block text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-base font-medium">Keahlian</a>
            <a href="#projects" class="block text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-base font-medium">Proyek</a>
            <a href="#contact" class="block text-slate-300 hover:text-indigo-400 px-3 py-2 rounded-md text-base font-medium">Kontak</a>
            <a href="/login" class="block text-center mt-4 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white border border-slate-800 rounded-lg">Admin Login</a>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="pt-16">
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-slate-950 border-t border-slate-900 py-8 mt-20">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
            <p>&copy; {{ date('Y') }} Developer.Porto. Seluruh Hak Cipta Dilindungi.</p>
            <p class="mt-2 text-xs text-slate-600">Dibuat dengan Laravel {{ app()->version() }}</p>
        </div>
    </footer>

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        lucide.createIcons();

        // Mobile menu toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when links are clicked
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    </script>
</body>
</html>
