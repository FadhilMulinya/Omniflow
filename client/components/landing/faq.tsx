'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { FaqItem } from './types';

interface FaqProps {
    faqItems: FaqItem[];
    openFaqItem: number | null;
    setOpenFaqItem: (index: number | null) => void;
}

export const Faq: React.FC<FaqProps> = ({ faqItems, openFaqItem, setOpenFaqItem }) => {
    const shouldReduce = useReducedMotion();

    return (
        <section id="faq" className="py-28 bg-background">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left — sticky header */}
                    <motion.div
                        initial={{ opacity: 0, x: shouldReduce ? 0 : -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full lg:w-80 shrink-0 lg:sticky lg:top-28 lg:self-start"
                    >
                        <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-4">
                            FAQ
                        </p>
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
                            Common questions
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Everything you need to know before getting started. Still have questions?{' '}
                            <a href="#waitlist" className="text-primary hover:underline font-medium cursor-pointer">
                                Contact us
                            </a>
                            .
                        </p>
                    </motion.div>

                    {/* Right — accordion */}
                    <div className="flex-1 flex flex-col gap-3">
                        {faqItems.map((item, i) => {
                            const isOpen = openFaqItem === i;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-30px' }}
                                    transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                    className={`rounded-2xl border transition-colors duration-200 overflow-hidden ${
                                        isOpen ? 'border-primary/40 bg-card/80' : 'border-border/60 bg-card/30 hover:border-border'
                                    }`}
                                >
                                    <button
                                        className="flex justify-between items-center w-full px-6 py-5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                                        onClick={() => setOpenFaqItem(isOpen ? null : i)}
                                        aria-expanded={isOpen}
                                    >
                                        <span className="font-semibold text-[15px] pr-4">{item.question}</span>
                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${isOpen ? 'bg-primary/10 text-primary' : 'bg-accent/50 text-muted-foreground'}`}>
                                            {isOpen
                                                ? <Minus className="w-3.5 h-3.5" />
                                                : <Plus className="w-3.5 h-3.5" />
                                            }
                                        </span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: shouldReduce ? 0 : 0.25, ease: 'easeOut' }}
                                                className="overflow-hidden"
                                            >
                                                <p className="px-6 pb-6 text-muted-foreground leading-relaxed text-[15px]">
                                                    {item.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
