'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MousePointerClick, Plug, LayoutTemplate, Zap, ShieldCheck, BarChart3 } from 'lucide-react';

import { landingEase } from '@/components/landing/motion-ease';

const ease = landingEase;

const features = [
    {
        icon: MousePointerClick, label: '01', title: 'Automatic Money Actions',
        description: 'When money arrives, it instantly follows your rules  no manual overhead needed.',
        size: 'large'
    },
    {
        icon: Plug, label: '02', title: 'Smart Fund Splitting',
        description: 'Split incoming funds across accounts, wallets, or protocols based on custom rules.', size: 'normal'
    },
    {
        icon: LayoutTemplate, label: '03', title: 'Always in Control',
        description: 'You decide the rules. You can change or stop them anytime.', size: 'normal'
    },
    {
        icon: Zap, label: '04', title: 'Social Notifications',
        description: 'Get notified on your preffered network when your wallet does anything.', size: 'normal'
    },
    {
        icon: ShieldCheck, label: '05', title: 'Live Activity Updates',
        description: 'See exactly what happened to your money, clearly and in real time.', size: 'normal'
    },
    {
        icon: BarChart3, label: '06', title: 'Deep Analytics',
        description: 'Track every execution. Understand performance trends and optimize automatically.', size: 'full'
    },
];

export const Features: React.FC = () => {
    const shouldReduce = useReducedMotion();

    return (
        <section id="features" className="py-24 bg-fl-base">
            <div className="max-w-[1400px] mx-auto px-9">

                <div className="mb-16">
                    <div className="rule-factory mb-8" />
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="label-factory mb-4">Capabilities</p>
                            <h2 className="text-[40px] md:text-[52px] font-normal tracking-factory-h2 leading-none text-fl-ink max-w-[480px]">
                                Everything you need to automate money in real time
                            </h2>
                        </div>
                        <p className="text-[15px] text-fl-ink-2 leading-relaxed max-w-[380px]">
                            A real-time system that reacts to incoming funds and executes financial actions instantly
                            no manual steps required.
                        </p>
                    </div>
                </div>

                {/* Grid separated by 1px token-coloured borders */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-fl-line">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        const isLarge = f.size === 'large';
                        const isFull  = f.size === 'full';
                        return (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.45, delay: i * 0.05, ease }}
                                className={`relative p-8 bg-fl-surface hover:bg-fl-surface-2 transition-colors duration-200 group cursor-default
                                    ${isLarge ? 'lg:col-span-2' : ''}
                                    ${isFull  ? 'lg:col-span-3' : ''}
                                `}
                            >
                                <span className="text-[11px] uppercase tracking-[0.06em] text-fl-ink-3 mb-6 block">
                                    {f.label}
                                </span>

                                <div className="w-10 h-10 rounded-lg border border-fl-line bg-fl-base flex items-center justify-center mb-5 group-hover:border-fl-accent/40 transition-colors">
                                    <Icon className="w-5 h-5 text-fl-ink-2 group-hover:text-fl-accent transition-colors" />
                                </div>

                                <h3 className="text-[17px] font-normal tracking-factory-nav text-fl-ink mb-3">
                                    {f.title}
                                </h3>
                                <p className="text-[14px] text-fl-ink-3 leading-relaxed">
                                    {f.description}
                                </p>

                                {/* Orange bottom accent on hover */}
                                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-fl-accent group-hover:w-full transition-all duration-300" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};