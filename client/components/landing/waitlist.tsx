import React from 'react';

export const Waitlist: React.FC = () => {
    return (
        <section id="waitlist" className="py-20 bg-muted/20">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2 p-10 md:p-12" data-aos="fade-right">
                            <h2 className="text-3xl font-bold mb-4">Join Our Waitlist</h2>
                            <p className="mb-8">
                                Be among the first to experience the future of AI agent building. Our beta is
                                launching soon.
                            </p>
                            <form className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium mb-1"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground transition-all focus:ring-2 focus:ring-primary focus:border-primary text-base"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium mb-1"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground transition-all focus:ring-2 focus:ring-primary focus:border-primary text-base"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105 animate-glow"
                                >
                                    Secure Your Spot
                                </button>
                            </form>
                        </div>
                        <div
                            className="relative w-full md:w-1/2 bg-primary p-10 md:p-12 flex items-center justify-center overflow-hidden"
                            data-aos="fade-left"
                        >
                            <div className="relative text-center text-white">
                                <h3 className="text-2xl font-bold mb-6">Early Access Benefits</h3>
                                <ul className="space-y-4 text-left">
                                    {[
                                        '25% discount for life',
                                        'Exclusive beta features',
                                        'Direct access to our team',
                                        'Shape the product roadmap',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-6 w-6 mr-2 flex-shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8">
                                    <p className="text-white/80 mb-2">Users already on the waitlist</p>
                                    <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white rounded-full progress-fill"
                                            style={{ width: '85%' }}
                                        ></div>
                                    </div>
                                    <p className="text-white/80 mt-2 text-sm">5,287 of 6,000 spots filled</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
