'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Github, Twitter, Linkedin } from 'lucide-react';

const footerLinks = {
    Product: [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Sandbox', href: '/sandbox' },
    ],
    Company: [
        { label: 'About Us', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Contact', href: '#' },
    ],
    Legal: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' },
    ],
};

const socials = [
    { icon: Github, label: 'GitHub', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
];

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-border/40 bg-background pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <a href="#" className="inline-flex items-center gap-2.5 mb-4 group">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                                <Zap className="w-4 h-4 text-white fill-white" />
                            </div>
                            <span className="text-base font-bold">FlawLess</span>
                        </a>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-[220px]">
                            Build powerful AI agents without code. Automate your workflows effortlessly.
                        </p>
                        <div className="flex gap-2">
                            {socials.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-9 h-9 rounded-lg border border-border/60 bg-card/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent/30 transition-all duration-200 cursor-pointer"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([group, links]) => (
                        <div key={group}>
                            <h5 className="text-sm font-semibold mb-4">{group}</h5>
                            <ul className="space-y-2.5">
                                {links.map(({ label, href }) => (
                                    <li key={label}>
                                        <a
                                            href={href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                                        >
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} FlawLess. All rights reserved.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Built with ♥ for AI builders everywhere.
                    </p>
                </div>
            </div>
        </footer>
    );
};
