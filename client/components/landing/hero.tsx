'use client';

import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { InfiniteGridBackground } from '@/components/ui/the-infinite-grid';
import { Hero3DOrb } from '@/components/ui/hero-3d';

interface HeroProps {
  handleAnchorClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ handleAnchorClick }) => {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const bgY  = useTransform(scrollYProgress, [0, 1], shouldReduce ? [0, 0] : [0, -100]);
  const fgY  = useTransform(scrollYProgress, [0, 1], shouldReduce ? [0, 0] : [0, -30]);
  const orbY = useTransform(scrollYProgress, [0, 1], shouldReduce ? [0, 0] : [0, -60]);

  const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      {/* Background parallax layer */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0 pointer-events-none">
        <InfiniteGridBackground className="absolute inset-0 w-full h-full bg-background" />
      </motion.div>

      {/* Extra depth orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 right-[8%] w-72 h-72 rounded-full bg-primary/8 blur-[90px]" />
        <div className="absolute bottom-1/4 left-[3%]  w-56 h-56 rounded-full bg-violet-500/6 blur-[70px]" />
      </div>

      {/* Foreground content */}
      <motion.div style={{ y: fgY }} className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-0">

            {/* ── Left column ── */}
            <div className="w-full lg:w-[54%] flex flex-col gap-7">
              <motion.div
                initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium text-primary"
              >
                <Sparkles className="w-3.5 h-3.5" />
                No-code AI workflow builder
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: shouldReduce ? 0 : 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1, ease }}
                className="text-5xl md:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[1.04] text-foreground"
              >
                Build AI Agents
                <br />
                <span className="text-primary">Without Code</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease }}
                className="text-lg md:text-xl text-muted-foreground max-w-[480px] leading-relaxed"
              >
                Connect your tools, define your logic, deploy — no engineering team required.
                From idea to live AI agent in minutes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3, ease }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary hover:bg-primary/90 text-white text-base font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 cursor-pointer"
                >
                  Start Building Free
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-border hover:border-primary/50 text-foreground text-base font-medium rounded-xl transition-all duration-200 hover:bg-accent/30 cursor-pointer"
                  onClick={(e) => handleAnchorClick(e, '#how-it-works')}
                >
                  See how it works
                </a>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45, ease }}
                className="text-sm text-muted-foreground"
              >
                Free 14-day trial · No credit card required · Cancel anytime
              </motion.p>
            </div>

            {/* ── Right column — 3D orb ── */}
            <motion.div
              style={{ y: orbY }}
              initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease }}
              className="w-full lg:w-[46%] flex justify-center lg:justify-end"
            >
              <Hero3DOrb />
            </motion.div>

          </div>
        </div>
      </motion.div>
    </section>
  );
};
