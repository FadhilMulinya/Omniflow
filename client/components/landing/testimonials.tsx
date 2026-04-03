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
        <section id="testimonials" className="py-24 bg-fl-surface">
            <div className="max-w-[1400px] mx-auto px-9">
                {/* Header */}
                <div className="mb-16">
                    <div className="rule-factory mb-8" />
                    <p className="label-factory mb-4">Case Studies</p>
                    <h2 className="text-[40px] md:text-[52px] font-normal tracking-factory-h2 leading-none text-fl-ink">
                        Loved by builders worldwide
                    </h2>
                </div>

                {/* Carousel */}
                <div className="max-w-3xl">
                    <div className="relative overflow-hidden min-h-[260px] flex items-center">
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
                                <div className="p-8 border border-fl-line rounded-lg bg-fl-base">
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-5">
                                        {Array.from({ length: t.rating }).map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-fl-accent text-fl-accent" />
                                        ))}
                                    </div>

                                    <blockquote className="text-[17px] leading-relaxed mb-7 text-fl-ink font-normal">
                                        "{t.quote}"
                                    </blockquote>

                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full border border-fl-line flex items-center justify-center bg-fl-surface shrink-0">
                                            <span className="text-[12px] font-medium text-fl-accent">
                                                {t.author.initials}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-[14px] font-normal text-fl-ink">{t.author.name}</div>
                                            <div className="text-[12px] text-fl-ink-3">
                                                {t.author.role} · {t.author.company}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-5">
                        <div className="flex gap-2">
                            <button
                                onClick={() => go(-1)}
                                className="w-9 h-9 border border-fl-line rounded-[4px] flex items-center justify-center text-fl-ink-2 hover:border-fl-line-2 transition-colors cursor-pointer"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => go(1)}
                                className="w-9 h-9 border border-fl-line rounded-[4px] flex items-center justify-center text-fl-ink-2 hover:border-fl-line-2 transition-colors cursor-pointer"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex gap-1.5">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setDirection(i > currentTestimonial ? 1 : -1); setCurrentTestimonial(i); }}
                                    className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                                        i === currentTestimonial ? 'w-6 bg-fl-accent' : 'w-1 bg-fl-line hover:bg-fl-ink-3'
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
