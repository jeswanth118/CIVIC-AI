import React, { useEffect, useRef } from 'react';

interface ParticleWaveBackgroundProps {
  className?: string;
}

/**
 * ParticleWaveBackground - Performance Optimized
 * 
 * Optimizations:
 * 1. High-Precision Time-Based Logic (timestamp delta in ms with requestAnimationFrame)
 *    - Independent of display refresh rate (60Hz, 120Hz, 144Hz)
 *    - Clamped delta prevents leap/jump glitches when returning from sleep/freeze
 * 2. Dynamic Viewport Adaptive Particle Density:
 *    - Small Mobile (< 640px): 24 rows × 48 cols (~1,152 particles)
 *    - Tablet (640px - 1024px): 32 rows × 64 cols (~2,048 particles)
 *    - Desktop / Ultrawide (> 1024px): 42 rows × 84 cols (~3,528 particles)
 * 3. CPU/GPU Power Throttling & Tab Pausing:
 *    - Automatically suspends requestAnimationFrame when document.hidden === true
 *    - Cancels running animation frame and resumes smoothly on visibilitychange
 * 4. Zero-Allocation Typed Arrays inside render loop for 60 FPS stutter-free drawing
 */
export const ParticleWaveBackground: React.FC<ParticleWaveBackgroundProps> = ({
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check prefers-reduced-motion media query
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number = 0;
    let isRunning = false;
    let lastTimestamp: number = 0;
    let elapsedTime: number = 0;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse coordinates with smooth inertia interpolation
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let hasMouseInteracted = false;

    // Viewport-adaptive dynamic grid dimensions
    let rows = 42;
    let cols = 84;
    let totalMeshParticles = rows * cols;

    // Dynamically sized Float32Array buffers
    let meshProjX = new Float32Array(totalMeshParticles);
    let meshProjY = new Float32Array(totalMeshParticles);
    let meshSize = new Float32Array(totalMeshParticles);
    let meshAlpha = new Float32Array(totalMeshParticles);
    let meshIsCrest = new Uint8Array(totalMeshParticles);
    let meshIsVisible = new Uint8Array(totalMeshParticles);

    // Designated focal nodes
    const focalNodeSet = new Set<number>();

    // Layer C: Secondary Weaving Particle Ribbons
    const ribbonCount = 3;
    let particlesPerRibbon = 85;
    let totalRibbonParticles = ribbonCount * particlesPerRibbon;
    let ribbonProjX = new Float32Array(totalRibbonParticles);
    let ribbonProjY = new Float32Array(totalRibbonParticles);
    let ribbonAlpha = new Float32Array(totalRibbonParticles);
    let ribbonSize = new Float32Array(totalRibbonParticles);

    // Layer D: Floating Ambient Micro-Particles
    const ambientParticles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
      pulseOffset: number;
      pulseSpeed: number;
    }> = [];

    // Configure density based on actual rendered width
    const configureAdaptiveDensity = (containerWidth: number) => {
      let newRows: number;
      let newCols: number;
      let newRibbonPts: number;
      let newAmbientCount: number;
      let newFocalCount: number;

      if (containerWidth < 640) {
        // Mobile phone: lightweight density to conserve battery and GPU fillrate
        newRows = 24;
        newCols = 48;
        newRibbonPts = 45;
        newAmbientCount = 20;
        newFocalCount = 18;
      } else if (containerWidth < 1024) {
        // Tablet: balanced mid-tier density
        newRows = 32;
        newCols = 64;
        newRibbonPts = 65;
        newAmbientCount = 35;
        newFocalCount = 32;
      } else {
        // Desktop / Laptop: full cinematic high-density field
        newRows = 42;
        newCols = 84;
        newRibbonPts = 85;
        newAmbientCount = 55;
        newFocalCount = 52;
      }

      rows = newRows;
      cols = newCols;
      totalMeshParticles = rows * cols;

      // Reallocate typed arrays only if size changed
      if (meshProjX.length !== totalMeshParticles) {
        meshProjX = new Float32Array(totalMeshParticles);
        meshProjY = new Float32Array(totalMeshParticles);
        meshSize = new Float32Array(totalMeshParticles);
        meshAlpha = new Float32Array(totalMeshParticles);
        meshIsCrest = new Uint8Array(totalMeshParticles);
        meshIsVisible = new Uint8Array(totalMeshParticles);
      }

      particlesPerRibbon = newRibbonPts;
      totalRibbonParticles = ribbonCount * particlesPerRibbon;
      if (ribbonProjX.length !== totalRibbonParticles) {
        ribbonProjX = new Float32Array(totalRibbonParticles);
        ribbonProjY = new Float32Array(totalRibbonParticles);
        ribbonAlpha = new Float32Array(totalRibbonParticles);
        ribbonSize = new Float32Array(totalRibbonParticles);
      }

      // Re-seed focal nodes
      focalNodeSet.clear();
      for (let i = 0; i < newFocalCount; i++) {
        const r = Math.floor(rows * 0.25 + Math.random() * (rows * 0.72));
        const c = Math.floor(cols * 0.32 + Math.random() * (cols * 0.65));
        focalNodeSet.add(r * cols + c);
      }

      // Re-seed ambient particles
      ambientParticles.length = 0;
      for (let i = 0; i < newAmbientCount; i++) {
        ambientParticles.push({
          x: (0.15 + Math.random() * 0.95) * (containerWidth || 1200),
          y: (0.35 + Math.random() * 0.65) * (height || 700),
          z: 100 + Math.random() * 500,
          vx: (Math.random() - 0.45) * 0.3,
          vy: -0.15 - Math.random() * 0.35,
          size: 0.6 + Math.random() * 1.6,
          baseAlpha: 0.15 + Math.random() * 0.45,
          pulseOffset: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.03,
        });
      }
    };

    const resizeCanvas = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      configureAdaptiveDensity(width);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Desktop pointer movement listener for subtle perspective parallax
    const handlePointerMove = (e: MouseEvent) => {
      if (width < 768) return;
      const rect = canvas.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      targetMouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
      hasMouseInteracted = true;
    };

    const handlePointerLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    // -----------------------------------------------------------------
    // Core Animation Frame Loop with Precision Time-Delta Calculation
    // -----------------------------------------------------------------
    const render = (timestamp: number) => {
      if (!isRunning) return;

      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      // Compute delta time in seconds, clamped to max 0.05s (20 FPS minimum)
      // to avoid visual jumps if a tab is temporarily stalled or unthrottled
      const deltaMs = timestamp - lastTimestamp;
      const deltaSec = Math.min(deltaMs / 1000, 0.05);
      lastTimestamp = timestamp;

      if (!prefersReducedMotion) {
        // Advance time accumulator proportionally (0.33 units per second)
        elapsedTime += deltaSec * 0.33;
      }

      const time = elapsedTime;

      // Smooth inertia interpolation for mouse parallax
      if (hasMouseInteracted && !prefersReducedMotion) {
        const mouseEase = Math.min(deltaSec * 3.5, 0.15);
        mouseX += (targetMouseX - mouseX) * mouseEase;
        mouseY += (targetMouseY - mouseY) * mouseEase;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. RESTRAINED CINEMATIC SILVER ILLUMINATION (CORE GLOW)
      const coreX = width * (0.75 + mouseX * 0.03);
      const coreY = height * (0.74 + mouseY * 0.03);
      const coreRadius = Math.max(width * 0.48, 420);
      const bgGlow = ctx.createRadialGradient(coreX, coreY, 15, coreX, coreY, coreRadius);
      bgGlow.addColorStop(0, 'rgba(255, 255, 255, 0.085)');
      bgGlow.addColorStop(0.32, 'rgba(210, 225, 250, 0.035)');
      bgGlow.addColorStop(0.72, 'rgba(160, 180, 220, 0.008)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. LAYER A & B: 3D FLOWING PARTICLE FIELD
      const focalLength = 520;
      const cameraY = -height * 0.38 + mouseY * (height * 0.06);
      const cameraXOffset = mouseX * (width * 0.04);
      const horizonY = height * 0.63;

      for (let r = 0; r < rows; r++) {
        const depthProgress = r / rows;
        const worldZ = 150 + (1 - depthProgress) * 780;
        const scale = focalLength / worldZ;
        const waveAmpBase = height * (0.085 + depthProgress * 0.16);

        for (let c = 0; c < cols; c++) {
          const index = r * cols + c;
          const u = c / (cols - 1);

          const worldX = width * (0.16 + u * 1.02) + cameraXOffset * (1 - depthProgress * 0.6);

          const freqX = u * 4.6;
          const freqZ = depthProgress * 3.8;

          const wave1 = Math.sin(freqX - time * 1.7 + freqZ * 1.1) * (waveAmpBase * 0.62);
          const wave2 = Math.cos(freqX * 1.8 + time * 0.85 - freqZ * 0.75) * (waveAmpBase * 0.26);
          const wave3 = Math.sin((u * 2.8 + depthProgress * 2.1) - time * 2.3) * (waveAmpBase * 0.14);
          const wave4 = Math.cos(u * 7.2 - time * 1.1 + freqZ * 1.4) * (waveAmpBase * 0.06);

          const envelope = Math.pow(Math.sin(u * Math.PI * 0.86), 1.25);
          const worldY = (wave1 + wave2 + wave3 + wave4) * envelope;

          const projX = worldX;
          const projY = horizonY + (worldY - cameraY) * scale;

          meshProjX[index] = projX;
          meshProjY[index] = projY;

          const size = Math.max(0.55, (0.65 + depthProgress * 1.55) * (0.8 + scale * 0.42));
          meshSize[index] = size;

          const crestFactor = Math.max(0, worldY / waveAmpBase);
          meshIsCrest[index] = crestFactor > 0.45 ? 1 : 0;

          const baseAlpha = 0.06 + depthProgress * 0.42;
          const alpha = Math.min(0.95, baseAlpha + crestFactor * 0.4);
          meshAlpha[index] = alpha;

          meshIsVisible[index] = (projX >= -15 && projX <= width + 15 && projY >= 0 && projY <= height + 30) ? 1 : 0;
        }
      }

      // Connecting Silver Strands
      ctx.lineWidth = 0.85;
      for (let r = 0; r < rows; r += 2) {
        const depthProgress = r / rows;
        const strandAlpha = 0.025 + depthProgress * 0.15;
        ctx.strokeStyle = `rgba(225, 235, 255, ${strandAlpha.toFixed(3)})`;
        ctx.beginPath();
        let started = false;

        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (!meshIsVisible[idx]) continue;

          const px = meshProjX[idx];
          const py = meshProjY[idx];

          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      // Render Mesh Particles
      for (let i = 0; i < totalMeshParticles; i++) {
        if (!meshIsVisible[i]) continue;

        const x = meshProjX[i];
        const y = meshProjY[i];
        const sz = meshSize[i];
        const a = meshAlpha[i];
        const isCrest = meshIsCrest[i];

        ctx.fillStyle = isCrest 
          ? `rgba(255, 255, 255, ${a.toFixed(3)})` 
          : `rgba(215, 228, 248, ${(a * 0.88).toFixed(3)})`;

        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. LAYER C: SECONDARY FLOWING PARTICLE RIBBONS
      for (let rib = 0; rib < ribbonCount; rib++) {
        const ribOffset = rib * 2.1;
        const ribSpeed = 1.3 + rib * 0.4;
        const ribAlphaBase = 0.22 + rib * 0.1;

        ctx.strokeStyle = `rgba(240, 248, 255, ${(ribAlphaBase * 0.6).toFixed(3)})`;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        let started = false;

        for (let p = 0; p < particlesPerRibbon; p++) {
          const u = p / (particlesPerRibbon - 1);
          const ribIdx = rib * particlesPerRibbon + p;

          const rx = width * (0.24 + u * 0.88);
          const waveR1 = Math.sin(u * 4.2 - time * ribSpeed + ribOffset) * (height * 0.14);
          const waveR2 = Math.cos(u * 2.6 + time * 0.7 - ribOffset * 1.3) * (height * 0.08);
          const rEnvelope = Math.sin(Math.pow(u, 0.85) * Math.PI);
          const ry = height * (0.64 + (rib - 1) * 0.08) + (waveR1 + waveR2) * rEnvelope + mouseY * (height * 0.04);

          ribbonProjX[ribIdx] = rx;
          ribbonProjY[ribIdx] = ry;
          ribbonAlpha[ribIdx] = ribAlphaBase * rEnvelope;
          ribbonSize[ribIdx] = 1.1 + Math.sin(u * Math.PI) * 1.3;

          if (!started) {
            ctx.moveTo(rx, ry);
            started = true;
          } else {
            ctx.lineTo(rx, ry);
          }
        }
        ctx.stroke();

        for (let p = 0; p < particlesPerRibbon; p += 2) {
          const ribIdx = rib * particlesPerRibbon + p;
          const rx = ribbonProjX[ribIdx];
          const ry = ribbonProjY[ribIdx];
          const ra = ribbonAlpha[ribIdx];
          const rs = ribbonSize[ribIdx];

          ctx.fillStyle = `rgba(255, 255, 255, ${ra.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(rx, ry, rs, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. LAYER D: AUTONOMOUS FLOATING MICRO-PARTICLES (BROWNIAN DRIFT)
      for (let i = 0; i < ambientParticles.length; i++) {
        const pt = ambientParticles[i];

        if (!prefersReducedMotion) {
          // Delta-scaled movement for smooth drifting across any refresh rate
          pt.x += pt.vx * (deltaSec * 60);
          pt.y += pt.vy * (deltaSec * 60);
          pt.pulseOffset += pt.pulseSpeed * (deltaSec * 60);

          if (pt.y < height * 0.25) {
            pt.y = height * 0.95;
            pt.x = (0.2 + Math.random() * 0.8) * width;
          }
          if (pt.x < width * 0.15) pt.x = width * 0.98;
          if (pt.x > width * 1.05) pt.x = width * 0.2;
        }

        const pulse = 0.65 + 0.35 * Math.sin(pt.pulseOffset);
        const alpha = pt.baseAlpha * pulse;

        const scale = focalLength / pt.z;
        const px = pt.x + mouseX * (width * 0.02) * (1 - pt.z / 600);
        const py = pt.y + mouseY * (height * 0.02) * (1 - pt.z / 600);
        const pSize = pt.size * (0.8 + scale * 0.4);

        ctx.fillStyle = `rgba(245, 250, 255, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. LUMINOUS TOPOLOGICAL RIDGE NODES
      focalNodeSet.forEach((nodeIdx) => {
        if (!meshIsVisible[nodeIdx]) return;

        const nx = meshProjX[nodeIdx];
        const ny = meshProjY[nodeIdx];
        const nSize = meshSize[nodeIdx];
        const baseAlpha = meshAlpha[nodeIdx];

        const pulse = 0.55 + 0.45 * Math.sin(time * 2.8 + nodeIdx * 0.19);
        const nodeAlpha = Math.min(0.98, baseAlpha * (1.25 + pulse * 0.65));

        const haloRadius = nSize * (4.2 + pulse * 2.6);
        const halo = ctx.createRadialGradient(nx, ny, 0, nx, ny, haloRadius);
        halo.addColorStop(0, `rgba(255, 255, 255, ${(nodeAlpha * 0.82).toFixed(3)})`);
        halo.addColorStop(0.35, `rgba(215, 230, 255, ${(nodeAlpha * 0.26).toFixed(3)})`);
        halo.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(nx, ny, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(nx, ny, Math.max(1.4, nSize * 1.55), 0, Math.PI * 2);
        ctx.fill();
      });

      // Continue requestAnimationFrame loop if active
      if (isRunning && !prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Start or pause control functions
    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        lastTimestamp = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const stopLoop = () => {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
      lastTimestamp = 0;
    };

    // Initial trigger
    if (prefersReducedMotion) {
      // If user prefers reduced motion, render single static frame and stay paused
      isRunning = true;
      render(performance.now());
      isRunning = false;
    } else {
      startLoop();
    }

    // Page Visibility change listener: completely halts GPU/CPU loop when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (!prefersReducedMotion) {
        startLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopLoop();
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full select-none ${className}`}
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
};
export default ParticleWaveBackground;
