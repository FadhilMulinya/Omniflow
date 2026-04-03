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
        <section id="faq" className="py-24 bg-fl-base">
            <div className="max-w-[1400px] mx-auto px-9">
                {/* Header */}
                <div className="mb-16">
                    <div className="rule-factory mb-8" />
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div>
                            <p className="label-factory mb-4">FAQ</p>
                            <h2 className="text-[40px] md:text-[52px] font-normal tracking-factory-h2 leading-none text-fl-ink">
                                Common questions
                            </h2>
                        </div>
                        <p className="text-[14px] text-fl-ink-2 max-w-[340px]">
                            Everything you need to know. Still have questions?{' '}
                            <a href="#waitlist" className="text-fl-accent hover:underline cursor-pointer">
                                Contact us
                            </a>
                            .
                        </p>
                    </div>
                </div>

                {/* Accordion */}
                <div className="flex flex-col max-w-3xl">
                    {faqItems.map((item, i) => {
                        const isOpen = openFaqItem === i;
                        return (
                            <div key={i}>
                                <div className="h-px bg-fl-line" />
                                <button
                                    className="flex justify-between items-center w-full py-5 text-left cursor-pointer group"
                                    onClick={() => setOpenFaqItem(isOpen ? null : i)}
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-[15px] font-normal text-fl-ink pr-6 group-hover:text-fl-accent transition-colors">
                                        {item.question}
                                    </span>
                                    <span className={`w-6 h-6 border rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                                        isOpen ? 'border-fl-accent text-fl-accent' : 'border-fl-line text-fl-ink-3'
                                    }`}>
                                        {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                    </span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: shouldReduce ? 0 : 0.2, ease: 'easeOut' }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pb-5 text-[14px] text-fl-ink-2 leading-relaxed">
                                                {item.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                    <div className="h-px bg-fl-line" />
                </div>
            </div>
        </section>
    );
};
