'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Testimonial } from './types';

interface TestimonialsProps {
    testimonials: Testimonial[];
    currentTestimonial: number;
    setCurrentTestimonial: (index: number) => void;
}

export const Testimonials: React.FC<TestimonialsProps> = ({
    testimonials,
    currentTestimonial,
    setCurrentTestimonial,
}) => {
    const shouldReduce = useReducedMotion();
    const [direction, setDirection] = useState(1);

    const go = useCallback(
        (dir: 1 | -1) => {
            setDirection(dir);
            setCurrentTestimonial(
                dir === 1
                    ? (currentTestimonial + 1) % testimonials.length
                    : (currentTestimonial - 1 + testimonials.length) % testimonials.length
            );
        },
        [currentTestimonial, testimonials.length, setCurrentTestimonial]
    );

    // Auto-advance
    useEffect(() => {
        if (shouldReduce) return;
        const id = setInterval(() => go(1), 6000);
        return () => clearInterval(id);
    }, [go, shouldReduce]);

    const variants = {
        enter: (d: number) => ({ opacity: 0, x: shouldReduce ? 0 : d * 60 }),
        center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
        exit: (d: number) => ({ opacity: 0, x: shouldReduce ? 0 : d * -60, transition: { duration: 0.3 } }),
    };

    const t = testimonials[currentTestimonial];

    return (
        <section id="testimonials" className="py-28 bg-background">
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
                        Social Proof
                    </p>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
                        Loved by builders worldwide
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Don't take our word for it. Here's what teams are saying.
                    </p>
                </motion.div>

                {/* Carousel */}
                <div className="max-w-3xl mx-auto">
                    <div className="relative overflow-hidden min-h-[280px] flex items-center">
                        <AnimatePresence custom={direction} mode="wait">
                            <motion.div
                                key={currentTestimonial}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="w-full"
                            >
                                <div className="p-8 md:p-10 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-sm">
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-6">
                                        {Array.from({ length: t.rating }).map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>

                                    <blockquote className="text-lg md:text-xl leading-relaxed mb-8 text-foreground font-medium">
                                        "{t.quote}"
                                    </blockquote>

                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-primary">
                                                {t.author.initials}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[15px]">{t.author.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {t.author.role} · {t.author.company}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-6">
                        <div className="flex gap-2">
                            <button
                                onClick={() => go(-1)}
                                className="w-10 h-10 rounded-xl border border-border/60 bg-card/50 flex items-center justify-center hover:border-primary/40 hover:bg-accent/30 transition-all duration-200 cursor-pointer"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => go(1)}
                                className="w-10 h-10 rounded-xl border border-border/60 bg-card/50 flex items-center justify-center hover:border-primary/40 hover:bg-accent/30 transition-all duration-200 cursor-pointer"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setDirection(i > currentTestimonial ? 1 : -1); setCurrentTestimonial(i); }}
                                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                        i === currentTestimonial ? 'w-8 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground'
                                    }`}
                                    aria-label={`Go to testimonial ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
