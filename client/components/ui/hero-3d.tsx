'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const RING_CONFIG = [
  { tiltX: 72, speed: 9,  radius: 148, nodeCount: 3, opacity: 0.55, primary: true },
  { tiltX: 55, speed: 14, radius: 108, nodeCount: 2, opacity: 0.40, primary: false },
  { tiltX: 20, speed: 22, radius: 170, nodeCount: 4, opacity: 0.25, primary: false },
];

interface OrbitalRingProps {
  tiltX: number;
  speed: number;
  radius: number;
  nodeCount: number;
  opacity: number;
  primary: boolean;
  reduced: boolean;
}

function OrbitalRing({ tiltX, speed, radius, nodeCount, opacity, primary, reduced }: OrbitalRingProps) {
  const nodeAngles = Array.from({ length: nodeCount }, (_, i) => (i / nodeCount) * 360);
  const col = primary ? 'oklch(0.68 0.2 277)' : 'oklch(0.62 0.15 290)';

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: radius * 2,
        height: radius * 2,
        marginTop: -radius,
        marginLeft: -radius,
        transformStyle: 'preserve-3d',
        transform: `rotateX(${tiltX}deg)`,
      }}
    >
      <motion.div
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 0,
          border: `1px solid ${col}`,
          borderRadius: '50%',
          opacity,
        }}
      >
        {nodeAngles.map((angle, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `rotate(${angle}deg) translateY(-${radius}px)`,
              marginTop: -4,
              marginLeft: -4,
            }}
          >
            <div
              style={{
                width: primary ? 8 : 6,
                height: primary ? 8 : 6,
                borderRadius: '50%',
                backgroundColor: col,
                boxShadow: `0 0 ${primary ? 12 : 8}px ${col}`,
              }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function Hero3DOrb({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion() ?? false;
  const SIZE = 360;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: SIZE, height: SIZE }}
    >
      {/* Soft ambient glow blobs */}
      <div
        className="absolute rounded-full bg-primary/10 blur-3xl pointer-events-none"
        style={{ width: SIZE * 0.9, height: SIZE * 0.9 }}
      />
      <div
        className="absolute rounded-full bg-violet-500/8 blur-2xl pointer-events-none"
        style={{ width: SIZE * 0.5, height: SIZE * 0.5, top: '20%', left: '20%' }}
      />

      {/* 3-D scene — perspective container */}
      <div
        style={{ perspective: 520, width: SIZE, height: SIZE, position: 'absolute', inset: 0 }}
      >
        <motion.div
          animate={reduced ? {} : { rotateX: [18, 28, 18] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            transformStyle: 'preserve-3d',
            width: SIZE,
            height: SIZE,
            position: 'relative',
          }}
        >
          {RING_CONFIG.map((cfg, i) => (
            <OrbitalRing key={i} {...cfg} reduced={reduced} />
          ))}

          {/* Central core */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) translateZ(0px)',
              zIndex: 10,
            }}
          >
            <motion.div
              animate={reduced ? {} : { scale: [1, 1.12, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, oklch(0.75 0.22 277) 0%, oklch(0.55 0.2 277) 60%, transparent 100%)',
                boxShadow:
                  '0 0 24px oklch(0.65 0.2 277 / 0.8), 0 0 60px oklch(0.65 0.2 277 / 0.3)',
              }}
            />
            {/* Inner ring around core */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 64,
                height: 64,
                marginTop: -32,
                marginLeft: -32,
                borderRadius: '50%',
                border: '1px solid oklch(0.68 0.2 277 / 0.5)',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Floating stat chips — positioned around the orb */}
      {[
        { label: '12K+ Agents',    top: '8%',  right: '4%'  },
        { label: '99.9% Uptime',   bottom: '10%', left: '0%' },
        { label: '80+ Integrations', top: '50%', right: '-2%' },
      ].map(({ label, ...pos }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{ position: 'absolute', ...pos }}
          className="px-3 py-1.5 rounded-full border border-border/60 bg-background/70 backdrop-blur-sm text-[11px] font-semibold text-muted-foreground whitespace-nowrap"
        >
          {label}
        </motion.div>
      ))}
    </div>
  );
}
