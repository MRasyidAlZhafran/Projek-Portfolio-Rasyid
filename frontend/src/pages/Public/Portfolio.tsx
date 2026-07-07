import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useAnimationFrame, useScroll, useTransform, animate } from 'framer-motion';

// --- Komponen Ripple Effect (Efek Air) ---
const RippleEffect = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newRipple = { x, y, id: Date.now() };
        setRipples((prev) => [...prev, newRipple]);

        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 600);
    };

    return (
        <div className={`relative overflow-hidden w-full h-full ${className}`} onPointerDown={addRipple}>
            {children}
            {ripples.map((r) => (
                <span
                    key={r.id}
                    className="ripple"
                    style={{ left: r.x, top: r.y, width: 100, height: 100, marginLeft: -50, marginTop: -50 }}
                />
            ))}
        </div>
    );
};

// Global mouse tracker for synchronized spotlight and cursor
const globalMouse = { x: -1000, y: -1000 };
if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
        globalMouse.x = e.clientX;
        globalMouse.y = e.clientY;
    });
}
let pacmanEatFlash = 0;
// let pacmanAngle = 0; // Unused
const pacmanPos = { x: 0, y: 0 };
let isPacmanActive = false;
let pacmanExplodeTimer = 0;
let pacmanShakeIntensity = 0;
let pacmanBurstParticles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
let pacmanResetRing = 0;
let orbitTargetPos = { x: 0, y: 0 };

// --- Morphing Cursor & Wave (One Global Canvas) ---
const MorphingCursor = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    useEffect(() => {
        if (isTouchDevice) return;
        const canvas = canvasRef.current;
        const ring = ringRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let W = window.innerWidth;
        let H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;

        const handleResize = () => {
            W = window.innerWidth; H = window.innerHeight;
            canvas.width = W; canvas.height = H;
        };
        window.addEventListener('resize', handleResize);

        let dot = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let prevMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        // Target state for wave
        let targetRect = { x: 0, y: 0, w: 0, h: 0 };
        let targetEl: HTMLElement | null = null;
        let state: 'normal' | 'snapped' | 'tearing' | 'grow' | 'pacman' = 'normal';
        let progress = 0; // Untuk tombol snap
        let growProgress = 0; // Khusus untuk efek hover gambar (Cincin Orbital)
        let pacmanProgress = 0; // Khusus untuk Pacman
        let cardRects: DOMRect[] = [];

        const handleScroll = () => {
            const cards = document.querySelectorAll('#tentang .grid > div');
            cardRects = Array.from(cards).map(el => el.getBoundingClientRect());
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

        let rafId: number;
        let time = 0;

        const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

        const handleSnapChange = (e: Event) => {
            const detail = (e as CustomEvent).detail;

            // BUG FIX 3: Jangan biarkan kursor ngerasukin satelit saat masa recovery 2 detik
            if ((window as any).cursorRecoverDelay && (window as any).cursorRecoverDelay > 0) {
                // Biarkan state normal (jangan snapped/pacman)
                state = 'normal';
                targetEl = null;
                return;
            }

            if (detail.snapped) {
                // Mencegah ngerasukin satelit yang baru saja dimakan secara instan pasca ledakan
                if ((window as any).blockSnapElement && (window as any).blockSnapElement === detail.el) {
                    return;
                }

                // BUG FIX 1: Guard agar state Pacman tidak tertimpa oleh hover tombol biasa
                if (isPacmanActive && detail.mode !== 'pacman') return;

                state = detail.mode || 'snapped';
                targetEl = detail.el as HTMLElement | null;
                if (targetEl) {
                    const rect = targetEl.getBoundingClientRect();
                    const w = targetEl.offsetWidth || rect.width;
                    const h = targetEl.offsetHeight || rect.height;
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    targetRect = { x: cx - w / 2, y: cy - h / 2, w, h };
                }
            } else {
                // Bebaskan blokir snap jika mouse meninggalkan elemen tersebut
                if ((window as any).blockSnapElement && (window as any).blockSnapElement === detail.el) {
                    (window as any).blockSnapElement = null;
                }

                // BUG FIX 1: Guard agar tidak reset ke normal kecuali karena ledakan
                if (isPacmanActive && !detail.fromExplode) return;

                state = 'normal';
                targetEl = null;
            }
        };
        window.addEventListener('cursor-snap-change', handleSnapChange);

        const render = () => {
            if (!ctx || !canvas) return;
            time += 0.05;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update posisi targetRect secara real-time agar menempel meski di-scroll
            if (targetEl && state === 'snapped') {
                const rect = targetEl.getBoundingClientRect();
                const w = targetEl.offsetWidth || rect.width;
                const h = targetEl.offsetHeight || rect.height;
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                targetRect = { x: cx - w / 2, y: cy - h / 2, w, h };
            }

            // Update dot positions with different stickiness based on state
            let targetX = globalMouse.x;
            let targetY = globalMouse.y;

            if (state === 'snapped') {
                const btnCx = targetRect.x + targetRect.w / 2;
                const btnCy = targetRect.y + targetRect.h / 2;

                // Kembalikan efek parallax agar kursor (glow biru) ikut bergerak selaras
                const pullStrength = 0.15;
                targetX = btnCx + (globalMouse.x - btnCx) * pullStrength;
                targetY = btnCy + (globalMouse.y - btnCy) * pullStrength;
            }

            // Kecepatan gerak (smooth follow)
            // BUG FIX: Freeze kursor saat mau meledak (pre-explode) atau sedang delay reset
            if (pacmanExplodeTimer > 0 || ((window as any).cursorRecoverDelay && (window as any).cursorRecoverDelay > 0)) {
                // Jangan update dot.x dan dot.y, biarkan membeku di posisi terakhir
            } else {
                dot.x = lerp(dot.x, targetX, 0.2);
                dot.y = lerp(dot.y, targetY, 0.2);
            }
            pacmanPos.x = dot.x;
            pacmanPos.y = dot.y;

            // Progress kursor
            progress = lerp(progress, state === 'snapped' ? 1 : 0, 0.15);
            growProgress = lerp(growProgress, state === 'grow' ? 1 : 0, 0.1);
            pacmanProgress = lerp(pacmanProgress, state === 'pacman' ? 1 : 0, 0.15);
            const easedPacman = 1 - Math.pow(1 - pacmanProgress, 3);

            // Dynamic Z-Index (diturunkan ke 100 agar snap effect ada di atas tombol dan navbar)
            if (canvas.style) {
                canvas.style.zIndex = "100";
                canvas.style.mixBlendMode = "difference";
            }

            // Screen shake
            if (pacmanShakeIntensity > 0.5) {
                const sx = (Math.random() - 0.5) * pacmanShakeIntensity * 5;
                const sy = (Math.random() - 0.5) * pacmanShakeIntensity * 5;
                canvas.style.transform = `translate(${sx}px, ${sy}px)`;
                pacmanShakeIntensity *= 0.93;
            } else if (canvas.style.transform) {
                canvas.style.transform = '';
                pacmanShakeIntensity = 0;
            }

            const cx = dot.x;
            const cy = dot.y;

            // Hitung rotasi elemen snap (jika ada transform pada parent seperti menu nav)
            let targetRotation = 0;
            if (targetEl && state === 'snapped') {
                const rotatedParent = targetEl.closest('nav, .rotated-container') || targetEl;
                const style = window.getComputedStyle(rotatedParent);
                const transform = style.transform;
                if (transform && transform !== 'none') {
                    try {
                        const values = transform.split('(')[1].split(')')[0].split(',');
                        const a = parseFloat(values[0]);
                        const b = parseFloat(values[1]);
                        targetRotation = Math.atan2(b, a);
                    } catch (err) {
                        targetRotation = 0;
                    }
                }
            }

            // --- 1. MENGGAMBAR KURSOR SNAP (MAGNETIK TOMBOL + WAVE OMBAG) ---
            if (progress > 0.001) {
                const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                const wave = eased + Math.sin(eased * Math.PI * 3.5) * 0.1 * (1 - eased);

                const targetW = targetRect.w + 12;
                const targetH = targetRect.h + 12;
                const w = lerp(32, targetW, wave);
                const h = lerp(32, targetH, wave);
                const cornerRadius = lerp(16, targetRect.h / 2 + 6, wave);

                const r = 245;
                const g = 123;
                const b = 0;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(targetRotation); // Miringkan kursor agar selaras dengan rotasi tombol navigasi!

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${lerp(1, 0.3, eased)})`;
                ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${lerp(0, 0.8, eased)})`;
                ctx.shadowBlur = lerp(0, 20, eased);

                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(-w / 2, -h / 2, w, h, cornerRadius);
                } else {
                    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
                }
                ctx.fill();
                ctx.restore();

                // Ripple ring on snap start
                if (ring && state === 'snapped' && eased > 0.02 && eased < 0.3) {
                    const ringProgress = (eased - 0.02) / 0.28;
                    const ringSize = ringProgress * 80;
                    ring.style.left = `${cx - ringSize / 2}px`;
                    ring.style.top = `${cy - ringSize / 2}px`;
                    ring.style.width = `${ringSize}px`;
                    ring.style.height = `${ringSize}px`;
                    ring.style.opacity = `${0.4 * (1 - ringProgress)}`;
                    ring.style.display = 'block';
                } else if (ring && (eased >= 0.3 || progress < 0.01)) {
                    ring.style.display = 'none';
                }
            }

            // --- 2. MENGGAMBAR KURSOR ORBITAL / X-RAY LENS (HOVER GAMBAR KARYA) ---
            if (growProgress > 0.001) {
                const eased = growProgress < 0.5 ? 2 * growProgress * growProgress : 1 - Math.pow(-2 * growProgress + 2, 2) / 2;

                ctx.save();
                const ringRadius = lerp(16, 50, eased); // Radius diperkecil dari 120px ke 75px agar lebih presisi
                const ringAlpha = lerp(0, 0.9, eased);

                // Hitung velocity untuk Jiggle Effect (Stretch/Goyangan)
                const dx = globalMouse.x - prevMouse.x;
                const dy = globalMouse.y - prevMouse.y;
                const velocity = Math.sqrt(dx * dx + dy * dy);
                const angleVel = Math.atan2(dy, dx);

                // Jika mouse bergerak cepat, HUD akan sedikit memanjang/jiggle ke arah gerak
                const jiggleStretch = 1 + Math.min(velocity * 0.01, 0.2);
                const jiggleSquash = Math.max(1 - velocity * 0.01, 0.8);

                ctx.translate(cx, cy);

                // Aplikasikan Jiggle Stretch (hanya aktif jika mouse bergerak)
                if (velocity > 0.5) {
                    ctx.rotate(angleVel);
                    ctx.scale(jiggleStretch, jiggleSquash);
                    ctx.rotate(-angleVel); // Kembalikan putaran agar HUD tidak ikutan terlempar posisinya
                }

                ctx.rotate(time * 0.8); // Kursor berputar secara konstan dan bebas

                // Cincin Luar (Garis Putus-putus berputar)
                ctx.beginPath();
                ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
                ctx.lineWidth = 2;
                if (ctx.setLineDash) ctx.setLineDash([15, 25]);
                ctx.stroke();

                // Cincin Dalam (Solid, Tipis, warna Oranye agar terinvert Biru)
                ctx.beginPath();
                ctx.arc(0, 0, ringRadius - 8, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(245, 123, 0, ${ringAlpha})`;
                ctx.lineWidth = 1;
                if (ctx.setLineDash) ctx.setLineDash([]);
                ctx.stroke();

                // Crosshair HUD Target di Keempat Sisi
                for (let i = 0; i < 4; i++) {
                    ctx.save();
                    ctx.rotate((i * Math.PI) / 2);
                    ctx.beginPath();
                    ctx.moveTo(ringRadius - 5, 0);
                    ctx.lineTo(ringRadius + 15, 0);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    ctx.restore();
                }

                ctx.restore();
            }

            // --- 3. MENGGAMBAR TITIK KURSOR NORMAL (Di tengah cincin atau saat normal) ---
            const isRecovering = (window as any).cursorRecoverDelay && (window as any).cursorRecoverDelay > 0;
            if (progress < 0.99) {
                const dx = globalMouse.x - dot.x;
                const dy = globalMouse.y - dot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                const stretchMultiplier = state === 'tearing' ? 0.015 : 0.005;
                const maxStretch = state === 'tearing' ? 4 : 1.8;

                // Wave oscillation pada stretch saat tearing
                const waveStretch = state === 'tearing' ? 1 + Math.sin(time * 8) * 0.15 : 1;
                const stretch = Math.min(1 + distance * stretchMultiplier, maxStretch) * waveStretch;
                const squash = Math.max(1 - distance * stretchMultiplier, 0.4) / waveStretch;

                // Normal dot (or shrinking dot during transition)
                let dotAlpha = 1 - Math.max(progress, growProgress * 0.5, easedPacman); // Hilang saat pacman
                let recoveryScale = 1;

                if (isRecovering) {
                    const recoverProgress = 1 - (window as any).cursorRecoverDelay / 120; // 0 -> 1

                    // Kurva membal elastis (Spring Overshoot)
                    recoveryScale = 1 - Math.pow(1 - recoverProgress, 3) + Math.sin(recoverProgress * Math.PI * 2.5) * Math.exp(-recoverProgress * 3.5) * 0.25;

                    // Efek kedipan holografik (Holographic flicker)
                    const flicker = (Math.random() - 0.5) * 0.15 * (1 - recoverProgress);
                    dotAlpha = Math.min(1, Math.max(0, recoverProgress + flicker));
                }

                // Shrink out instead of just fading to prevent overlap saturn effect
                const transitionShrink = 1 - Math.max(progress, growProgress);

                let dotSize = 16 * transitionShrink;
                if (state === 'pacman' && easedPacman > 0.001) {
                    const m = easedPacman;
                    const pulse = 1 + Math.sin(m * Math.PI * 2) * Math.exp(-m * 5) * 0.35;
                    const pulsed = 16 * pulse;
                    const shrink = Math.max(0, (m - 0.2) / 0.8);
                    dotSize = lerp(pulsed, 4, Math.min(1, shrink * 1.8));

                    if (m > 0.05 && m < 0.5) {
                        const rt = (m - 0.05) / 0.45;
                        ctx.beginPath();
                        ctx.arc(dot.x, dot.y, 16 + rt * 28, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(255, 255, 200, ${(1 - rt) * 0.5})`;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }

                if (dotAlpha > 0.01 && dotSize > 0.1) {
                    ctx.save();
                    ctx.translate(dot.x, dot.y);
                    ctx.rotate(angle);
                    ctx.beginPath();

                    // Titik warna canvas oranye (invert dari biru)
                    const dotR = 245;
                    const dotG = 123;
                    const dotB = 0;

                    ctx.ellipse(0, 0, dotSize * stretch * recoveryScale, dotSize * squash * recoveryScale, 0, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${dotR}, ${dotG}, ${dotB}, ${dotAlpha})`;
                    ctx.fill();
                    ctx.restore();
                }
            }

            // --- 4. MENGGAMBAR PACMAN (EASTER EGG) ---
            if (pacmanProgress > 0.001 && pacmanExplodeTimer >= 0 && isPacmanActive) {
                const pacmanSize = lerp(16, 24, easedPacman);
                const rawDx = globalMouse.x - prevMouse.x;
                const rawDy = globalMouse.y - prevMouse.y;

                const smooth = 0.25;
                if ((window as any).pacmanSmoothDx === undefined) {
                    (window as any).pacmanSmoothDx = rawDx;
                    (window as any).pacmanSmoothDy = rawDy;
                }
                (window as any).pacmanSmoothDx += (rawDx - (window as any).pacmanSmoothDx) * smooth;
                (window as any).pacmanSmoothDy += (rawDy - (window as any).pacmanSmoothDy) * smooth;

                const svx = (window as any).pacmanSmoothDx;
                const svy = (window as any).pacmanSmoothDy;
                const hasMovement = Math.abs(svx) > 0.01 || Math.abs(svy) > 0.01;
                const angle = hasMovement
                    ? Math.atan2(svy, svx)
                    : ((window as any).lastPacmanAngle || 0);
                (window as any).lastPacmanAngle = angle;
                // pacmanAngle = angle;

                const velocity = Math.sqrt(svx * svx + svy * svy);
                (window as any).pacmanAnimTime = ((window as any).pacmanAnimTime || 0) + 0.4 + (velocity * 0.08);

                const mouthMv = Math.abs(Math.sin((window as any).pacmanAnimTime));

                const maxMouthOpen = 0.75 + 0.15 * mouthMv;
                let chompScale = 0;
                if (pacmanEatFlash > 0) {
                    const t = 1 - pacmanEatFlash / 10;
                    chompScale = Math.sin(t * Math.PI) * 0.9;
                    pacmanEatFlash--;
                }
                const finalMouthOpen = maxMouthOpen * easedPacman * (1 - chompScale);
                const mouthAngle = 0.01 + finalMouthOpen;

                const morphScale = 1 + Math.sin(easedPacman * Math.PI * 1.5) * 0.12 * Math.exp(-easedPacman * 3);

                ctx.save();
                ctx.translate(dot.x, dot.y);
                ctx.rotate(angle);

                const stretch = 1 + (mouthMv * 0.35 * easedPacman);
                const squash = 1 - (mouthMv * 0.25 * easedPacman);
                ctx.scale(stretch * morphScale, squash * morphScale);

                ctx.beginPath();
                ctx.arc(0, 0, pacmanSize, mouthAngle, Math.PI * 2 - mouthAngle);
                ctx.lineTo(0, 0);
                ctx.closePath();

                let pacmanAlpha = easedPacman;
                if (cardRects.length > 0) {
                    const px = dot.x, py = dot.y;
                    const insideCard = cardRects.some(r =>
                        px >= r.left && px <= r.right && py >= r.top && py <= r.bottom
                    );
                    if (insideCard) pacmanAlpha *= 0.2;
                }
                ctx.fillStyle = `rgba(0, 0, 255, ${pacmanAlpha})`;
                ctx.fill();
                ctx.restore();

                // Pre-explode glitch
                if (pacmanExplodeTimer > 0) {
                    const glitchProgress = 1 - pacmanExplodeTimer / 60;
                    for (let i = 0; i < 4; i++) {
                        ctx.save();
                        ctx.translate(
                            dot.x + (Math.random() - 0.5) * 14 * (1 + glitchProgress),
                            dot.y + (Math.random() - 0.5) * 14 * (1 + glitchProgress)
                        );
                        ctx.rotate(angle + (Math.random() - 0.5) * 0.4);
                        ctx.globalAlpha = 0.15 + glitchProgress * 0.25;
                        ctx.beginPath();
                        ctx.arc(0, 0, pacmanSize, mouthAngle, Math.PI * 2 - mouthAngle);
                        ctx.lineTo(0, 0);
                        ctx.closePath();
                        ctx.fillStyle = `rgba(0, 100, 255, 0.5)`;
                        ctx.fill();
                        ctx.restore();
                    }
                    for (let i = 0; i < 6; i++) {
                        const ca = Math.random() * Math.PI * 2;
                        const cl = 6 + Math.random() * 18 * glitchProgress;
                        ctx.beginPath();
                        ctx.moveTo(dot.x, dot.y);
                        ctx.lineTo(dot.x + Math.cos(ca) * cl, dot.y + Math.sin(ca) * cl);
                        ctx.strokeStyle = `rgba(200, 220, 255, ${0.2 + glitchProgress * 0.5})`;
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                    pacmanExplodeTimer--;
                    if (pacmanExplodeTimer === 0) {
                        const ex = dot.x, ey = dot.y;
                        for (let i = 0; i < 50; i++) {
                            const a = Math.random() * Math.PI * 2;
                            const s = 2 + Math.random() * 7;
                            pacmanBurstParticles.push({
                                x: ex, y: ey,
                                vx: Math.cos(a) * s,
                                vy: Math.sin(a) * s,
                                life: Math.floor(25 + Math.random() * 15),
                            });
                        }
                        pacmanExplodeTimer = -1;
                        pacmanShakeIntensity = 10;
                        (window as any).flashIntensity = 1.0; // Trigger Flashbang

                        // Set delay 2 detik pemulihan satelit & kursor bulat sejak awal ledakan
                        (window as any).cursorRecoverDelay = 120;
                    }
                }
            }

            // --- 5. EXPLODE BURST & RESET ---
            if (pacmanExplodeTimer < 0) {
                for (let i = pacmanBurstParticles.length - 1; i >= 0; i--) {
                    const p = pacmanBurstParticles[i];
                    p.x += p.vx; p.y += p.vy;
                    p.vx *= 0.96; p.vy *= 0.96;
                    p.life--;
                    if (p.life <= 0) { pacmanBurstParticles.splice(i, 1); continue; }

                    // Gravity Reassembly: Tarik kembali partikel ke pusat ledakan (orbitTargetPos) saat umurnya menipis
                    if (p.life < 16 && orbitTargetPos.x !== 0 && orbitTargetPos.y !== 0) {
                        const dx = orbitTargetPos.x - p.x;
                        const dy = orbitTargetPos.y - p.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist > 2) {
                            const pullForce = (16 - p.life) * 0.15; // gaya gravitasi menguat seiring p.life menipis
                            p.vx += (dx / dist) * pullForce;
                            p.vy += (dy / dist) * pullForce;
                        }
                    }

                    const a = p.life / 30;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 3 * a, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(100, 150, 255, ${a * 0.8})`;
                    ctx.fill();
                }

                // Efek Flashbang yang memudar halus
                if ((window as any).flashIntensity && (window as any).flashIntensity > 0) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${(window as any).flashIntensity})`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    (window as any).flashIntensity -= 0.03; // memudar perlahan
                } else {
                    const flashAlpha = Math.min(0.4, pacmanBurstParticles.length / 100);
                    ctx.fillStyle = `rgba(200, 220, 255, ${flashAlpha})`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                if (pacmanBurstParticles.length === 0 && pacmanShakeIntensity < 0.5) {
                    // Reset Pacman secara INSTAN agar satelit aslinya langsung muncul
                    isPacmanActive = false;
                    pacmanExplodeTimer = 0;

                    // Nonaktifkan mode Pacman di UI
                    window.dispatchEvent(new CustomEvent('cursor-snap-change', {
                        detail: { snapped: false, fromExplode: true }
                    }));
                }
            }

            if ((window as any).cursorRecoverDelay && (window as any).cursorRecoverDelay > 0) {
                (window as any).cursorRecoverDelay--;

                // Animasi pemulihan (recover) satelit secara perlahan
                const t = 1 - (window as any).cursorRecoverDelay / 120; // 0 -> 1

                // Kurva membal elastis (Spring Overshoot) untuk scale
                const scaleSpring = 1 - Math.pow(1 - t, 3) + Math.sin(t * Math.PI * 2.5) * Math.exp(-t * 3.5) * 0.25;

                // Efek kedipan holografik (Holographic flicker) untuk opacity
                const flicker = (Math.random() - 0.5) * 0.15 * (1 - t);
                const opacityFlicker = Math.min(1, Math.max(0, t + flicker));

                // Target pada div pembungkus (wrapper) agar tidak mengacaukan koordinat orbit Framer Motion
                const orbitBtnWrapper = document.querySelector<HTMLElement>('#keahlian .satellite-wrapper');
                const closeBtnWrapper = document.querySelector<HTMLElement>('[class*="floating"] .satellite-wrapper, .fixed.bottom-\\[15vh\\] .satellite-wrapper');

                if (orbitBtnWrapper) {
                    orbitBtnWrapper.style.opacity = opacityFlicker.toString();
                    orbitBtnWrapper.style.transform = `scale(${scaleSpring})`;
                }
                if (closeBtnWrapper) {
                    closeBtnWrapper.style.opacity = opacityFlicker.toString();
                    closeBtnWrapper.style.transform = `scale(${scaleSpring})`;
                }

                if ((window as any).cursorRecoverDelay === 0) {
                    // Nyalakan cincin reset ketika kursor mulai aktif kembali
                    pacmanResetRing = 1;

                    // Bersihkan inline style wrapper agar kembali bersih/default saat pulih seutuhnya
                    if (orbitBtnWrapper) {
                        orbitBtnWrapper.style.opacity = '1';
                        orbitBtnWrapper.style.transform = 'scale(1)';
                    }
                    if (closeBtnWrapper) {
                        closeBtnWrapper.style.opacity = '1';
                        closeBtnWrapper.style.transform = 'scale(1)';
                    }
                }
            }

            if (pacmanResetRing > 0.01) {
                const ringR = 16 + (1 - pacmanResetRing) * 80;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, ringR, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 100, 255, ${pacmanResetRing * 0.6})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                pacmanResetRing -= 0.02;
            }

            // Simpan posisi mouse sebelumnya untuk frame berikutnya
            prevMouse.x = globalMouse.x;
            prevMouse.y = globalMouse.y;

            rafId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('cursor-snap-change', handleSnapChange);
            window.removeEventListener('scroll', handleScroll, true);
            cancelAnimationFrame(rafId);
        };
    }, [isTouchDevice]);

    if (isTouchDevice) return null;

    return (
        <>
            <canvas ref={canvasRef} className="fixed top-0 left-0 pointer-events-none transition-opacity" />
            <div
                ref={ringRef}
                className="fixed pointer-events-none z-[19] rounded-full"
                style={{
                    border: '1.5px solid rgba(99,130,255,0.3)',
                    willChange: 'left, top, width, height, opacity',
                    opacity: 0,
                    display: 'none',
                }}
            />
        </>
    );
};
// Data fetching removed from here, moved into the components where it's used.
// We will export a generic fetch if needed, but we can just use `api` directly.

// --- Komponen Shutter Transition ZZZ (Kiri-Kanan) ---
const ShutterOverlay = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        const handleTrigger = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setIsOpen(true);

            // Tunggu panel tertutup
            setTimeout(() => {
                setIsClosed(true);
                // Saat layar tertutup, scroll ke karya
                const el = document.querySelector(detail.targetId);
                if (el) el.scrollIntoView({ behavior: 'instant' });

                // Jeda sejenak lalu buka panel
                setTimeout(() => {
                    setIsClosed(false);
                    // Hapus dari DOM setelah animasi buka selesai
                    setTimeout(() => setIsOpen(false), 500);
                }, 400);
            }, 400);
        };
        window.addEventListener('trigger-shutter', handleTrigger);
        return () => window.removeEventListener('trigger-shutter', handleTrigger);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none flex overflow-hidden">
            {/* Panel Kiri */}
            <motion.div
                className="w-1/2 h-full bg-[#0a84ff] border-r-[12px] border-[#005bb5] shadow-[30px_0_50px_rgba(0,0,0,0.5)]"
                initial={{ x: "-100%" }}
                animate={{ x: isClosed ? "0%" : "-100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 30, mass: 1 }}
            />
            {/* Panel Kanan */}
            <motion.div
                className="w-1/2 h-full bg-[#0a84ff] border-l-[12px] border-[#005bb5] shadow-[-30px_0_50px_rgba(0,0,0,0.5)] relative"
                initial={{ x: "100%" }}
                animate={{ x: isClosed ? "0%" : "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 30, mass: 1 }}
            >
                {/* Teks Palang Tengah */}
                <motion.div
                    className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-900 text-white font-display font-black tracking-[0.5em] text-3xl md:text-5xl py-6 px-16 italic border-y-4 border-slate-700 shadow-2xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: isClosed ? 1 : 0, scale: isClosed ? 1 : 0.8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    SELECTED WORKS
                </motion.div>
            </motion.div>
        </div>
    );
};

// --- Komponen 3D Cinematic Coverflow Gallery ---
const KaryaNodes = () => {
    const [projectsData, setProjectsData] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/projects`)
            .then(res => res.json())
            .then(data => setProjectsData(data))
            .catch(err => console.error(err));
    }, []);

    const [selectedProject, setSelectedProject] = useState<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragX = useMotionValue(0);
    const [scrollPos, setScrollPos] = useState(0);
    const isDraggingRef = useRef(false);

    // Sync dragX to state for continuous rendering
    useEffect(() => {
        const unsubscribe = dragX.on("change", (v) => setScrollPos(v));
        return unsubscribe;
    }, [dragX]);

    // Tilt values untuk active card
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isTracking, setIsTracking] = useState(false);

    // Track global mouse coordinates for 3D tilt
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (selectedProject || !isTracking) return;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;

            // Proposional tilt berdasarkan jarak kursor dari tengah layar (Max 12 derajat)
            setTilt({
                x: (dy / centerY) * -12,
                y: (dx / centerX) * 12
            });
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
    }, [selectedProject, isTracking]);

    const triggerCursorSnap = (snapped: boolean, el?: HTMLElement) => {
        if (!selectedProject) {
            window.dispatchEvent(new CustomEvent('cursor-snap-change', {
                detail: { snapped, el, mode: 'grow' }
            }));
        }
    };

    // Konstanta Jarak
    const isMobile = window.innerWidth < 768;
    const ITEM_GAP = isMobile ? 100 : 150; // Jarak dasar antar kartu
    const PUSH_FORCE = isMobile ? 60 : 90; // Gaya tolak saat kartu berada di tengah

    // Derived active index untuk indikator bawah
    const activeIndex = Math.max(0, Math.min(projectsData.length - 1, Math.round(-scrollPos / ITEM_GAP)));

    const handleNext = () => {
        const nextIndex = Math.min(projectsData.length - 1, activeIndex + 1);
        animate(dragX, -nextIndex * ITEM_GAP, { type: "spring", stiffness: 300, damping: 30 });
    };

    const handlePrev = () => {
        const prevIndex = Math.max(0, activeIndex - 1);
        animate(dragX, -prevIndex * ITEM_GAP, { type: "spring", stiffness: 300, damping: 30 });
    };

    return (
        <section
            id="karya"
            onMouseLeave={() => {
                setIsTracking(false);
                setTilt({ x: 0, y: 0 });
            }}
            className="snap-page relative w-full h-screen overflow-hidden bg-transparent flex flex-col items-center justify-center select-none"
        >

            {/* Header Karya */}
            <div className="absolute top-24 left-8 md:left-16 z-10 pointer-events-none">
                <span className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block border border-blue-500/30">03. Karya</span>
                <h2 className="text-4xl md:text-6xl font-display font-black text-black tracking-tighter">Portfolio</h2>
            </div>

            {/* Track 3D Coverflow */}
            <div
                ref={containerRef}
                className="relative w-full max-w-5xl h-[400px] md:h-[500px] flex items-center justify-center z-10 overflow-visible pointer-events-auto"
                style={{ perspective: 1200 }}
            >
                {/* Gestur Seret pada Container Utama */}
                <motion.div
                    drag="x"
                    dragElastic={isMobile ? 0.3 : 0.1} // Lebih kaku agar tidak bablas terlalu jauh, tapi agak longgar di HP
                    dragConstraints={{ left: -(Math.max(0, projectsData.length - 1)) * ITEM_GAP, right: 0 }}
                    onDragStart={() => {
                        isDraggingRef.current = true;
                        triggerCursorSnap(false);
                        setIsTracking(false);
                    }}
                    onDragEnd={(_e, info) => {
                        // Fitur Auto-Snap ke kartu terdekat saat dilepas
                        const targetX = dragX.get() + info.velocity.x * (isMobile ? 0.1 : 0.2); // Prediksi momentum
                        let closestIndex = Math.round(-targetX / ITEM_GAP);
                        closestIndex = Math.max(0, Math.min(projectsData.length - 1, closestIndex));

                        // Animasikan ke titik snap
                        animate(dragX, -closestIndex * ITEM_GAP, { type: "spring", stiffness: 300, damping: 30 });

                        // Lepas status dragging
                        setTimeout(() => {
                            isDraggingRef.current = false;
                        }, 50);
                    }}
                    className="absolute inset-0 flex items-center justify-center overflow-visible cursor-grab active:cursor-grabbing"
                    style={{ x: dragX, transformStyle: "preserve-3d" }}
                >
                    {Array.isArray(projectsData) && projectsData.map((project, i) => {
                        // 1. Hitung Jarak Murni Virtual (tanpa gaya tolak)
                        const virtualDistance = (i * ITEM_GAP) + scrollPos;

                        // 2. Terapkan Efek Tolak (Moses Effect) agar kartu di tengah mendapat ruang luas
                        let pushOffset = 0;
                        if (virtualDistance !== 0) {
                            pushOffset = Math.sign(virtualDistance) * Math.min(1, Math.abs(virtualDistance) / ITEM_GAP) * PUSH_FORCE;
                        }

                        // 3. Posisi Akhir Kartu secara Horizontal
                        const cardX = (i * ITEM_GAP) + pushOffset;

                        // 4. Posisi Visual Absolut di Layar (0 = persis di tengah layar)
                        const visualX = cardX + scrollPos;
                        const absX = Math.abs(visualX);

                        // 5. Kalkulasi Visual Dinamis
                        const dynamicScale = Math.max(0.65, 1.05 - (absX / 600) * 0.4);
                        const dynamicOpacity = 1 - Math.min(absX / 800, 0.7);
                        const dynamicZIndex = 100 - Math.floor(absX / 50);

                        // 6. Rotasi Y: Ikuti tilt jika di tengah, miring 25 derajat jika di pinggir
                        let rotateYVal = tilt.y;
                        if (visualX > 150) rotateYVal = -25;
                        else if (visualX < -150) rotateYVal = 25;
                        else {
                            const factor = visualX / 150;
                            rotateYVal = tilt.y * (1 - Math.abs(factor)) + (-25 * factor);
                        }
                        const rotateXVal = absX < 150 ? tilt.x * (1 - absX / 150) : 0;
                        const isActive = absX < 50;

                        // Warna auras dinamis berdasarkan kategori/proyek
                        const glowColors = [
                            "rgba(10,132,255,0.15)",  // Fintech
                            "rgba(168,85,247,0.15)",  // E-Commerce
                            "rgba(16,185,129,0.15)",  // AI Analytics
                            "rgba(244,63,94,0.15)",   // Social App
                            "rgba(245,158,11,0.15)",  // Smart Home
                            "rgba(6,182,212,0.15)",   // Crypto Wallet
                        ];
                        const activeColor = glowColors[i % glowColors.length];

                        return (
                            <motion.div
                                key={project.id}
                                className="absolute w-[240px] h-[320px] md:w-[300px] md:h-[400px] cursor-pointer"
                                style={{
                                    zIndex: dynamicZIndex,
                                    perspective: 1200,
                                }}
                                animate={{
                                    x: cardX,
                                    scale: dynamicScale,
                                    opacity: dynamicOpacity,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30
                                }}
                                onClick={() => {
                                    if (isDraggingRef.current) return;
                                    if (isActive) {
                                        setSelectedProject(project);
                                        triggerCursorSnap(false);
                                    } else {
                                        // Auto-scroll ke kartu yang di-klik
                                        animate(dragX, -i * ITEM_GAP, { type: "spring", stiffness: 300, damping: 30 });
                                    }
                                }}
                                onMouseMove={(e) => {
                                    if (isActive && !isTracking && !isDraggingRef.current) {
                                        setIsTracking(true);
                                        triggerCursorSnap(true, e.currentTarget);
                                    }
                                }}
                                onMouseLeave={() => {
                                    if (isActive) setIsTracking(false);
                                    triggerCursorSnap(false);
                                }}
                            >
                                {/* Inner tilting container */}
                                <motion.div
                                    animate={{
                                        rotateY: rotateYVal,
                                        rotateX: rotateXVal,
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="w-full h-full rounded-3xl overflow-hidden bg-white border border-slate-200/50 select-none transition-shadow duration-500"
                                    style={{
                                        transformStyle: "preserve-3d",
                                        boxShadow: isActive ? `0 20px 40px -10px ${activeColor}, 0 0 25px ${activeColor}` : "0 20px 40px rgba(0,0,0,0.06)"
                                    }}
                                >
                                    {/* Morphing Window Wrapper */}
                                    <motion.div
                                        layoutId={`project-window-${project.id}`}
                                        transition={{ layout: { type: "spring", stiffness: 240, damping: 28 } }}
                                        style={{ borderRadius: "24px" }}
                                        className="absolute inset-0 w-full h-full overflow-hidden bg-slate-100 pointer-events-none"
                                    >
                                        <motion.img
                                            layout
                                            src={`/storage/${project.image}`}
                                            alt={project.title}
                                            animate={{ x: (visualX / 10) * -1 }} // Efek Parallax halus
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                    </motion.div>

                                    {/* Kartu Overlay Konten */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-6 z-20 pointer-events-none">
                                        <span className="text-blue-400 font-mono text-xs tracking-wider uppercase mb-1">{project.category}</span>
                                        <h3 className="text-white font-display font-black text-xl md:text-2xl tracking-tight leading-none uppercase">{project.title}</h3>

                                        <motion.p
                                            animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
                                            transition={{ delay: 0.1 }}
                                            className="text-slate-300 font-medium text-xs md:text-sm mt-3 leading-relaxed"
                                        >
                                            Ketuk untuk melihat detail interaktif dari {project.title}.
                                        </motion.p>
                                    </div>

                                    {/* Glare Effect */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ x: "-150%", opacity: 0 }}
                                                animate={{ x: "150%", opacity: [0, 0.4, 0] }}
                                                exit={{ opacity: 0 }}
                                                transition={{ repeat: Infinity, duration: 3, delay: 1, ease: "easeInOut" }}
                                                className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 z-30 pointer-events-none"
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Indikator Navigasi Bawah */}
            <div className="absolute bottom-16 w-full max-w-xs flex flex-col items-center gap-4 z-10 pointer-events-auto">
                {/* Progress Bar Tipis */}
                <div className="w-full h-[3px] bg-slate-200 rounded-full overflow-hidden relative">
                    <motion.div
                        className="absolute left-0 top-0 h-full bg-blue-500"
                        animate={{ width: `${projectsData.length > 0 ? ((activeIndex + 1) / projectsData.length) * 100 : 0}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    />
                </div>

                {/* Tombol Panah Kiri Kanan */}
                <div className="flex gap-4 items-center">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePrev}
                        disabled={activeIndex === 0}
                        className={`w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-800 backdrop-blur-md transition-all duration-300 ${activeIndex === 0 ? "opacity-30 cursor-not-allowed bg-transparent" : "bg-white hover:bg-slate-100 shadow-sm"}`}
                    >
                        ←
                    </motion.button>
                    <span className="text-slate-600 font-mono text-sm tracking-widest">
                        {projectsData.length > 0 ? activeIndex + 1 : 0} / {projectsData.length}
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleNext}
                        disabled={projectsData.length === 0 || activeIndex === projectsData.length - 1}
                        className={`w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-800 backdrop-blur-md transition-all duration-300 ${projectsData.length === 0 || activeIndex === projectsData.length - 1 ? "opacity-30 cursor-not-allowed bg-transparent" : "bg-white hover:bg-slate-100 shadow-sm"}`}
                    >
                        →
                    </motion.button>
                </div>
            </div>



            {/* Modal Detail Proyek Raksasa */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        key="project-modal"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 1, transition: { duration: 0.6 } }}
                        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
                    >
                        {/* Latar Belakang Gelap Dasar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-slate-50 pointer-events-auto"
                        />

                        {/* App Window Raksasa */}
                        <motion.div
                            layoutId={`project-window-${selectedProject.id}`}
                            transition={{ layout: { type: "spring", stiffness: 240, damping: 28, delay: 0.15 } }}
                            style={{ borderRadius: "0%" }}
                            className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-slate-50"
                        >
                            <motion.img
                                layout
                                src={`/storage/${selectedProject.image}`}
                                alt={selectedProject.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Gradient Overlay murni untuk teks */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/65 to-transparent" />
                        </motion.div>

                        {/* Konten Detail Modal */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                            className="relative z-10 flex flex-col items-center justify-center p-8 text-center mt-20 pointer-events-auto w-full"
                        >
                            <motion.span
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                                className="text-blue-600 font-mono tracking-[0.5em] uppercase text-xs md:text-sm mb-6 border border-blue-200 px-6 py-2 rounded-full backdrop-blur-md bg-white/50"
                            >
                                {selectedProject.category}
                            </motion.span>

                            <motion.h2
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.7 }}
                                className="text-5xl md:text-8xl lg:text-9xl font-display font-black text-slate-900 tracking-tighter uppercase drop-shadow-2xl"
                            >
                                {selectedProject.title}
                            </motion.h2>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.6 }}
                                className="mt-8 text-slate-700 max-w-2xl text-lg md:text-xl leading-relaxed drop-shadow-lg"
                            >
                                {selectedProject.description || "Deskripsi proyek belum tersedia."}
                            </motion.p>

                            {selectedProject.tech_stack && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1.0, duration: 0.6 }}
                                    className="mt-6 flex flex-wrap items-center justify-center gap-2"
                                >
                                    {selectedProject.tech_stack.split(',').map((tech: string, i: number) => (
                                        <span key={i} className="text-xs font-mono text-slate-600 bg-white/60 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full">
                                            {tech.trim()}
                                        </span>
                                    ))}
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.1, duration: 0.6 }}
                                className="mt-8 flex items-center justify-center gap-4"
                            >
                                {selectedProject.github_url && (
                                    <a href={selectedProject.github_url} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-lg pointer-events-auto"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                        GitHub
                                    </a>
                                )}
                                {selectedProject.demo_url && (
                                    <a href={selectedProject.demo_url} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 bg-[#0a84ff] text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-all shadow-lg pointer-events-auto"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                        Live Demo
                                    </a>
                                )}
                            </motion.div>
                        </motion.div>

                        {/* Tombol Tutup */}
                        <motion.button
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 1.1, type: 'spring' }}
                            onClick={() => {
                                setSelectedProject(null);
                                triggerCursorSnap(false);
                            }}
                            className="absolute top-8 right-8 w-16 h-16 bg-slate-900/10 hover:bg-red-500/80 hover:text-white backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 text-2xl transition-all duration-300 border border-slate-900/10 shadow-lg group pointer-events-auto"
                        >
                            <span className="group-hover:scale-125 transition-transform">✕</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

        </section>
    );
};

// --- Komponen Magnetic Nav Item ---
const MagneticNavItem = ({ item, isActive, isHovered, onClick, index }: any) => {
    const ref = useRef<HTMLAnchorElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (isHovered && ref.current) {
            window.dispatchEvent(new CustomEvent('cursor-snap-change', {
                detail: { snapped: true, el: ref.current }
            }));
        }
        return () => {
            if (isHovered && ref.current) {
                window.dispatchEvent(new CustomEvent('cursor-snap-change', {
                    detail: { snapped: false, el: ref.current }
                }));
            }
        };
    }, [isHovered]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        setPos({ x: (e.clientX - cx) * 0.25, y: (e.clientY - cy) * 0.25 });
    };

    const handleMouseLeave = () => {
        setPos({ x: 0, y: 0 });
    };

    return (
        <motion.a
            ref={ref}
            href={item.href}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                onClick(index);
                setPos({ x: 0, y: 15 }); // Efek membal saat ditekan
                setTimeout(() => setPos({ x: 0, y: 0 }), 150);
            }}
            initial={{ opacity: 0, y: -30, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1, type: 'spring', bounce: 0.6 }}
            whileTap={{ scale: 0.85 }}
            className={`relative px-3 md:px-7 py-2 md:py-3 rounded-full transition-colors duration-300 flex items-center justify-center cursor-pointer ${isHovered ? 'text-white' : isActive ? 'text-[#0a84ff]' : 'text-slate-500'}`}
            data-cursor-snap="true"
        >
            {isActive && (
                <motion.div
                    className="absolute inset-0 border-2 border-[#0a84ff]/30 bg-[#0a84ff]/5 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                />
            )}

            <motion.span
                animate={{ x: pos.x, y: pos.y }}
                transition={{ type: "spring", stiffness: 400, damping: 10, mass: 0.5 }}
                className="relative z-10 font-bold tracking-wide text-xs md:text-sm"
            >
                {item.label}
            </motion.span>
        </motion.a>
    );
};

// --- Komponen Magnetic Navbar ---
const Navbar = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [isJiggling, setIsJiggling] = useState<boolean>(false);
    const [navMagnetic, setNavMagnetic] = useState({ x: 0, r: 0 });
    const navRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { label: 'Utama', href: '#hero' },
        { label: 'Tentang', href: '#tentang' },
        { label: 'Keahlian', href: '#keahlian' },
        { label: 'Karya', href: '#karya' },
        { label: 'Kontak', href: '#kontak' },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            let visibleId: string | null = null;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    visibleId = `#${entry.target.id}`;
                }
            });

            if (visibleId) {
                const index = navItems.findIndex(item => item.href === visibleId);
                if (index !== -1) {
                    setActiveIndex((prev) => {
                        if (prev !== index) {
                            setIsJiggling(true);
                            setTimeout(() => setIsJiggling(false), 400);
                            return index;
                        }
                        return prev;
                    });
                }
            }
        }, { threshold: 0.3 });

        navItems.forEach(item => {
            const el = document.querySelector(item.href);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!navRef.current) return;
            const navWidth = navRef.current.offsetWidth || 380;
            const navHeight = navRef.current.offsetHeight || 50;

            const centerX = window.innerWidth / 2;
            const navbarTop = 24; // top-6 = 24px
            const navbarBottom = navbarTop + navHeight;
            const navbarLeft = centerX - navWidth / 2;
            const navbarRight = centerX + navWidth / 2;

            // Toleransi deteksi (padding) 15px di sekeliling navbar
            const isInsideY = e.clientY >= navbarTop - 15 && e.clientY <= navbarBottom + 15;
            const isInsideX = e.clientX >= navbarLeft - 15 && e.clientX <= navbarRight + 15;

            if (isInsideY && isInsideX) {
                const dx = e.clientX - centerX;

                // Gunakan persentase jarak untuk kemiringan yang smooth
                const pct = dx / (navWidth / 2);
                setNavMagnetic({
                    x: pct * 18,  // Pergeseran horizontal maksimal 18px
                    r: pct * 5.0  // Kemiringan maksimal 5 derajat
                });

                // Kalkulasi hoveredIndex secara matematis & statis berdasarkan koordinat kursor di dalam lebar Navbar
                const localX = e.clientX - navbarLeft;
                const itemWidth = navWidth / navItems.length;
                const hoverIdx = Math.floor(localX / itemWidth);
                setHoveredIndex(Math.max(0, Math.min(navItems.length - 1, hoverIdx)));
            } else {
                setHoveredIndex(null);
                setNavMagnetic({ x: 0, r: 0 });
            }
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
    }, []);

    const handleNavClick = (index: number) => {
        const item = navItems[index];
        const el = document.querySelector(item.href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });

        setActiveIndex(index);
        setIsJiggling(true);
        setTimeout(() => setIsJiggling(false), 400);
    };

    const navAnim = isJiggling
        ? { y: [0, -10, 5, -3, 0], opacity: 1, x: `calc(-50% + ${navMagnetic.x}px)`, rotate: navMagnetic.r }
        : { y: 0, opacity: 1, x: `calc(-50% + ${navMagnetic.x}px)`, rotate: navMagnetic.r };

    const navTrans: any = isJiggling
        ? { duration: 0.4 }
        : { type: 'spring', stiffness: 200, damping: 22, mass: 0.5 };

    return (
        <>
            {/* Layer Background (Di Belakang Kursor) */}
            <motion.nav
                initial={{ y: -100, opacity: 0, x: "-50%" }}
                animate={navAnim}
                transition={navTrans}
                className="fixed top-6 left-1/2 p-2 ios-glass rounded-full z-40 flex gap-1 text-sm font-semibold pointer-events-none shadow-[0_20px_40px_rgba(0,113,227,0.15)] border border-white/50 backdrop-blur-xl"
            >
                {/* Render dummy invisible items to maintain exact dimensions */}
                {navItems.map((item, index) => (
                    <div key={index} className="px-3 md:px-7 py-2 md:py-3 opacity-0 font-bold tracking-wide text-xs md:text-sm">
                        {item.label}
                    </div>
                ))}
            </motion.nav>

            {/* Layer Text (Di Depan Kursor) */}
            <motion.nav
                ref={navRef}
                initial={{ y: -100, opacity: 0, x: "-50%" }}
                animate={navAnim}
                transition={navTrans}
                className="fixed top-6 left-1/2 p-2 rounded-full z-[150] flex gap-1 text-sm font-semibold pointer-events-auto"
            >
                {navItems.map((item, index) => (
                    <MagneticNavItem
                        key={index}
                        item={item}
                        index={index}
                        isActive={activeIndex === index}
                        isHovered={hoveredIndex === index}
                        onClick={handleNavClick}
                    />
                ))}
            </motion.nav>
        </>
    );
};

// --- Komponen Kartu Bento (3D Tilt + Magnetic + Spotlight) ---
const BentoCard = ({ children, className = "", isDark = false }: { children: React.ReactNode, className?: string, isDark?: boolean }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [magnetic, setMagnetic] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });

    useEffect(() => {
        let raf: number;
        const updateSpotlight = () => {
            if (divRef.current) {
                const rect = divRef.current.getBoundingClientRect();
                const x = globalMouse.x - rect.left;
                const y = globalMouse.y - rect.top;
                divRef.current.style.setProperty('--mouse-x', `${x}px`);
                divRef.current.style.setProperty('--mouse-y', `${y}px`);
            }
            raf = requestAnimationFrame(updateSpotlight);
        };
        raf = requestAnimationFrame(updateSpotlight);
        return () => cancelAnimationFrame(raf);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Physics Calculations
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const dx = x - cx;
        const dy = y - cy;

        // Magnetic Pull (Bergeser perlahan mengikuti mouse)
        const pullX = dx * 0.03;
        const pullY = dy * 0.03;

        // 3D Tilt (Memutar ke arah mouse dengan intensitas lebih tinggi)
        const rotateX = (dy / cy) * -12;
        const rotateY = (dx / cx) * 12;

        setMagnetic({ x: pullX, y: pullY, rotateX, rotateY });
    };

    const handleMouseLeave = () => {
        setMagnetic({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
    };

    return (
        <motion.div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: magnetic.x, y: magnetic.y, rotateX: magnetic.rotateX, rotateY: magnetic.rotateY }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ perspective: 1000, transformStyle: "preserve-3d" }}
            className={`relative overflow-hidden transition-shadow ${className}`}
        >
            {/* Base Glow yang lebih redup */}
            <div
                className="pointer-events-none absolute -inset-px z-0 opacity-100"
                style={{
                    background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(10, 132, 255, 0.04)'}, transparent 40%)`
                }}
            />

            {/* Grid Pattern yang disinari senter (Masking) */}
            <div
                className="pointer-events-none absolute -inset-px z-0 opacity-100"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(10,132,255,0.25)'} 1px, transparent 1px),
                        linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(10,132,255,0.25)'} 1px, transparent 1px)
                    `,
                    backgroundSize: '32px 32px',
                    WebkitMaskImage: `radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), black 0%, transparent 60%)`,
                    maskImage: `radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), black 0%, transparent 60%)`
                }}
            />

            {/* Inner Content (Pop out effect 30px) */}
            <div className="relative z-10 h-full flex flex-col" style={{ transform: "translateZ(30px)" }}>
                {children}
            </div>
        </motion.div>
    );
};

// --- Komponen Baris Keahlian Premium (Hover Reveal + Floating Box) ---
const PremiumHoverRow = ({ skill, index }: { skill: { name: string, tools: string, id: string }, index: number }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!rowRef.current) return;
        const rect = rowRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    return (
        <div
            ref={rowRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative border-b border-slate-200/50 py-8 md:py-10 overflow-hidden group cursor-pointer"
        >
            {/* Sweep Background */}
            <div className="absolute inset-0 bg-[#0a84ff] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)]" />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pointer-events-none group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                {/* Kiri: Nomor Seri & Nama Keahlian */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-16">
                    <span className="text-xl md:text-3xl font-mono text-slate-300 group-hover:text-blue-200 transition-colors duration-300">
                        0{index + 1}
                    </span>
                    <span className="text-4xl md:text-6xl lg:text-[4.5rem] font-display font-black text-slate-900 group-hover:text-white transition-colors duration-300 tracking-tighter leading-none">
                        {skill.name}
                    </span>
                </div>

                {/* Kanan: Alat/Teknologi */}
                <span className="text-base md:text-xl font-mono font-medium text-slate-500 group-hover:text-blue-100 transition-colors duration-300 ml-0 md:max-w-sm text-left md:text-right leading-relaxed">
                    {skill.tools}
                </span>
            </div>

            {/* Floating Follower Reveal Element */}
            <AnimatePresence>
                {isHovering && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            rotate: 0,
                            x: mousePos.x - 75, // Mengunci elemen di tengah kursor (Lebar kotak 150px / 2)
                            y: mousePos.y - 75
                        }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                        transition={{
                            opacity: { duration: 0.2 },
                            scale: { type: 'spring', stiffness: 400, damping: 25 },
                            rotate: { type: 'spring', stiffness: 400, damping: 25 },
                            x: { type: 'spring', stiffness: 300, damping: 30, mass: 0.5 },
                            y: { type: 'spring', stiffness: 300, damping: 30, mass: 0.5 }
                        }}
                        className="absolute top-0 left-0 w-[150px] h-[150px] bg-white/10 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.2)] hidden md:flex items-center justify-center pointer-events-none z-20"
                        style={{ willChange: 'transform' }}
                    >
                        <span className="text-white text-5xl font-display font-black tracking-tighter drop-shadow-lg">
                            {skill.id}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Komponen Tombol Orbit (The Orbiting Button) ---
const OrbitButton = ({ onClick }: { onClick: () => void }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const isPossessed = useRef(false);
    const jiggleTimeRef = useRef(0);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const zIndex = useMotionValue(30);
    const timeRef = useRef(0);

    // State lokal untuk animasi pembesaran
    const [hoverState, setHoverState] = useState(false);

    useAnimationFrame((_t, delta) => {
        if (!buttonRef.current) return;

        const currentX = x.get();
        const currentY = y.get();

        const rect = buttonRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dist = Math.sqrt((globalMouse.x - cx) ** 2 + (globalMouse.y - cy) ** 2);
        const isBlocked = isPacmanActive ||
            ((window as any).cursorRecoverDelay && (window as any).cursorRecoverDelay > 0) ||
            ((window as any).blockSnapElement === buttonRef.current);

        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (dist <= 40 && !isBlocked && !isTouch) {
            if (!isPossessed.current) {
                isPossessed.current = true;
                setHoverState(true);
            }
        } else if (dist > 70 || isBlocked) {
            if (isPossessed.current) {
                isPossessed.current = false;
                setHoverState(false);
            }
            if (dist > 70 && (window as any).blockSnapElement === buttonRef.current) {
                (window as any).blockSnapElement = null;
            }
        }

        if (isPossessed.current) {
            // Kalkulasi titik tengah asal (origin) di layar
            const originX = cx - currentX;
            const originY = cy - currentY;

            // Titik tujuan (target) adalah kursor mouse, relatif terhadap origin
            const targetX = globalMouse.x - originX;
            const targetY = globalMouse.y - originY;

            // Smooth LERP (Linear Interpolation) menuju kursor
            const newX = currentX + (targetX - currentX) * 0.2;
            const newY = currentY + (targetY - currentY) * 0.2;

            // Efek Jiggle (Kocokan Membal/Bouncy)
            jiggleTimeRef.current += delta * 0.05;
            const jiggleX = Math.sin(jiggleTimeRef.current * 2.5) * 4;
            const jiggleY = Math.cos(jiggleTimeRef.current * 3.0) * 4;

            x.set(newX + jiggleX);
            y.set(newY + jiggleY);
            zIndex.set(30);
        } else {
            // Lanjutkan hitung waktu orbit (beku saat makan & meledak, mencair saat recovery mulai)
            const isOrbitBlocked = (pacmanExplodeTimer !== 0);
            if (isOrbitBlocked) {
                return;
            }
            timeRef.current += delta * 0.0015;
            const isMobile = window.innerWidth < 768;
            const radiusX = isMobile ? 120 : 250;
            const radiusY = isMobile ? 40 : 70;

            const sinVal = Math.sin(timeRef.current);
            const targetX = Math.cos(timeRef.current) * radiusX;
            const targetY = sinVal * radiusY;

            // Smooth LERP menuju lintasan orbit (berguna saat tombol baru dilepas)
            const newX = currentX + (targetX - currentX) * 0.1;
            const newY = currentY + (targetY - currentY) * 0.1;

            x.set(newX);
            y.set(newY);
            zIndex.set(sinVal > 0 ? 30 : -10);
        }
    });

    const dispatchSnap = (snapped: boolean) => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;
        window.dispatchEvent(new CustomEvent('cursor-snap-change', {
            detail: { snapped, el: buttonRef.current }
        }));
    };

    return (
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex }}>
            <div className="satellite-wrapper origin-center transition-all duration-75">
                <motion.button
                    ref={buttonRef}
                    onClick={onClick}
                    onMouseEnter={() => dispatchSnap(true)}
                    onMouseLeave={() => dispatchSnap(false)}
                    animate={{
                        scale: hoverState ? 1.5 : 1,
                        width: hoverState ? '48px' : '24px',
                        height: hoverState ? '48px' : '24px',
                        rotate: hoverState ? [0, -10, 10, -10, 10, 0] : 0
                    }}
                    transition={{
                        type: "spring", stiffness: 300, damping: 20,
                        rotate: { repeat: Infinity, duration: 0.4, ease: "linear" }
                    }}
                    className="relative bg-[#0a84ff] text-white flex items-center justify-center rounded-full cursor-pointer shadow-[0_10px_30px_rgba(10,132,255,0.4)] pointer-events-auto"
                    style={{ x, y }}
                >
                    {/* Efek Gelombang (Pulse/Fade) */}
                    <motion.div
                        className="absolute inset-0 bg-[#0a84ff] rounded-full z-[-1]"
                        animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    />

                    {/* Icon Arrow Muncul Saat Dihover */}
                    <AnimatePresence>
                        {hoverState && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="text-white relative z-10"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </motion.div>
    );
};

// --- Komponen Tirai Biru (Blue Slide Transition) ---
const BlueCurtainTransition = ({ isVisible }: { isVisible: boolean }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: "-100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 bg-[#0a84ff] z-[100]"
                />
            )}
        </AnimatePresence>
    );
};

// --- Komponen Floating Satellite (Penutup) ---
const FloatingSatelliteButton = ({ onClick }: { onClick: () => void }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const isPossessed = useRef(false);
    const jiggleTimeRef = useRef(0);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const timeRef = useRef(0);

    const [hoverState, setHoverState] = useState(false);

    useAnimationFrame((_t, delta) => {
        if (!buttonRef.current) return;

        const currentX = x.get();
        const currentY = y.get();

        const rect = buttonRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dist = Math.sqrt((globalMouse.x - cx) ** 2 + (globalMouse.y - cy) ** 2);
        const isBlocked = isPacmanActive ||
            ((window as any).cursorRecoverDelay && (window as any).cursorRecoverDelay > 0) ||
            ((window as any).blockSnapElement === buttonRef.current);

        if (dist <= 40 && !isBlocked) {
            if (!isPossessed.current) {
                isPossessed.current = true;
                setHoverState(true);
            }
        } else if (dist > 70 || isBlocked) {
            if (isPossessed.current) {
                isPossessed.current = false;
                setHoverState(false);
            }
            if (dist > 70 && (window as any).blockSnapElement === buttonRef.current) {
                (window as any).blockSnapElement = null;
            }
        }

        if (isPossessed.current) {
            const originX = cx - currentX;
            const originY = cy - currentY;

            const targetX = globalMouse.x - originX;
            const targetY = globalMouse.y - originY;

            const newX = currentX + (targetX - currentX) * 0.2;
            const newY = currentY + (targetY - currentY) * 0.2;

            // Efek Jiggle (Kocokan Membal/Bouncy)
            jiggleTimeRef.current += delta * 0.05;
            const jiggleX = Math.sin(jiggleTimeRef.current * 2.5) * 4;
            const jiggleY = Math.cos(jiggleTimeRef.current * 3.0) * 4;

            x.set(newX + jiggleX);
            y.set(newY + jiggleY);
        } else {
            // Animasi melayang (beku saat makan & meledak, mencair saat recovery mulai)
            const isOrbitBlocked = (pacmanExplodeTimer !== 0);
            if (isOrbitBlocked) {
                return;
            }
            timeRef.current += delta * 0.002;
            const targetX = 0;
            const targetY = Math.sin(timeRef.current) * 15;

            const newX = currentX + (targetX - currentX) * 0.1;
            const newY = currentY + (targetY - currentY) * 0.1;

            x.set(newX);
            y.set(newY);
        }
    });

    const dispatchSnap = (snapped: boolean) => {
        window.dispatchEvent(new CustomEvent('cursor-snap-change', {
            detail: { snapped, el: buttonRef.current }
        }));
    };

    return (
        <div className="relative w-32 h-32 flex items-center justify-center pointer-events-none mx-auto mt-12 mb-[40vh]">
            <div className="satellite-wrapper origin-center transition-all duration-75">
                <motion.button
                    ref={buttonRef}
                    onClick={onClick}
                    onMouseEnter={() => dispatchSnap(true)}
                    onMouseLeave={() => dispatchSnap(false)}
                    animate={{
                        scale: hoverState ? 1.5 : 1,
                        width: hoverState ? '48px' : '24px',
                        height: hoverState ? '48px' : '24px',
                        rotate: hoverState ? [0, -10, 10, -10, 10, 0] : 0
                    }}
                    transition={{
                        type: "spring", stiffness: 300, damping: 20,
                        rotate: { repeat: Infinity, duration: 0.4, ease: "linear" }
                    }}
                    className="relative bg-[#0a84ff] text-white flex items-center justify-center rounded-full cursor-pointer shadow-[0_10px_30px_rgba(10,132,255,0.4)] pointer-events-auto"
                    style={{ x, y }}
                >
                    <motion.div
                        className="absolute inset-0 bg-[#0a84ff] rounded-full z-[-1]"
                        animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    />

                    <AnimatePresence>
                        {hoverState && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="text-white relative z-10"
                            >
                                {/* Icon Silang untuk Tutup */}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
};

// --- Komponen Tombol Getar & Magnet ---
const JiggleButton = ({ children, className = "", onClick, href, as = "button" }: { children: React.ReactNode, className?: string, onClick?: () => void, href?: string, as?: "button" | "div" }) => {
    const [isLongPress, setIsLongPress] = useState(false);
    const [magneticPos, setMagneticPos] = useState({ x: 0, y: 0 });
    const timerRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const startPress = () => { timerRef.current = window.setTimeout(() => setIsLongPress(true), 500); };
    const cancelPress = () => { if (timerRef.current) window.clearTimeout(timerRef.current); setIsLongPress(false); };

    const Wrapper = href ? motion.a : (as === 'div' ? motion.div : motion.button) as any;

    const dispatchSnap = (snapped: boolean) => {
        window.dispatchEvent(new CustomEvent('cursor-snap-change', {
            detail: { snapped, el: containerRef.current }
        }));
    };

    const hasEnteredRef = useRef(false);

    useEffect(() => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;

        const lastMouse = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
        const handleGlobalMove = (e: MouseEvent) => {
            lastMouse.clientX = e.clientX;
            lastMouse.clientY = e.clientY;
            updateMagnetic();
        };

        const updateMagnetic = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();

            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            // Jarak kursor dari tepi luar tombol
            const dxEdge = Math.max(Math.abs(lastMouse.clientX - cx) - rect.width / 2, 0);
            const dyEdge = Math.max(Math.abs(lastMouse.clientY - cy) - rect.height / 2, 0);
            const distToEdge = Math.sqrt(dxEdge * dxEdge + dyEdge * dyEdge);

            // Tandai jika kursor sudah menyentuh / masuk ke dalam tombol
            if (distToEdge === 0) {
                hasEnteredRef.current = true;
            }

            // Magnetic pull HANYA aktif jika kursor sudah pernah masuk,
            // dan masih berada di dalam zona tarik-menarik (<= 80px)
            if (distToEdge <= 80 && hasEnteredRef.current) {
                const dx = lastMouse.clientX - cx;
                const dy = lastMouse.clientY - cy;
                setMagneticPos({ x: dx * 0.15, y: dy * 0.15 });
            } else {
                // Jika kursor keluar terlalu jauh, putuskan gaya tarik dan lepas snap kursor
                if (distToEdge > 80) {
                    if (hasEnteredRef.current) {
                        hasEnteredRef.current = false;
                        dispatchSnap(false);
                    }
                }
                setMagneticPos({ x: 0, y: 0 });
            }
        };

        window.addEventListener('mousemove', handleGlobalMove);
        window.addEventListener('scroll', updateMagnetic, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('scroll', updateMagnetic);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative block ${className}`}
            onMouseEnter={() => {
                hasEnteredRef.current = true;
                dispatchSnap(true);
            }}
            onMouseLeave={() => {
                cancelPress();
                // Snap dilepas secara dinamis oleh handleGlobalMove saat jarak melebihi batas magnetik
            }}
            onPointerDown={startPress}
            onPointerUp={cancelPress}
            onPointerCancel={cancelPress}
        >
            {/* Wrapper asli tombol, sekarang dilengkapi magnetic physics */}
            <Wrapper
                href={href as any}
                onClick={onClick as any}
                className="relative overflow-hidden origin-center transition-shadow block w-full h-full rounded-[inherit] z-10 bg-inherit border-inherit"
                animate={{
                    x: magneticPos.x,
                    y: magneticPos.y,
                    scaleX: isLongPress ? [0.95, 1.05, 0.95] : 1,
                    scaleY: isLongPress ? [1.05, 0.95, 1.05] : 1
                }}
                transition={isLongPress ? { repeat: Infinity, duration: 0.25, ease: 'easeInOut' } : { type: 'spring', stiffness: 400, damping: 20, mass: 0.5 }}
                whileTap={!isLongPress ? { scale: 0.95 } : undefined}
            >
                <RippleEffect className="w-full h-full flex items-center justify-center">
                    {children}
                </RippleEffect>
            </Wrapper>
        </div>
    );
};
// --- Komponen Interaktif untuk Hero (Dioptimasi Super Ringan) ---
const MagneticLetter = ({ children, className = "" }: { children: string, className?: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const centerRef = useRef({ cx: 0, cy: 0 });

    useEffect(() => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;

        // Cache center coordinates untuk mencegah Layout Thrashing yang bikin LAG
        const updateCenter = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            centerRef.current = { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
        };
        // Beri jeda sedikit agar layout selesai dirender sebelum kalkulasi
        setTimeout(updateCenter, 500);
        window.addEventListener('resize', updateCenter);

        const handleMouseMove = (e: MouseEvent) => {
            const { cx, cy } = centerRef.current;
            if (cx === 0 && cy === 0) return;

            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                const force = (150 - dist) / 150;
                setPos({ x: -(dx / dist) * force * 40, y: -(dy / dist) * force * 40 });
            } else {
                setPos({ x: 0, y: 0 });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', updateCenter);
        };
    }, []);

    return (
        <motion.span
            ref={ref}
            animate={{ x: pos.x, y: pos.y }}
            transition={{ type: "spring", stiffness: 150, damping: 10, mass: 0.5 }}
            className={`inline-block pointer-events-auto cursor-default ${className}`}
        >
            {children === " " ? "\u00A0" : children}
        </motion.span>
    );
};

const TiltCard = ({ src, className = "" }: { src: string, className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateXVal = ((y - centerY) / centerY) * -20; // max 20 deg
        const rotateYVal = ((x - centerX) / centerX) * 20;

        setRotateX(rotateXVal);
        setRotateY(rotateYVal);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ rotateX, rotateY }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ perspective: 1000, transformStyle: "preserve-3d" }}
            className={`relative rounded-3xl overflow-hidden cursor-pointer ${className}`}
            data-cursor-snap="true"
        >
            <motion.div
                className="w-full h-full relative"
                style={{ transform: "translateZ(50px)" }} // Pop out effect
            >
                <img src={src} alt="Hero Visual" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </motion.div>
        </motion.div>
    );
};


// --- Komponen Konsol Kontak Interaktif ---
const ContactConsole = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'typing' | 'sending' | 'success'>('idle');
    const [progress, setProgress] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const dispatchSnap = (snapped: boolean) => {
        if (status === 'sending') return;
        window.dispatchEvent(new CustomEvent('cursor-snap-change', {
            detail: { snapped, el: snapped ? buttonRef.current : null }
        }));
    };

    const handleInputChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (status === 'idle' || status === 'success') {
            setStatus('typing');
        }
    };

    const handleTransmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;

        // Lepas magnet pelacak kursor saat tombol diklik / loading dimulai
        dispatchSnap(false);
        setStatus('sending');
        setProgress(0);

        // Simulasi progress bar pengiriman
        const interval = setInterval(() => {
            setProgress(prev => (prev >= 90 ? 90 : prev + 15));
        }, 150);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(form)
            });

            clearInterval(interval);

            if (response.ok) {
                setProgress(100);
                setTimeout(() => {
                    setStatus('success');
                    setForm({ name: '', email: '', message: '' });
                }, 400);
            } else {
                setStatus('idle');
                alert('Gagal mengirim pesan. Silakan coba lagi.');
            }
        } catch (error) {
            clearInterval(interval);
            setStatus('idle');
            alert('Terjadi kesalahan jaringan.');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] pointer-events-auto text-left relative overflow-hidden">
            {/* Ambient Background Glow inside Console */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Console */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-6 font-mono text-xs text-slate-400 select-none gap-2 md:gap-0">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="ml-2">SECURE_COMM_v1.0.9</span>
                </div>
                <div className="font-semibold text-blue-400 uppercase tracking-widest animate-pulse text-[10px] md:text-xs">
                    {status === 'idle' && "• STATUS: AWAITING SIGNAL"}
                    {status === 'typing' && "• STATUS: INPUT DETECTED..."}
                    {status === 'sending' && `• STATUS: TRANSMITTING [${progress}%]`}
                    {status === 'success' && "• STATUS: TRANSMISSION COMPLETED"}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {status !== 'success' ? (
                    <motion.form
                        key="form"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={handleTransmit}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Nama / Sender Name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="cth. John Doe"
                                    className="bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-3 text-black placeholder-slate-600 focus:outline-none transition-all font-sans text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Email / Frequency</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="cth. john@example.com"
                                    className="bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-3 text-black placeholder-slate-600 focus:outline-none transition-all font-sans text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Payload / Message</label>
                            <textarea
                                required
                                rows={4}
                                value={form.message}
                                onChange={(e) => handleInputChange('message', e.target.value)}
                                placeholder="Masukkan transmisi pesan Anda di sini..."
                                className="bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-3 text-black placeholder-slate-600 focus:outline-none transition-all font-sans resize-none text-sm"
                            />
                        </div>

                        {status === 'sending' && (
                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.15 }}
                                />
                            </div>
                        )}

                        <button
                            ref={buttonRef}
                            onMouseEnter={() => dispatchSnap(true)}
                            onMouseLeave={() => dispatchSnap(false)}
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full bg-[#0a84ff] hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-display font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer select-none text-base"
                            data-cursor-snap="true"
                        >
                            {status === 'sending' ? (
                                <>Menyalurkan Sinyal...</>
                            ) : (
                                <>
                                    Kirim Transmisi
                                    <span className="text-lg">→</span>
                                </>
                            )}
                        </button>
                    </motion.form>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="py-10 text-center flex flex-col items-center justify-center gap-6"
                    >
                        <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 text-4xl shadow-[0_0_50px_rgba(10,132,255,0.2)] animate-pulse">
                            ✓
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-bold text-black uppercase tracking-wider mb-2">Transmisi Berhasil</h3>
                            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                                Pesan Anda telah dienkripsi dan dipancarkan ke satalit pengolah data. Kami akan segera merespons sinyal Anda.
                            </p>
                        </div>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-4 px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-xs tracking-widest uppercase transition-all cursor-pointer"
                        >
                            [ Transmisi Baru ]
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Pacman Seeds Component ---
const PacmanSeeds = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);

        const seeds: { x: number; y: number; eaten: boolean; eatAnim: number }[] = [];
        let seedGenW = 0;
        let seedGenH = 0;
        let orbitEaten = false;
        let eatCooldown = 0;

        const generateSeeds = (w: number, h: number) => {
            seeds.length = 0;
            const cols = Math.floor(w / 80);
            const rows = Math.floor(h / 80);
            for (let i = 1; i < cols; i++) {
                for (let j = 1; j < rows; j++) {
                    seeds.push({
                        x: i * 80 + (Math.random() - 0.5) * 20,
                        y: j * 80 + (Math.random() - 0.5) * 20,
                        eaten: false,
                        eatAnim: 0,
                    });
                }
            }
            seedGenW = w;
            seedGenH = h;
            orbitEaten = false;
        };
        generateSeeds(canvas.width, canvas.height);

        const particles: { x: number; y: number; vx: number; vy: number; life: number; size: number }[] = [];
        let animId: number;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Reseed on resize
            if (canvas.width !== seedGenW || canvas.height !== seedGenH) {
                generateSeeds(canvas.width, canvas.height);
            }

            if (!isPacmanActive) {
                // Poin E & F: Reset logika setelah ledakan usai
                if (orbitEaten) {
                    orbitEaten = false;
                    generateSeeds(canvas.width, canvas.height); // Refresh semua biji

                    // Kembalikan tombol satelit asli ke layar
                    const orbitBtn = document.querySelector<HTMLElement>('#keahlian .bg-\\[\\#0a84ff\\]');
                    const closeBtn = document.querySelector<HTMLElement>('[class*="floating"] button, .fixed.bottom-\\[15vh\\] button');
                    if (orbitBtn) orbitBtn.style.opacity = '1';
                    if (closeBtn) closeBtn.style.opacity = '1';

                    orbitTargetPos = { x: 0, y: 0 }; // Reset global pos
                }

                animId = requestAnimationFrame(render);
                return;
            }

            if (eatCooldown > 0) eatCooldown--;

            // Trap OrbitButton + FloatingSatellite
            if (pacmanExplodeTimer === 0 && !orbitEaten) {
                const orbitBtn = document.querySelector<HTMLElement>('#keahlian .bg-\\[\\#0a84ff\\]');
                const closeBtn = document.querySelector<HTMLElement>('[class*="floating"] button, .fixed.bottom-\\[15vh\\] button');
                const targets = [orbitBtn, closeBtn].filter(Boolean) as HTMLElement[];
                for (const el of targets) {
                    const r = el.getBoundingClientRect();
                    const cx = r.left + r.width / 2;
                    const cy = r.top + r.height / 2;
                    const dx = pacmanPos.x - cx;
                    const dy = pacmanPos.y - cy;
                    if (Math.sqrt(dx * dx + dy * dy) < 36 && eatCooldown === 0) {
                        orbitEaten = true;
                        eatCooldown = 120;
                        pacmanExplodeTimer = 60;
                        orbitTargetPos = { x: cx, y: cy };
                        el.style.opacity = '0'; // Sembunyikan elemen aslinya agar digantikan animasi kanvas
                        (window as any).blockSnapElement = el; // Simpan elemen agar diblokir dari ngerasukin instan pasca ledakan
                        break;
                    }
                }
            }

            let eatenCount = 0;

            for (const seed of seeds) {
                if (seed.eatAnim > 0) {
                    seed.eatAnim--;
                    if (seed.eatAnim === 0) seed.eaten = true;
                }
                if (seed.eaten) { eatenCount++; continue; }

                const dx = pacmanPos.x - seed.x;
                const dy = pacmanPos.y - seed.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 40 && seed.eatAnim === 0 && isPacmanActive) {
                    if (eatCooldown === 0) {
                        seed.eatAnim = 12;
                        pacmanEatFlash = 12;
                        eatCooldown = 6;
                        const seedDir = Math.atan2(dy, dx);
                        const pCount = 8 + Math.floor(Math.random() * 4);
                        for (let i = 0; i < pCount; i++) {
                            const spread = seedDir + Math.PI + (Math.random() - 0.5) * Math.PI * 0.7;
                            const speed = 1.5 + Math.random() * 3.5;
                            particles.push({
                                x: seed.x, y: seed.y,
                                vx: Math.cos(spread) * speed,
                                vy: Math.sin(spread) * speed,
                                life: Math.floor(12 + Math.random() * 12),
                                size: i < 5 ? 2 + Math.random() * 2 : 0.8 + Math.random() * 0.8,
                            });
                        }
                    }
                }

                if (seed.eatAnim > 0) {
                    const t = 1 - seed.eatAnim / 12;
                    const popR = 3 + (1 - t) * 8;
                    const popA = (1 - t) * 0.6;
                    ctx.beginPath();
                    ctx.arc(seed.x, seed.y, popR, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(200, 210, 230, ${popA})`;
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(seed.x, seed.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(200, 210, 230, 0.8)';
                    ctx.fill();
                }
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.96; p.vy *= 0.96;
                p.life--; if (p.life <= 0) { particles.splice(i, 1); continue; }
                const alpha = p.life / 24;
                const pr = Math.max(0.5, p.size * alpha);
                const isBig = p.size > 1.5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
                ctx.fillStyle = isBig
                    ? `rgba(255, 200, 50, ${alpha * 0.9})`
                    : `rgba(255, 170, 30, ${alpha * 0.8})`;
                ctx.fill();
            }

            if (eatenCount > seeds.length / 2) {
                for (const seed of seeds) { seed.eaten = false; seed.eatAnim = 0; }
            }

            animId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-10" />
    );
};

export default function App() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ container: scrollRef });
    const gridY = useTransform(scrollYProgress, [0, 1], ['0px', '300px']);
    const [isSkillsOpen, setIsSkillsOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [skillsData, setSkillsData] = useState<any[]>([]);
    const [isPacmanMode, setIsPacmanMode] = useState(false);
    const [showPacmanBtn, setShowPacmanBtn] = useState(false);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/skills`)
            .then(res => res.json())
            .then(data => {
                if (typeof data === 'object' && !Array.isArray(data)) {
                    // Grouped by category: { "Frontend": [{name: "React"}], ... }
                    const formattedSkills = Object.keys(data).map((category) => {
                        const toolsArray = data[category].map((s: any) => s.name);

                        // Buat singkatan keren dari nama kategori (misal "Frontend" -> "FR", "Web Design" -> "WD")
                        const words = category.trim().split(/\s+/);
                        let shortCode = "";
                        if (words.length > 1) {
                            shortCode = words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
                        } else {
                            // Ambil huruf pertama dan huruf konsonan berikutnya (opsional) atau cukup 2-3 huruf pertama
                            shortCode = category.substring(0, 3).toUpperCase();
                        }

                        return {
                            id: shortCode,
                            name: category,
                            tools: toolsArray.join(', ')
                        };
                    });
                    setSkillsData(formattedSkills);
                } else {
                    setSkillsData(Array.isArray(data) ? data : []);
                }
            })
            .catch(err => {
                console.error("Error fetching skills:", err);
                setSkillsData([]);
            });
    }, []);

    // IntersectionObserver untuk show/hide toggle button berdasarkan scroll
    useEffect(() => {
        const el = document.getElementById('tentang');
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => setShowPacmanBtn(entry.isIntersecting),
            { threshold: 0.3 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Reset isPacmanMode saat explosion selesai
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail.fromExplode && isPacmanMode) {
                setIsPacmanMode(false);
            }
        };
        window.addEventListener('cursor-snap-change', handler);
        return () => window.removeEventListener('cursor-snap-change', handler);
    }, [isPacmanMode]);

    const handleToggleSkills = (targetState: boolean) => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        window.dispatchEvent(new CustomEvent('cursor-snap-change', {
            detail: { snapped: false, el: null }
        }));

        setTimeout(() => {
            setIsSkillsOpen(targetState);
            if (targetState) {
                document.getElementById('keahlian')?.scrollIntoView({ behavior: 'instant' });
            }
            setIsTransitioning(false);
        }, 600);
    };

    return (
        <div className="h-screen w-screen font-body relative overflow-hidden text-slate-900 bg-transparent">
            {/* Grid Background Parallax */}
            <motion.div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                    backgroundPosition: `0px ${gridY}`,
                }}
            />

            {/* Morphing Magnetic Cursor (Tetap Paling Atas) */}
            <MorphingCursor />
            <PacmanSeeds />

            {/* Toggle Button Pacman/Bulat (kanan bawah) */}
            <AnimatePresence>
                {showPacmanBtn && (
                    <motion.button
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 250, damping: 12 }}
                        onClick={() => {
                            const next = !isPacmanMode;
                            setIsPacmanMode(next);
                            isPacmanActive = next;
                            window.dispatchEvent(new CustomEvent('cursor-snap-change', {
                                detail: next
                                    ? { snapped: true, mode: 'pacman' }
                                    : { snapped: false }
                            }));
                        }}
                        className="fixed bottom-8 right-8 z-[60] hidden md:flex items-center w-[92px] h-[48px] rounded-full bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 pointer-events-auto cursor-pointer select-none overflow-hidden"
                    >
                        {/* Highlight Bulat Statis di Kiri (Slot Aktif) */}
                        <div className="absolute top-1 bottom-1 left-1 w-[40px] bg-blue-500 rounded-full shadow-sm z-0" />

                        {/* Ikon Pacman */}
                        <motion.div
                            className={`absolute left-0 top-1 z-10 w-[40px] h-[40px] flex items-center justify-center transition-colors duration-300 ${isPacmanMode ? 'text-yellow-400 drop-shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            animate={{ x: isPacmanMode ? 4 : 48 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,12 L21,5 A10,10 0 1,0 21,19 Z" />
                            </svg>
                        </motion.div>

                        {/* Ikon Bulat Asli */}
                        <motion.div
                            className={`absolute left-0 top-1 z-10 w-[40px] h-[40px] flex items-center justify-center transition-colors duration-300 ${!isPacmanMode ? 'text-white drop-shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            animate={{ x: isPacmanMode ? 48 : 4 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="12" />
                            </svg>
                        </motion.div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Shutter ZZZ Overlay */}
            <ShutterOverlay />

            {/* Tirai Biru Transisi Penuh */}
            <BlueCurtainTransition isVisible={isTransitioning} />

            {/* Navbar Magnetic */}
            <Navbar />

            {/* Logo Kiri Atas */}
            <div className="fixed top-8 left-8 z-50 font-display font-bold text-2xl tracking-tight text-white mix-blend-difference pointer-events-auto cursor-pointer hover:text-[#0a84ff] transition-colors hidden md:block">
                Rasyid
            </div>

            {/* SNAP SCROLL CONTAINER */}
            <div ref={scrollRef} className="snap-container hide-scrollbar relative w-full h-full overflow-y-auto" style={{ background: 'transparent' }}>

                {/* PAGE 1: HERO INTERAKTIF */}
                <section id="hero" className="snap-page flex flex-col justify-center relative px-4 md:px-16 overflow-hidden bg-transparent">
                    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 mt-10">

                        {/* Kiri: Tipografi Interaktif */}
                        <div className="flex-1 w-full text-left z-10 flex flex-col items-start mt-12 md:mt-0">
                            <h1 className="text-[3.5rem] md:text-[7rem] leading-[0.9] font-display font-black text-slate-900 tracking-tighter mb-6 flex flex-wrap">
                                {"RPL".split("").map((char, i) => (
                                    <MagneticLetter key={`a-${i}`}>{char}</MagneticLetter>
                                ))}
                                <br />
                                {"DEVELOP.".split("").map((char, i) => (
                                    <MagneticLetter key={`b-${i}`} className="text-transparent bg-clip-text bg-gradient-to-r from-[#0a84ff] to-purple-600 pr-2 -mr-2 pb-2 -mb-2">{char}</MagneticLetter>
                                ))}
                            </h1>

                            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-lg leading-relaxed mb-10 pointer-events-none">
                                Sentuh, gerakkan, dan rasakan. Saya merancang ekosistem digital yang tidak hanya terlihat indah, tetapi hidup dan merespons setiap interaksi Anda.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
                                <JiggleButton href="#tentang" className="rounded-full shadow-lg shadow-blue-500/20">
                                    <div className="bg-[#0a84ff] text-white px-8 py-4 rounded-full font-bold tracking-wide text-base pointer-events-none flex items-center gap-2">
                                        Mulai Interaksi <span className="text-lg">↓</span>
                                    </div>
                                </JiggleButton>
                            </div>
                        </div>

                        {/* Kanan: 3D Tilt Card Interaktif */}
                        <div className="flex-1 w-full max-w-lg relative pointer-events-auto perspective-[2000px] z-10 hidden md:block">
                            <TiltCard
                                src='/images/4bb36ba54963e76ec4277a5ea13aed3f.jpg'
                                className="w-full aspect-[4/5] shadow-[0_30px_60px_rgba(0,0,0,0.15)] rounded-3xl"
                            />

                            {/* Floating decorative elements */}
                            <motion.div
                                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"
                            />
                            <motion.div
                                animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl"
                            />
                        </div>
                    </div>
                </section>

                {/* PAGE 2: TENTANG SAYA (BENTO BOX INTERAKTIF) */}
                <section
                    id="tentang"
                    className="snap-page relative pt-16"
                >
                    <div className="w-full h-full max-w-7xl mx-auto px-8 md:px-16 flex flex-col justify-center relative pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.8, type: 'spring' }}
                            className="w-full pointer-events-auto"
                        >
                            <span className="bg-blue-600/10 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-md mb-8 inline-block">
                                01. Tentang Saya
                            </span>

                            <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 min-h-[500px]">

                                {/* Kiri Besar (Main Intro) */}
                                <BentoCard className="col-span-1 md:col-span-2 row-span-2 p-6 md:p-14 bg-white/40 backdrop-blur-md rounded-3xl flex flex-col justify-end shadow-sm border border-slate-200/50 cursor-default">
                                    <h2 className="text-3xl md:text-[3.5rem] font-display font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                                        Halo, Rasyid <br /> Here.
                                    </h2>
                                    <p className="text-slate-600 font-medium text-base md:text-xl leading-relaxed max-w-lg">
                                        Saya seorang pelajar SMK di SMK Negeri 1 Cianjur jurusan Rekayasa Perangkat Lunak (RPL). Saya suka membuat design UI/UX dengan menggunakan tools Figma/Adobe Illustrator untuk membuat design yang lebih menarik.
                                    </p>
                                </BentoCard>

                                {/* Kanan Atas (Lokasi & Kolaborasi) */}
                                <BentoCard isDark={true} className="col-span-1 p-8 bg-slate-900 text-white rounded-3xl flex flex-col justify-center shadow-lg cursor-default">
                                    <div className="mb-4 text-[#0a84ff]">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold mb-2 tracking-tight">Pembelajaran.</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed">
                                        Saat ini fokus mengasah Teknologi AI dan mengasah keahlian di teknologi modern seperti React, Tailwind, dan Animasi.
                                    </p>
                                </BentoCard>

                                {/* Kanan Bawah (Filosofi) */}
                                <BentoCard className="col-span-1 p-8 bg-white/40 backdrop-blur-md rounded-3xl flex flex-col justify-center shadow-sm border border-slate-200/50 cursor-default">
                                    <div className="mb-4 text-emerald-500">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-slate-900 mb-2 tracking-tight">Energi Muda.</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        Penuh rasa ingin tahu, cepat beradaptasi, dan siap menghadapi tantangan di dunia industri.
                                    </p>
                                </BentoCard>

                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* PAGE 3: KEAHLIAN (INTERAKTIF & PREMIUM) */}
                <section id="keahlian" className={`snap-start snap-always w-screen px-4 md:px-16 relative flex flex-col ${isSkillsOpen ? 'min-h-screen justify-start pt-24 md:pt-32' : 'h-screen justify-center overflow-hidden'}`}>
                    <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center relative z-10">
                        {!isSkillsOpen && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-blue-600/10 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-md mb-6 inline-block"
                            >
                                02. Keahlian
                            </motion.span>
                        )}
                        <h2 className="text-[12vw] font-display font-black text-slate-900 leading-none tracking-tighter mb-4 relative z-20">
                            Stack {!isSkillsOpen && <br />} Teknologi.
                            {!isSkillsOpen && <OrbitButton onClick={() => handleToggleSkills(true)} />}
                        </h2>
                        {!isSkillsOpen && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-slate-600 font-medium text-lg md:text-xl leading-relaxed max-w-3xl mx-auto"
                            >
                                Sebagai pelajar Rekayasa Perangkat Lunak, saya mengasah skill-skill programmer untuk membangun web modern.
                            </motion.p>
                        )}
                    </div>

                    {/* Full Width List (Hidden initially) */}
                    {isSkillsOpen && (
                        <div className="w-full flex flex-col border-t border-slate-200/50 pointer-events-auto mt-16 pb-24">
                            {skillsData.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">Belum ada data keahlian.</div>
                            ) : (
                                skillsData.map((skill, i) => (
                                    <PremiumHoverRow key={i} index={i} skill={skill} />
                                ))
                            )}

                            {/* Tombol Tutup (Satelit Mengambang) */}
                            <FloatingSatelliteButton onClick={() => handleToggleSkills(false)} />
                        </div>
                    )}
                </section>

                {/* PAGE 4: KARYA */}
                <KaryaNodes />

                {/* PAGE 5: KONTAK */}
                <section id="kontak" className="snap-page relative w-full h-screen overflow-hidden bg-transparent flex flex-col items-center justify-center">

                    <div className="w-full h-full max-w-7xl mx-auto px-8 md:px-16 flex flex-col justify-center relative pointer-events-none z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.4 }}
                            transition={{ duration: 0.8, type: 'spring' }}
                            className="max-w-5xl w-full mx-auto text-center pointer-events-auto flex flex-col gap-8 md:gap-12"
                        >
                            <div>
                                <span className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-blue-500/30">
                                    04. Kontak
                                </span>
                                <h2 className="text-4xl md:text-7xl font-display font-black text-black leading-none tracking-tighter">
                                    Mulai Percakapan.
                                </h2>
                            </div>

                            {/* Konsol Pengiriman Pesan Futuristis */}
                            <ContactConsole />
                        </motion.div>
                    </div>
                </section>

            </div>
        </div>
    );
}
