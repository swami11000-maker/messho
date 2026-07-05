'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';

const VALUES = ['₹0', '₹35', '₹50', '₹55', '₹76', '₹114', '₹230'];

const SPIN_DURATION = 6000;

const NORMAL_COLORS = ['#7c3aed', '#0284c7', '#0f766e', '#65a30d', '#c2410c', '#be123c', '#0891b2', '#4f46e5', '#9333ea', '#16a34a', '#ea580c'];

const BULB_COLORS = ['#fff176', '#ff1744', '#00e5ff', '#76ff03', '#ff9100', '#e040fb', '#40c4ff', '#ffd600'];

type Segment = { value: string; color: string; textColor: string; isJackpot: boolean; isZero: boolean };

export default function SpinPage({ onSpin }: { onSpin?: () => Promise<number> }) {
  const discRef = useRef<HTMLDivElement | null>(null);
  const animationPlayerRef = useRef<Animation | null>(null);
  const rotationRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [bulbTick, setBulbTick] = useState(0);

  const segments = useMemo<Segment[]>(() => {
    let colorIndex = 0;

    return VALUES.map((item) => {
      const lower = item.toLowerCase();

      if (lower.includes('jackpot')) {
        return { value: item, color: '#f4b400', textColor: '#fff7a3', isJackpot: true, isZero: false };
      }

      if (item.trim() === '₹0') {
        return { value: item, color: '#e50914', textColor: '#ffffff', isJackpot: false, isZero: true };
      }

      const color = NORMAL_COLORS[colorIndex % NORMAL_COLORS.length];
      colorIndex++;

      return { value: item, color, textColor: '#ffffff', isJackpot: false, isZero: false };
    });
  }, []);

  const segmentAngle = 360 / segments.length;

  // --- Gradient starts at 0deg (top) to match pointer ---
  const conicGradient = useMemo(() => {
    return `conic-gradient(${segments
      .map((item, index) => {
        const start = index * segmentAngle;
        const end = (index + 1) * segmentAngle;
        return `${item.color} ${start}deg ${end}deg`;
      })
      .join(', ')})`;
  }, [segments, segmentAngle]);

  const lineGradient = useMemo(() => {
    return `repeating-conic-gradient(
      transparent 0deg,
      transparent ${segmentAngle - 1.2}deg,
      rgba(0,0,0,0.7) ${segmentAngle - 1.2}deg,
      rgba(0,0,0,0.7) ${segmentAngle}deg
    )`;
  }, [segmentAngle]);

  // --- Audio helpers ---
  const initAudio = () => {
    if (typeof window === 'undefined') return null;
    const win = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const AudioCtx = globalThis.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }
    const audioContext = audioContextRef.current;
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }
    return audioContext;
  };

  const playBeep = (frequency = 650, duration = 0.04, volume = 0.035, type: OscillatorType = 'square') => {
    if (!soundOn) return;
    const ctx = initAudio();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const stopTickSound = () => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  };

  const startTickSound = () => {
    if (!soundOn) return;
    stopTickSound();
    tickIntervalRef.current = setInterval(() => {
      playBeep(950, 0.025, 0.018, 'square');
    }, 120);
  };

  const playEndSound = (segment: Segment) => {
    if (!soundOn) return;
    if (segment.isJackpot) {
      playBeep(900, 0.09, 0.045, 'triangle');
      setTimeout(() => playBeep(1200, 0.1, 0.045, 'triangle'), 120);
      setTimeout(() => playBeep(1500, 0.16, 0.05, 'triangle'), 260);
      return;
    }
    if (segment.isZero) {
      playBeep(180, 0.22, 0.04, 'sawtooth');
      return;
    }
    playBeep(650, 0.08, 0.035, 'triangle');
    setTimeout(() => playBeep(950, 0.1, 0.035, 'triangle'), 120);
  };

  // --- Spin logic (rotation calculation fixed for gradient starting at 0deg) ---
  const spinNow = async () => {
    if (spinning) return;
    const disc = discRef.current;
    if (!disc) return;

    setResult(null);
    setSpinning(true);

    let targetIndex: number;

    try {
      const reward = await onSpin?.();
      const numericReward = typeof reward === 'number' ? reward : 0;
      targetIndex = segments.findIndex(
        (seg) => Number(seg.value.replace(/[^\d]/g, '')) === numericReward
      );
      if (targetIndex === -1) targetIndex = 0;
    } catch (error) {
      setSpinning(false);
      setResult(error instanceof Error ? error.message : 'Spin failed');
      return;
    }

    initAudio();

    if (animationPlayerRef.current) {
      animationPlayerRef.current.cancel();
      animationPlayerRef.current = null;
    }

    // Random offset to avoid always landing exactly in the centre
    const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.6);

    // Angle of the target segment centre (measured from top, 0deg)
    const centerDeg = targetIndex * segmentAngle + segmentAngle / 2 + randomOffset;

    // Required rotation to bring that centre to the top pointer
    const requiredAngle = (360 - centerDeg) % 360;

    const currentRotation = rotationRef.current;
    const currentMod = ((currentRotation % 360) + 360) % 360;

    const delta = (requiredAngle - currentMod + 360) % 360;

    // Add full revolutions for visual effect
    const rounds = 18;
    const finalRotation = currentRotation + rounds * 360 + delta;

    // Set starting transform
    disc.style.transform = `rotate(${currentRotation}deg)`;

    startTickSound();

    const player = disc.animate(
      [
        { transform: `rotate(${currentRotation}deg)` },
        { transform: `rotate(${finalRotation}deg)` },
      ],
      {
        duration: SPIN_DURATION,
        easing: 'cubic-bezier(0.08, 0.82, 0.14, 1)',
        fill: 'forwards',
      }
    );

    animationPlayerRef.current = player;

    player.onfinish = () => {
      stopTickSound();

      disc.style.transform = `rotate(${finalRotation}deg)`;
      rotationRef.current = finalRotation;
      setSpinning(false);

      const selected = segments[targetIndex];
      setResult(selected.value);
      playEndSound(selected);

      animationPlayerRef.current = null;
    };
  };

  // --- Bulb animation ---
  useEffect(() => {
    if (!spinning) {
      setBulbTick(0);
      return;
    }
    const bulbTimer = setInterval(() => {
      setBulbTick((prev) => prev + 1);
    }, 100);
    return () => clearInterval(bulbTimer);
  }, [spinning]);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      stopTickSound();
      if (animationPlayerRef.current) {
        animationPlayerRef.current.cancel();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // --- Initial rotation (0deg) ---
  useEffect(() => {
    if (discRef.current) {
      discRef.current.style.transform = 'rotate(0deg)';
    }
  }, []);

  return (
    <section
      style={{
        width: 'min(95vw, 760px)',
        borderRadius: 34,
        border: '1px solid rgba(234, 223, 205, 0.95)',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(255,250,241,0.82))',
        boxShadow: '0 40px 110px rgba(16,25,54,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
        padding: '18px',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 30,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.9), rgba(255,244,218,0.78))',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            inset: '8%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.2), transparent 68%)',
            filter: 'blur(10px)',
          }}
        />

        {/* Shadow */}
        <div
          style={{
            position: 'absolute',
            bottom: '7%',
            left: '50%',
            width: '64%',
            height: '11%',
            transform: 'translateX(-50%)',
            borderRadius: 999,
            background: 'rgba(15,23,42,0.24)',
            filter: 'blur(25px)',
          }}
        />

        {/* Pointer */}
        <div
          style={{
            position: 'absolute',
            top: '1.5%',
            left: '50%',
            zIndex: 80,
            width: '13%',
            height: '15%',
            transform: 'translateX(-50%)',
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(180deg, #fff7a3 0%, #f59e0b 46%, #92400e 100%)',
            filter: 'drop-shadow(0 9px 10px rgba(0,0,0,0.5))',
          }}
        />

        {/* Wheel outer ring */}
        <div
          style={{
            position: 'relative',
            width: '90%',
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'radial-gradient(circle at 30% 22%, #fff7b0 0%, #ffd64d 18%, #f59e0b 48%, #d97706 70%, #92400e 100%)',
            boxShadow:
              '0 0 35px rgba(245,158,11,0.58), 0 28px 70px rgba(0,0,0,0.24), inset 0 5px 10px rgba(255,255,255,0.55), inset 0 -12px 22px rgba(120,53,15,0.5)',
          }}
        >
          {/* Bulbs */}
          {Array.from({ length: 44 }).map((_, index) => {
            const angle = (index / 44) * 360;
            const rad = (angle * Math.PI) / 180;
            const bulbColor = spinning ? BULB_COLORS[(index + bulbTick) % BULB_COLORS.length] : '#fff8b4';
            const isOn = spinning ? (index + bulbTick) % 2 === 0 : true;
            return (
              <span
                key={index}
                style={{
                  position: 'absolute',
                  zIndex: 60,
                  width: 'clamp(8px, 1.9vw, 16px)',
                  height: 'clamp(8px, 1.9vw, 16px)',
                  left: `${50 + Math.cos(rad) * 47}%`,
                  top: `${50 + Math.sin(rad) * 47}%`,
                  transform: `translate(-50%, -50%) scale(${isOn ? 1.18 : 0.75})`,
                  borderRadius: '50%',
                  background: isOn ? bulbColor : '#5b3b0a',
                  opacity: isOn ? 1 : 0.32,
                  transition: 'all 0.1s ease',
                  boxShadow: isOn
                    ? `0 0 10px ${bulbColor}, 0 0 22px ${bulbColor}, 0 0 38px ${bulbColor}, inset -2px -3px 4px rgba(0,0,0,0.25)`
                    : 'inset 0 0 8px rgba(0,0,0,0.45)',
                }}
              />
            );
          })}

          {/* Inner background */}
          <div style={{ position: 'absolute', inset: '8.5%', borderRadius: '50%', background: '#4b2600' }} />

          {/* Decorative ring */}
          <div
            style={{
              position: 'absolute',
              inset: '3.2%',
              zIndex: 35,
              borderRadius: '50%',
              pointerEvents: 'none',
              border: 'clamp(10px, 2.5vw, 18px) solid #fbbf24',
              boxShadow: 'inset 0 0 0 4px rgba(255,255,255,0.5), 0 0 0 4px #b45309',
            }}
          />

          {/* Wheel disc – transform controlled via ref */}
          <div
            ref={discRef}
            style={{
              position: 'relative',
              zIndex: 25,
              width: '82%',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              borderRadius: '50%',
              background: conicGradient,
              willChange: 'transform',
              boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.42), inset 0 -38px 72px rgba(0,0,0,0.38)',
            }}
          >
            {/* Separation lines */}
            <div
              style={{
                pointerEvents: 'none',
                position: 'absolute',
                inset: 0,
                zIndex: 20,
                borderRadius: '50%',
                background: lineGradient,
              }}
            />

            {/* Segment labels */}
            {segments.map((item, index) => {
              const angle = index * segmentAngle + segmentAngle / 2;
              return (
                <span
                  key={`${item.value}-${index}`}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    zIndex: 30,
                    color: item.textColor,
                    fontSize: item.isJackpot ? 'clamp(9px, 1.75vw, 17px)' : 'clamp(12px, 2.35vw, 22px)',
                    fontWeight: 950,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    textShadow: '0 3px 8px rgba(0,0,0,0.85)',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(clamp(-182px, -25.5vw, -84px)) rotate(90deg)`,
                  }}
                >
                  {item.value}
                </span>
              );
            })}

            {/* Shine overlay */}
            <div
              style={{
                pointerEvents: 'none',
                position: 'absolute',
                inset: 0,
                zIndex: 40,
                borderRadius: '50%',
                mixBlendMode: 'screen',
                background:
                  'radial-gradient(circle at 28% 18%, rgba(255,255,255,0.42), transparent 30%), linear-gradient(140deg, rgba(255,255,255,0.2), transparent 46%)',
              }}
            />
          </div>

          {/* SPIN button */}
          <button
            type="button"
            onClick={spinNow}
            disabled={spinning}
            style={{
              position: 'absolute',
              zIndex: 90,
              width: '20%',
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              border: 'clamp(4px, 1.4vw, 8px) solid #ffe082',
              display: 'grid',
              placeItems: 'center',
              cursor: spinning ? 'not-allowed' : 'pointer',
              background: 'radial-gradient(circle at 28% 22%, #fff7c2 0%, #facc15 35%, #f59e0b 72%, #b45309 100%)',
              boxShadow:
                '0 16px 38px rgba(0,0,0,0.42), inset 0 4px 8px rgba(255,255,255,0.48), inset 0 -8px 12px rgba(146,64,14,0.48)',
              opacity: spinning ? 0.78 : 1,
            }}
          >
            <span style={{ fontSize: 'clamp(12px, 2.1vw, 21px)', fontWeight: 950, color: '#7c3f00', userSelect: 'none' }}>
              {spinning ? 'WAIT' : 'SPIN'}
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
        <p className="font-black text-[#101936]">
          {result ? `Result: ${result}` : spinning ? 'Wheel spinning...' : 'Ready to spin'}
        </p>
        <button
          type="button"
          onClick={() => setSoundOn((enabled) => !enabled)}
          className="flex items-center gap-2 rounded-2xl border border-[#eadfcd] bg-white/70 px-4 py-2 text-sm font-black text-[#101936]"
        >
          <Volume2 size={17} />
          {soundOn ? 'Sound on' : 'Sound off'}
        </button>
      </div>
    </section>
  );
}