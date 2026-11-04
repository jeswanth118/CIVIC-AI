import React, { useEffect, useRef } from 'react';

/**
 * ParticleWaveCanvas
 * A high-performance canvas simulation rendering the flowing digital particle-wave
 * visual with fine white/silver strands, tiny luminous points, and organic flowing curves.
 * Positioned across the lower half of the hero toward the right side with strands extending left.
 */
export const ParticleWaveCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1200);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 700);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Number of flowing ribbon strands
    const strandCount = 38;
    const pointsPerStrand = 55;
    let time = 0;

    // Generate floating luminous particles
    const particleCount = 65;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      alpha: number;
      speedX: number;
      speedY: number;
      pulse: number;
      pulseSpeed: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: height * 0.35 + Math.random() * (height * 0.65),
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.6 + 0.2,
        speedX: (Math.random() - 0.4) * 0.4,
        speedY: (Math.random() - 0.6) * 0.3,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing ambient light beneath the wave core
      const coreX = width * 0.72;
      const coreY = height * 0.68;
      const gradient = ctx.createRadialGradient(coreX, coreY, 20, coreX, coreY, width * 0.5);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      gradient.addColorStop(0.35, 'rgba(210, 225, 255, 0.05)');
      gradient.addColorStop(0.8, 'rgba(180, 200, 240, 0.01)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw organic particle-wave strands
      ctx.lineWidth = 1.1;

      for (let s = 0; s < strandCount; s++) {
        const progress = s / strandCount;
        const strandOffset = s * 0.14;
        
        // Depth-based opacity & silver tone
        const baseAlpha = 0.08 + Math.sin(progress * Math.PI) * 0.35;
        const isBright = s % 4 === 0;
        const strokeAlpha = isBright ? Math.min(baseAlpha * 1.5, 0.55) : baseAlpha;

        ctx.strokeStyle = `rgba(235, 242, 255, ${strokeAlpha.toFixed(3)})`;
        ctx.beginPath();

        // Wave path computation
        for (let p = 0; p <= pointsPerStrand; p++) {
          const u = p / pointsPerStrand; // 0 (left) to 1 (right)
          
          // x spreads from 20% left across to beyond the right boundary
          const x = width * (0.15 + u * 0.95);

          // Complex organic wave harmonics (resembling flowing liquid silk ribbons)
          const wave1 = Math.sin(u * 3.8 + time + strandOffset) * (height * 0.16);
          const wave2 = Math.cos(u * 6.2 - time * 0.7 + strandOffset * 1.5) * (height * 0.08);
          const wave3 = Math.sin(u * 1.5 + time * 0.5) * (height * 0.1);

          // Flow envelope: rises upward towards center-right, crests and sweeps down to right
          const envelope = Math.sin(Math.pow(u, 0.75) * Math.PI);
          const verticalCenter = height * (0.62 + (progress - 0.5) * 0.28);

          const y = verticalCenter + (wave1 + wave2 + wave3) * envelope;

          if (p === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          // Draw occasional luminous nodes along the main strands
          if (isBright && p % 7 === 0 && Math.sin(p + s + time * 2) > 0.3) {
            ctx.fillStyle = `rgba(255, 255, 255, ${(strokeAlpha * 1.4).toFixed(3)})`;
            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        }
        ctx.stroke();
      }

      // 3. Draw tiny luminous floating dust particles
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        pt.x += pt.speedX;
        pt.y += pt.speedY;
        pt.pulse += pt.pulseSpeed;

        // Wrap around boundaries
        if (pt.x < 0) pt.x = width;
        if (pt.x > width) pt.x = 0;
        if (pt.y < height * 0.25) pt.y = height * 0.95;
        if (pt.y > height) pt.y = height * 0.3;

        const currentAlpha = pt.alpha * (0.6 + 0.4 * Math.sin(pt.pulse));
        ctx.fillStyle = `rgba(240, 245, 255, ${currentAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`}
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
};
