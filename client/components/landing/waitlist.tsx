'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Users, Loader2 } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '') + '/api';

const TOTAL_SPOTS = 6_000;

const benefits = [
    '25% lifetime discount',
    'Exclusive beta features',
    'Direct product team access',
    'Shape the roadmap',
];

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const Waitlist: React.FC = () => {
    const shouldReduce = useReducedMotion();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        fetch(`${API_BASE}/waitlist/count`)
            .then((r) => r.json())
            .then((d) => setCount(d.count))
            .catch(() => setCount(null));
    }, []);

    const filledPct = count !== null ? Math.min((count / TOTAL_SPOTS) * 100, 100) : 88;
    const displayCount = count !== null ? count.toLocaleString() : '5,287';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/waitlist/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), source: 'landing' }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(res.status === 409
                    ? "You're already on the waitlist — we'll be in touch soon!"
                    : (data.error || 'Something went wrong. Please try again.'));
                return;
            }
            if (data.count !== undefined) setCount(data.count);
            setSubmitted(true);
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="waitlist" className="bg-fl-dark">
            <div className="h-px bg-fl-line-dark" />

            <div className="max-w-[1400px] mx-auto px-9 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* Left — copy */}
                    <motion.div
                        initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, ease }}
                    >
                        <p className="label-factory mb-4">Early Access</p>
                        <h2 className="text-[40px] md:text-[52px] font-normal tracking-factory-h2 leading-none text-fl-ink-inv mb-6">
                            Ready to build the software of the future?
                        </h2>
                        <p className="text-[15px] text-fl-ink-3 leading-relaxed mb-10">
                            Be among the first to experience the future of AI agent building.
                            Beta launches soon — spots are limited.
                        </p>

                        <ul className="space-y-3 mb-10">
                            {benefits.map((b) => (
                                <li key={b} className="flex items-center gap-3 text-[13px] text-fl-ink-inv/80">
                                    <Check className="w-3.5 h-3.5 text-fl-accent shrink-0" />
                                    {b}
                                </li>
                            ))}
                        </ul>

                        {/* Progress bar */}
                        <div className="border border-fl-line-dark rounded-lg p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-fl-accent" />
                                <span className="text-[13px] text-fl-ink-inv/80">
                                    {displayCount} of {TOTAL_SPOTS.toLocaleString()} spots filled
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-fl-line-dark overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${filledPct}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: shouldReduce ? 0 : 1.2, ease: 'easeOut', delay: 0.3 }}
                                    className="h-full rounded-full bg-fl-accent"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Right — form */}
                    <motion.div
                        initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: 0.1, ease }}
                        className="border border-fl-line-dark rounded-lg p-8 bg-fl-dark-2"
                    >
                        {submitted ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-full border border-fl-accent/30 flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-6 h-6 text-fl-accent" />
                                </div>
                                <h3 className="text-[18px] font-normal text-fl-ink-inv mb-2">You're on the list!</h3>
                                <p className="text-[13px] text-fl-ink-3">
                                    We'll notify you the moment your spot is ready.
                                </p>
                            </div>
                        ) : (
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="wl-name" className="block text-[11px] uppercase tracking-[0.06em] text-fl-ink-3 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        id="wl-name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-[4px] border border-fl-line-dark bg-fl-dark text-fl-ink-inv placeholder:text-fl-ink-3 focus:outline-none focus:border-fl-accent/60 transition-colors text-[14px]"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="wl-email" className="block text-[11px] uppercase tracking-[0.06em] text-fl-ink-3 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="wl-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        className="w-full px-3 py-2.5 rounded-[4px] border border-fl-line-dark bg-fl-dark text-fl-ink-inv placeholder:text-fl-ink-3 focus:outline-none focus:border-fl-accent/60 transition-colors text-[14px]"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                {error && (
                                    <p className="text-[13px] text-red-400 border border-red-400/20 rounded-[4px] px-3 py-2">
                                        {error}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-fl-accent w-full justify-center text-[14px] py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            Secure Your Spot
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </button>
                                <p className="text-[11px] text-fl-ink-3 text-center">
                                    No spam, unsubscribe at any time.
                                </p>
                            </form>
                        )}
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
