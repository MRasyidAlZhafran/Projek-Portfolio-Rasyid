<!DOCTYPE html>
<html class="dark" lang="id">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>EP Portfolio | Digital Experience Architect</title>
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;800;900&family=Inter:wght@300;400;500;700&family=Geist:wght@500;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#00f0ff",
                        secondary: "#7000ff",
                        surface: "#050505",
                        surfaceLight: "#121212",
                        surfaceBorder: "#1e1e1e",
                        textMain: "#ffffff",
                        textMuted: "#888888"
                    },
                    fontFamily: {
                        display: ["Hanken Grotesk", "sans-serif"],
                        body: ["Inter", "sans-serif"],
                        mono: ["Geist", "monospace"]
                    },
                    animation: {
                        'float-slow': 'float 8s ease-in-out infinite',
                        'float-fast': 'float 4s ease-in-out infinite',
                        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
                        'grid-move': 'gridMove 20s linear infinite',
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-20px)' },
                        },
                        pulseGlow: {
                            '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
                            '50%': { opacity: '1', transform: 'scale(1.05)' },
                        },
                        gridMove: {
                            '0%': { transform: 'translateY(0)' },
                            '100%': { transform: 'translateY(50px)' },
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { background-color: #050505; color: #ffffff; overflow-x: hidden; scroll-behavior: smooth; }
        
        /* Grid Background */
        .bg-grid {
            background-size: 50px 50px;
            background-image: 
                linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }

        /* Typography */
        .text-outline {
            -webkit-text-stroke: 1px rgba(255, 255, 255, 0.15);
            color: transparent;
        }
        
        .text-outline-glow {
            -webkit-text-stroke: 2px #00f0ff;
            color: transparent;
            text-shadow: 0 0 30px rgba(0, 240, 255, 0.6);
        }

        /* UI Cards */
        .glass-panel {
            background: linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(10, 10, 10, 0.9) 100%);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 20px 40px rgba(0, 0, 0, 0.8);
            position: relative;
            overflow: hidden;
        }
        
        .glass-panel::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--panel-color, #00f0ff), transparent);
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        .glass-panel:hover::before { opacity: 1; }

        /* Timeline Elements */
        .timeline-node {
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 0 0 rgba(0,240,255,0);
        }
        .timeline-node.active {
            background-color: #00f0ff;
            box-shadow: 0 0 25px 8px rgba(0,240,255,0.5);
            border-color: #fff;
            transform: scale(1.3);
        }
        
        .timeline-content {
            opacity: 0.1;
            transform: translateY(60px) rotateX(10deg);
            filter: grayscale(100%) blur(4px);
            transition: all 1s cubic-bezier(0.2, 1, 0.3, 1);
        }
        .timeline-content.active {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
            filter: grayscale(0%) blur(0px);
        }

        /* SVG Line */
        #scroll-line {
            stroke-dasharray: 10000;
            stroke-dashoffset: 10000;
            transition: stroke-dashoffset 0.1s ease-out;
        }

        /* Decorative Elements */
        .micro-text {
            font-size: 8px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            font-family: 'Geist', monospace;
            color: rgba(255,255,255,0.3);
        }
    </style>
</head>
<body class="font-body selection:bg-primary selection:text-black">

<!-- Dynamic Background Systems -->
<div class="fixed inset-0 pointer-events-none z-0">
    <div class="absolute inset-0 bg-grid opacity-30 animate-grid-move"></div>
    <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] animate-pulse-glow"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/15 blur-[150px] animate-pulse-glow" style="animation-delay: -1.5s;"></div>
</div>

<!-- Navigation -->
<nav class="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center pointer-events-none border-b border-white/5 bg-surface/50 backdrop-blur-xl">
    <div class="flex items-center gap-4 pointer-events-auto group">
        <div class="w-10 h-10 flex items-center justify-center bg-primary text-black font-display font-black text-xl rounded-sm group-hover:rotate-90 transition-transform duration-500">EP</div>
        <div class="hidden sm:block">
            <div class="font-display font-bold text-sm tracking-widest text-white leading-tight">ETHEREAL</div>
            <div class="font-mono text-[9px] text-primary tracking-widest uppercase">Precision.sys</div>
        </div>
    </div>
    
    <div class="hidden md:flex gap-8 pointer-events-auto bg-white/5 px-8 py-3 rounded-full border border-white/10">
        <a href="#about" class="font-mono text-xs uppercase tracking-[0.2em] text-white/50 hover:text-primary transition-colors flex items-center gap-2">
            <span class="w-1 h-1 rounded-full bg-white/30"></span> Visi
        </a>
        <a href="#skills" class="font-mono text-xs uppercase tracking-[0.2em] text-white/50 hover:text-primary transition-colors flex items-center gap-2">
            <span class="w-1 h-1 rounded-full bg-white/30"></span> Keahlian
        </a>
        <a href="#projects" class="font-mono text-xs uppercase tracking-[0.2em] text-white/50 hover:text-primary transition-colors flex items-center gap-2">
            <span class="w-1 h-1 rounded-full bg-white/30"></span> Karya
        </a>
        <a href="#contact" class="font-mono text-xs uppercase tracking-[0.2em] text-white/50 hover:text-primary transition-colors flex items-center gap-2">
            <span class="w-1 h-1 rounded-full bg-white/30"></span> Kontak
        </a>
    </div>
</nav>

<!-- Hero Section (Rich & Dynamic) -->
<section id="hero" class="relative min-h-[120vh] flex flex-col items-center justify-center overflow-hidden">
    <!-- Floating Tech Badges -->
    <div class="absolute inset-0 pointer-events-none z-10 hidden md:block">
        <div class="absolute top-[20%] left-[15%] glass-panel px-4 py-2 rounded-full border border-white/10 animate-float-slow">
            <span class="font-mono text-xs text-primary flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span> SYSTEM_ONLINE
            </span>
        </div>
        <div class="absolute bottom-[30%] right-[10%] glass-panel px-4 py-2 rounded-full border border-white/10 animate-float-fast" style="animation-delay: -2s;">
            <span class="font-mono text-xs text-secondary flex items-center gap-2">
                <span class="material-symbols-outlined text-[14px]">bolt</span> HIGH_PERFORMANCE
            </span>
        </div>
        <div class="absolute top-[35%] right-[20%] w-24 h-24 border border-white/5 rounded-full flex items-center justify-center animate-spin" style="animation-duration: 20s;">
            <div class="w-1 h-1 bg-white/30 rounded-full absolute top-0"></div>
            <div class="w-1 h-1 bg-white/30 rounded-full absolute bottom-0"></div>
        </div>
    </div>

    <div class="relative z-20 flex flex-col items-center justify-center text-center w-full px-6">
        <div class="micro-text mb-6 tracking-[0.5em] text-primary/70">// PORTFOLIO_V4.0.0</div>
        
        <!-- Massive Typography Layering -->
        <div class="relative font-display font-black leading-none tracking-tighter select-none w-full max-w-5xl h-[30vh] md:h-[40vh] flex items-center justify-center">
            <!-- Background Layer -->
            <h1 class="text-[16vw] md:text-[13vw] text-outline absolute top-[-5%] left-1/2 -translate-x-1/2 whitespace-nowrap opacity-30 transition-transform duration-100 ease-out z-0 filter blur-[2px]">DIGITAL</h1>
            
            <!-- Mid Layer (Solid + Glow) -->
            <h1 class="text-[14vw] md:text-[11vw] text-white relative z-10 whitespace-nowrap transition-transform duration-100 ease-out drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]" style="-webkit-text-stroke: 1px rgba(255,255,255,0.1);">EXPERIENCE</h1>
            
            <!-- Foreground Layer (Outline over Solid) -->
            <h1 class="text-[16vw] md:text-[13vw] text-outline-glow absolute bottom-[-5%] left-1/2 -translate-x-1/2 whitespace-nowrap opacity-90 transition-transform duration-100 ease-out z-20 mix-blend-screen">ARCHITECT</h1>
        </div>
        
        <!-- Stats / Quick Info Panel below Hero -->
        <div class="mt-20 flex flex-col md:flex-row items-center gap-6 glass-panel p-2 rounded-full pr-8">
            <div class="bg-white/5 rounded-full p-4 flex items-center gap-4">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-oU7hH_I3TK-IHHnTbwtveZvCvDrPJS_6wkf8llPkc70GfiVRQ-ODTAzu_bvJD3T0BgwofgYcunPO4b3_ih9QRkE338oC0kKp6OPB11phyeubRqFpSE3eUBlYujY9FHxEWWgcjm9zF7iXMSZG-5CCtmgn45I7iJkRZ7n5D9gc1-7lKDpjVC2odwtJ7e-xhIWYB-gdtKRoBvdi-MgbTRQkNjZ8BM4QfUdskmAls_bus4nXLlh1i_PQNSA8IWK_-yXdSRE4U1KNY-Uy" class="w-12 h-12 rounded-full object-cover grayscale border border-white/20">
                <div class="text-left">
                    <p class="font-display font-bold text-sm">John Doe</p>
                    <p class="micro-text text-primary">AVAILABLE FOR WORK</p>
                </div>
            </div>
            <div class="w-[1px] h-8 bg-white/10 hidden md:block"></div>
            <p class="font-body text-textMuted text-sm font-light max-w-xs text-left">
                Menghadirkan batas baru interaksi digital melalui kode presisi dan desain ultra-modern.
            </p>
        </div>
    </div>
    
    <!-- Scroll indicator -->
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-30">
        <span class="font-mono text-[10px] uppercase tracking-widest text-primary animate-pulse">Initialize Scroll</span>
        <div class="w-[2px] h-16 bg-white/10 relative overflow-hidden rounded-full">
            <div class="w-full h-1/3 bg-gradient-to-b from-primary to-transparent absolute top-0 left-0 animate-[gridMove_2s_linear_infinite]"></div>
        </div>
    </div>
</section>

<!-- Main Container with Timeline -->
<div class="relative max-w-7xl mx-auto px-8 py-32 overflow-visible" id="timeline-container">
    <!-- Center Line SVG (Now with glowing nodes and complex track) -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full pointer-events-none hidden md:block z-0">
        <!-- Dashed Background track -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-white/20 border-l border-dashed border-white/20"></div>
        <!-- Active glowing line -->
        <svg class="absolute top-0 left-1/2 -translate-x-1/2 w-[6px] h-full overflow-visible" preserveAspectRatio="none">
            <!-- Glow layer -->
            <line x1="3" y1="0" x2="3" y2="100%" stroke="#00f0ff" stroke-width="4" id="scroll-line-glow" stroke-linecap="round" opacity="0.4" filter="drop-shadow(0 0 15px rgba(0,240,255,1))"/>
            <!-- Core layer -->
            <line x1="3" y1="0" x2="3" y2="100%" stroke="#ffffff" stroke-width="2" id="scroll-line" stroke-linecap="round"/>
        </svg>
    </div>

    <div class="space-y-64 relative z-10">
        
        <!-- About Section (Left) -->
        <section id="about" class="flex flex-col md:flex-row items-center w-full section-block relative">
            <div class="w-full md:w-1/2 md:pr-32 text-left md:text-right flex flex-col md:items-end timeline-content">
                <div class="glass-panel p-10 rounded-3xl w-full hover:-translate-y-2 transition-transform duration-500" style="--panel-color: #00f0ff;">
                    <div class="flex justify-between items-start mb-8 md:flex-row-reverse">
                        <span class="font-mono text-xs text-primary uppercase tracking-[0.3em] bg-primary/10 px-4 py-2 rounded-full border border-primary/20">// 01. Visi</span>
                        <div class="micro-text text-left md:text-right">SYS.MODULE.ABOUT<br>INITIATED</div>
                    </div>
                    
                    <h2 class="font-display font-black text-4xl md:text-5xl mb-6 leading-tight">Mendefinisikan<br>Ulang <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 text-outline-glow">Batas.</span></h2>
                    
                    <p class="font-body text-textMuted font-light text-base md:text-lg mb-8">
                        Desain bukan hanya tentang tampilan, tapi bagaimana sebuah sistem berkomunikasi dengan manusia. Saya membangun antarmuka yang bersih, cepat, dan intuitif yang ditenagai oleh logika kompleks.
                    </p>

                    <!-- Rich Stat Bar -->
                    <div class="flex items-center gap-6 justify-start md:justify-end border-t border-white/10 pt-6 mt-6">
                        <div class="text-left md:text-right">
                            <div class="font-display font-bold text-3xl text-white">50+</div>
                            <div class="font-mono text-[10px] text-textMuted uppercase tracking-widest">Projek Global</div>
                        </div>
                        <div class="w-[1px] h-10 bg-white/10"></div>
                        <div class="text-left md:text-right">
                            <div class="font-display font-bold text-3xl text-white">5<span class="text-primary text-xl">Thn</span></div>
                            <div class="font-mono text-[10px] text-textMuted uppercase tracking-widest">Pengalaman</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Tech Node -->
            <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-md rotate-45 border border-white/20 bg-surface timeline-node items-center justify-center">
                <div class="w-3 h-3 rounded-sm bg-white/50 -rotate-45 transition-colors duration-300" id="node-inner-1"></div>
            </div>
            
            <div class="w-full md:w-1/2 md:pl-32 hidden md:block">
                <!-- Decorative Hologram Graphic -->
                <div class="w-full h-full min-h-[300px] border border-white/5 rounded-3xl relative overflow-hidden flex items-center justify-center opacity-30 timeline-content">
                    <div class="w-48 h-48 rounded-full border border-primary/40 animate-spin" style="animation-duration: 30s;"></div>
                    <div class="w-32 h-32 rounded-full border border-secondary/40 animate-spin absolute" style="animation-duration: 20s; animation-direction: reverse;"></div>
                    <div class="micro-text absolute bottom-4 right-4">OBJ_RENDER_01</div>
                </div>
            </div>
        </section>

        <!-- Skills Section (Right) -->
        <section id="skills" class="flex flex-col md:flex-row items-center w-full section-block relative">
            <div class="w-full md:w-1/2 md:pr-32 hidden md:block">
                <!-- Decorative Graphic -->
                 <div class="w-full h-full min-h-[300px] border border-white/5 rounded-3xl relative overflow-hidden p-8 opacity-30 timeline-content flex flex-col justify-between">
                    <div class="micro-text">SYS.DIAGNOSTIC.RUNNING</div>
                    <div class="space-y-4">
                        <div class="w-full h-1 bg-white/10 overflow-hidden"><div class="w-3/4 h-full bg-primary animate-pulse"></div></div>
                        <div class="w-full h-1 bg-white/10 overflow-hidden"><div class="w-1/2 h-full bg-secondary animate-pulse" style="animation-delay: 1s;"></div></div>
                        <div class="w-full h-1 bg-white/10 overflow-hidden"><div class="w-5/6 h-full bg-white animate-pulse" style="animation-delay: 0.5s;"></div></div>
                    </div>
                </div>
            </div>
            
            <!-- Tech Node -->
            <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-md rotate-45 border border-white/20 bg-surface timeline-node items-center justify-center">
                <div class="w-3 h-3 rounded-sm bg-white/50 -rotate-45 transition-colors duration-300" id="node-inner-2"></div>
            </div>
            
            <div class="w-full md:w-1/2 md:pl-32 mt-16 md:mt-0 text-left timeline-content">
                <div class="glass-panel p-10 rounded-3xl w-full hover:-translate-y-2 transition-transform duration-500" style="--panel-color: #7000ff;">
                    <div class="flex justify-between items-start mb-8">
                        <span class="font-mono text-xs text-secondary uppercase tracking-[0.3em] bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">// 02. Keahlian</span>
                        <div class="micro-text text-right">SYS.MODULE.SKILLS<br>LOADED</div>
                    </div>
                    
                    <h2 class="font-display font-black text-4xl md:text-5xl mb-8">Senjata<br>Pilihan.</h2>
                    
                    <!-- Rich Skill Bars -->
                    <div class="space-y-6">
                        <div class="group">
                            <div class="flex justify-between font-mono text-xs mb-2">
                                <span class="text-white">FRONTEND ARCHITECTURE</span>
                                <span class="text-primary group-hover:text-white transition-colors">95%</span>
                            </div>
                            <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-primary/50 to-primary w-[95%] relative">
                                    <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="group">
                            <div class="flex justify-between font-mono text-xs mb-2">
                                <span class="text-white">UI/UX ENGINEERING</span>
                                <span class="text-secondary group-hover:text-white transition-colors">90%</span>
                            </div>
                            <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-secondary/50 to-secondary w-[90%] relative">
                                    <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="group">
                            <div class="flex justify-between font-mono text-xs mb-2">
                                <span class="text-white">INTERACTIVE ANIMATION</span>
                                <span class="text-primary group-hover:text-white transition-colors">85%</span>
                            </div>
                            <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-white/50 to-white w-[85%] relative">
                                    <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Projects Section (Left) -->
        <section id="projects" class="flex flex-col md:flex-row items-center w-full section-block relative">
            <div class="w-full md:w-1/2 md:pr-32 text-left md:text-right flex flex-col md:items-end timeline-content">
                <span class="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-4">// 03. Karya Terpilih</span>
                <h2 class="font-display font-black text-4xl md:text-5xl mb-8">Arsip Visual.</h2>
                
                <div class="w-full aspect-[4/3] rounded-3xl overflow-hidden glass-panel relative group p-2 hover:border-primary/50 transition-colors duration-500">
                    <div class="absolute top-4 left-4 z-20 flex gap-2">
                        <div class="w-2 h-2 rounded-full bg-red-500"></div>
                        <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    
                    <div class="w-full h-full rounded-2xl overflow-hidden relative">
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 z-10"></div>
                        <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay"></div>
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3M8ttCX2me1CZc370kXYrxuFkAy3TpGFcJXf_91xFnpsMFKu0pwHHk5_Mqey2iDpSJq1qEEu5kzlF0ZtwL92yoXhPiaNcMbLeV7ASG0QfEYh-nW2faQNkJkaUyVA_WhiTTXoQIfUjbqn8smv6vWPvnZZ6vof9GpjFYBA6l02nFJ68XWajtWWskVKXnkKUBwxw_Z-8qg6m7SajMzpI5NSKKM_u3KDMMR4rapQHp_d_GETmYW9tG69gGSmAWGu5BBuRgxngzA6Lq5dX" class="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700">
                        
                        <div class="absolute bottom-6 left-6 md:left-auto md:right-6 z-20 text-left md:text-right">
                            <h3 class="font-display font-bold text-3xl text-white mb-2">NeoVault</h3>
                            <div class="flex gap-2 justify-start md:justify-end">
                                <span class="font-mono text-[9px] uppercase tracking-widest text-primary border border-primary/30 bg-primary/10 px-2 py-1 rounded">Fintech</span>
                                <span class="font-mono text-[9px] uppercase tracking-widest text-white border border-white/30 bg-white/10 px-2 py-1 rounded">React</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Tech Node -->
            <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-md rotate-45 border border-white/20 bg-surface timeline-node items-center justify-center">
                <div class="w-3 h-3 rounded-sm bg-white/50 -rotate-45 transition-colors duration-300" id="node-inner-3"></div>
            </div>
            
            <div class="w-full md:w-1/2 md:pl-32 hidden md:block">
                 <div class="micro-text text-left timeline-content opacity-30 mt-20">
                     DATA_STREAM_01: [██████████░░]<br>
                     DATA_STREAM_02: [██████░░░░░░]<br>
                     > WAITING FOR USER INPUT...
                 </div>
            </div>
        </section>

        <!-- Contact Section (Right) -->
        <section id="contact" class="flex flex-col md:flex-row items-center w-full section-block relative pb-32">
            <div class="w-full md:w-1/2 md:pr-32 hidden md:block"></div>
            <!-- Tech Node -->
            <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-md rotate-45 border border-white/20 bg-surface timeline-node items-center justify-center">
                <div class="w-3 h-3 rounded-sm bg-white/50 -rotate-45 transition-colors duration-300" id="node-inner-4"></div>
            </div>
            
            <div class="w-full md:w-1/2 md:pl-32 mt-16 md:mt-0 text-left timeline-content">
                <div class="glass-panel p-10 rounded-3xl w-full border border-white/20" style="--panel-color: #ffffff;">
                    <span class="font-mono text-xs text-white uppercase tracking-[0.3em] mb-4 block">// 04. Hubungi</span>
                    <h2 class="font-display font-black text-4xl md:text-5xl mb-6">Mulai<br>Percakapan.</h2>
                    <p class="font-body text-textMuted font-light text-base md:text-lg mb-8">
                        Jaringan selalu aktif. Terbuka untuk kesempatan kolaborasi baru dan tantangan teknis kelas dunia.
                    </p>
                    
                    <a href="mailto:hello@ethereal.id" class="group relative inline-flex items-center justify-center gap-4 bg-white text-black px-8 py-4 rounded-full font-display font-bold transition-all duration-300 overflow-hidden w-full sm:w-auto">
                        <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span class="relative flex items-center gap-4 group-hover:text-white transition-colors duration-300">
                            Kirim Transmisi
                            <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </span>
                    </a>
                </div>
            </div>
        </section>

    </div>
</div>

<footer class="border-t border-white/10 py-12 text-center text-white/30 font-mono text-xs relative z-10 bg-surface">
    <div class="flex flex-col items-center justify-center gap-4">
        <div class="flex gap-1">
            <div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div class="w-2 h-2 bg-secondary rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
            <div class="w-2 h-2 bg-white rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
        </div>
        © 2024 Ethereal Precision. All systems operational.
    </div>
</footer>

<script>
    // 1. Dynamic Scroll Line Connection (Complex version)
    const line = document.getElementById('scroll-line');
    const lineGlow = document.getElementById('scroll-line-glow');
    const container = document.getElementById('timeline-container');
    
    function updateLineHeight() {
        if(container && line) {
            const height = container.getBoundingClientRect().height;
            line.parentElement.style.height = height + 'px';
            line.setAttribute('y2', height);
            lineGlow.setAttribute('y2', height);
            
            line.style.strokeDasharray = height;
            line.style.strokeDashoffset = height;
            lineGlow.style.strokeDasharray = height;
            lineGlow.style.strokeDashoffset = height;
            return height;
        }
        return 0;
    }
    
    let pathLength = updateLineHeight();
    window.addEventListener('resize', () => { pathLength = updateLineHeight(); });

    // Scroll Logic for Line Drawing and Node Activation
    const sections = document.querySelectorAll('.section-block');
    const navLinks = document.querySelectorAll('nav a');

    window.addEventListener('scroll', () => {
        // Draw Line
        if (container && line) {
            const rect = container.getBoundingClientRect();
            // Start drawing line slightly earlier
            const scrollPoint = (window.innerHeight / 1.5) - rect.top;
            const scrollPercent = Math.max(0, Math.min(1, scrollPoint / rect.height));
            
            const offset = pathLength - (pathLength * scrollPercent);
            line.style.strokeDashoffset = offset;
            lineGlow.style.strokeDashoffset = offset;
        }

        // Activate Nodes and Content
        const triggerPoint = window.innerHeight * 0.7; // Trigger when element is 70% down
        
        let currentNav = '';

        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const node = section.querySelector('.timeline-node');
            const innerNode = section.querySelector(`#node-inner-${index+1}`);
            const content = section.querySelectorAll('.timeline-content');
            
            if (rect.top < triggerPoint) {
                if (node) {
                    node.classList.add('active');
                    if(innerNode) innerNode.classList.replace('bg-white/50', 'bg-black');
                }
                content.forEach(c => c.classList.add('active'));
                currentNav = section.getAttribute('id');
            } else {
                if (node) {
                    node.classList.remove('active');
                    if(innerNode) innerNode.classList.replace('bg-black', 'bg-white/50');
                }
                content.forEach(c => c.classList.remove('active'));
            }
        });

        // Update Nav Menu
        navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === currentNav) {
                link.classList.remove('text-white/50');
                link.classList.add('text-primary');
            } else {
                link.classList.remove('text-primary');
                link.classList.add('text-white/50');
            }
        });
    });
    
    window.dispatchEvent(new Event('scroll'));

    // Ultra-Modern Hero Kinetic Mouse Move Effect
    const hero = document.getElementById('hero');
    if(window.innerWidth > 768) {
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 60;
            const y = (e.clientY / window.innerHeight - 0.5) * 60;
            
            const texts = hero.querySelectorAll('h1');
            if(texts.length >= 3) {
                texts[0].style.transform = `translate(calc(-50% + ${x*2}px), ${y*2}px) skewX(${x*0.1}deg)`; 
                texts[1].style.transform = `translate(${x*0.5}px, ${y*0.5}px)`; 
                texts[2].style.transform = `translate(calc(-50% + ${-x*2}px), ${-y*2}px) skewX(${-x*0.1}deg)`; 
            }
        });
        
        hero.addEventListener('mouseleave', () => {
            const texts = hero.querySelectorAll('h1');
            if(texts.length >= 3) {
                texts[0].style.transform = `translate(-50%, 0) skewX(0)`;
                texts[1].style.transform = `translate(0, 0)`;
                texts[2].style.transform = `translate(-50%, 0) skewX(0)`;
            }
        });
    }
</script>

</body>
</html>