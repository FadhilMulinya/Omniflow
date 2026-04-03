'use client';

import React from 'react';
import { motion } from 'framer-motion';

const partners = ['TechCorp', 'AILabs', 'FutureX', 'NexGen', 'DataFlow', 'Axiom', 'Orbital', 'Synapse'];

export const Partners: React.FC = () => {
    const items = [...partners, ...partners];

    return (
        <section className="border-y border-fl-line bg-fl-surface overflow-hidden py-10">
            <div className="max-w-[1400px] mx-auto px-9 mb-6">
                <p className="label-factory" style={{ color: 'var(--fl-ink-3)' }}>
                    Trusted by teams at
                </p>
            </div>

            <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                <motion.div
                    className="flex gap-14 shrink-0"
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    style={{ willChange: 'transform' }}
                >
                    {items.map((name, i) => (
                        <span
                            key={`${name}-${i}`}
                            className="text-[15px] font-medium text-fl-line-2 whitespace-nowrap shrink-0 hover:text-fl-ink-2 transition-colors duration-200"
                        >
                            {name}
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
