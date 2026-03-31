'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    MousePointerClick,
    Plug,
    LayoutTemplate,
    Zap,
    ShieldCheck,
    BarChart3,
} from 'lucide-react';

const features = [
    {
        icon: MousePointerClick,
        title: 'Drag-and-Drop Workflow',
        description:
            'Build complex AI pipelines visually. Connect nodes, define logic, and watch agents come alive — no engineering background needed.',
        size: 'large', // spans 2 cols on desktop
        accent: 'text-primary',
        bg: 'bg-primary/8',
    },
    {
        icon: Plug,
        title: '100+ Integrations',
        description: 'Slack, Salesforce, Google Workspace, Zapier, and more. Connect everything seamlessly.',
        size: 'normal',
        accent: 'text-violet-500',
        bg: 'bg-violet-500/8',
    },
    {
        icon: LayoutTemplate,
        title: 'Template Library',
        description: 'Hit the ground running with pre-built agent templates for every use case.',
        size: 'normal',
        accent: 'text-indigo-500',
        bg: 'bg-indigo-500/8',
    },
    {
        icon: Zap,
        title: 'Real-time Testing',
        description: 'Iterate instantly. Debug, tweak, and validate your agent before pushing to production.',
        size: 'normal',
        accent: 'text-amber-500',
        bg: 'bg-amber-500/8',
    },
    {
        icon: ShieldCheck,
        title: 'Enterprise Security',
        description: 'End-to-end encryption, RBAC, SOC 2 compliance, and audit logs out of the box.',
        size: 'normal',
        accent: 'text-emerald-500',
        bg: 'bg-emerald-500/8',
    },
    {
        icon: BarChart3,
        title: 'Deep Analytics',
        description: 'Track every execution. Understand performance trends and optimize automatically.',
        size: 'normal',
        accent: 'text-sky-500',
        bg: 'bg-sky-500/8',
    },
];

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const cardVariants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export const Features: React.FC = () => {
    const shouldReduce = useReducedMotion();

    return (
        <section id="features" className="py-28 bg-background">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-16 max-w-2xl mx-auto"
                >
                    <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-4">
                        Capabilities
                    </p>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
                        Everything you need to ship
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        A complete platform to build, test, and deploy intelligent AI agents — without
                        writing a single line of code.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <motion.div
                    variants={shouldReduce ? {} : containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-60px' }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        const isLarge = f.size === 'large';
                        return (
                            <motion.div
                                key={f.title}
                                variants={shouldReduce ? {} : cardVariants}
                                whileHover={shouldReduce ? {} : { y: -4, transition: { duration: 0.2 } }}
                                className={`group relative p-7 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm hover:border-primary/30 hover:bg-card/70 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 cursor-default ${
                                    isLarge ? 'lg:col-span-2' : ''
                                }`}
                            >
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200`}>
                                    <Icon className={`w-6 h-6 ${f.accent}`} />
                                </div>

                                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-[15px]">
                                    {f.description}
                                </p>

                                {/* Subtle corner accent on large card */}
                                {isLarge && (
                                    <div className="absolute bottom-0 right-0 w-32 h-32 rounded-br-2xl bg-gradient-to-tl from-primary/6 to-transparent pointer-events-none" />
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};
