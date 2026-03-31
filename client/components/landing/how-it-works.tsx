'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Workflow, Rocket, Check } from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: BookOpen,
        label: 'Step 1',
        title: 'Choose a template or start from scratch',
        description:
            'Pick from our library of industry-specific AI agent templates, or open a blank canvas and build exactly what you need.',
        bullets: ['Industry-specific templates', 'Customisable starting points', 'Blank canvas for full control'],
        accent: 'from-primary/20 to-primary/5',
        iconColor: 'text-primary',
        iconBg: 'bg-primary/10',
    },
    {
        number: '02',
        icon: Workflow,
        label: 'Step 2',
        title: 'Design your workflow with drag-and-drop',
        description:
            'Connect triggers, actions, and conditions visually. Our smart connector UI makes even complex logic feel simple.',
        bullets: ['Visual flow builder', 'Pre-built components', 'Smart logic connectors'],
        accent: 'from-violet-500/20 to-violet-500/5',
        iconColor: 'text-violet-500',
        iconBg: 'bg-violet-500/10',
    },
    {
        number: '03',
        icon: Rocket,
        label: 'Step 3',
        title: 'Test, deploy, and monitor your agent',
        description:
            'Validate in real-time, ship with one click, and watch your agent perform in production with full observability.',
        bullets: ['One-click deployment', 'Real-time monitoring', 'Seamless iteration'],
        accent: 'from-amber-500/20 to-amber-500/5',
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-500/10',
    },
];

export const HowItWorks: React.FC = () => {
    const shouldReduce = useReducedMotion();

    return (
        <section id="how-it-works" className="py-28 bg-muted/20 relative overflow-hidden">
            {/* Subtle background depth */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-20 max-w-2xl mx-auto"
                >
                    <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-4">
                        Process
                    </p>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
                        From idea to agent in minutes
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Three simple steps — and you have a live, autonomous AI agent working for you.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="flex flex-col gap-16">
                    {steps.map((step, i) => {
                        const Icon = step.icon;
                        const isReverse = i % 2 !== 0;
                        return (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: shouldReduce ? 0 : (isReverse ? 40 : -40) }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                className={`flex flex-col md:flex-row items-center gap-10 ${isReverse ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Content */}
                                <div className="w-full md:w-1/2">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-primary/8 text-primary border border-primary/20 mb-4">
                                        {step.label}
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-snug">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground mb-6 leading-relaxed">
                                        {step.description}
                                    </p>
                                    <ul className="space-y-2.5">
                                        {step.bullets.map((b) => (
                                            <li key={b} className="flex items-center gap-3 text-[15px]">
                                                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Check className="w-3 h-3 text-primary" />
                                                </span>
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Visual card */}
                                <div className="w-full md:w-1/2">
                                    <motion.div
                                        whileHover={shouldReduce ? {} : { y: -6, transition: { duration: 0.25 } }}
                                        className={`relative rounded-2xl border border-border/60 bg-gradient-to-br ${step.accent} p-8 shadow-sm overflow-hidden`}
                                    >
                                        {/* Step number watermark */}
                                        <span className="absolute top-4 right-6 text-7xl font-black text-foreground/5 select-none leading-none">
                                            {step.number}
                                        </span>

                                        {/* Icon */}
                                        <div className={`w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center mb-6`}>
                                            <Icon className={`w-7 h-7 ${step.iconColor}`} />
                                        </div>

                                        {/* Mock UI */}
                                        <div className="space-y-3">
                                            {[80, 60, 45, 70].map((w, j) => (
                                                <motion.div
                                                    key={j}
                                                    initial={{ scaleX: 0 }}
                                                    whileInView={{ scaleX: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.3 + j * 0.08, duration: 0.5, ease: 'easeOut' }}
                                                    style={{ originX: 0 }}
                                                    className={`h-2.5 rounded-full bg-foreground/10 w-[${w}%]`}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
