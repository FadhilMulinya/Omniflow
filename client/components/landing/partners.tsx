'use client';

import React from 'react';
import { motion } from 'framer-motion';

const partners = ['TechCorp', 'AILabs', 'FutureX', 'NexGen', 'DataFlow', 'Axiom', 'Orbital', 'Synapse'];

export const Partners: React.FC = () => {
    // Duplicate for seamless loop
    const items = [...partners, ...partners];

    return (
        <section className="py-14 border-y border-border/40 bg-background overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-8">
                <p className="text-center text-sm font-medium text-muted-foreground tracking-widest uppercase">
                    Trusted by innovative teams worldwide
                </p>
            </div>

            {/* Marquee */}
            <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
                <motion.div
                    className="flex gap-12 shrink-0"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                        duration: 24,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    style={{ willChange: 'transform' }}
                >
                    {items.map((name, i) => (
                        <div
                            key={`${name}-${i}`}
                            className="flex items-center justify-center px-8 py-3 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm whitespace-nowrap shrink-0 hover:border-primary/30 transition-colors duration-200"
                        >
                            <span className="text-base font-bold text-muted-foreground/70 hover:text-muted-foreground transition-colors duration-200 tracking-tight">
                                {name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
