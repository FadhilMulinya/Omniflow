import React from 'react';

interface HeroProps {
    handleAnchorClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ handleAnchorClick }) => {
    return (
        <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 hero-gradient">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
                {/* Animated grid background */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(#5D5CDE 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                    }}
                ></div>
            </div>
            <div className="container mx-auto px-4 relative">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="w-full lg:w-1/2" data-aos="fade-right" data-aos-duration="1000">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Build AI Agents <br />
                            Without Code
                        </h1>
                        <p className="text-lg md:text-xl mb-8 max-w-xl">
                            Create powerful, autonomous AI workflows in minutes, not months. Our intuitive
                            platform makes automation accessible to everyone.
                        </p>
                        <div
                            className="flex flex-col sm:flex-row gap-4"
                            data-aos="fade-up"
                            data-aos-delay="300"
                        >
                            <a
                                href="/signup"
                                className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full text-lg font-bold shadow-xl hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
                            >
                                Start Building Free
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 ml-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </a>
                            <a
                                href="#how-it-works"
                                className="px-8 py-3 bg-transparent border border-primary text-primary dark:text-white hover:bg-primary/10 rounded-full text-lg font-medium transition-all duration-300 flex items-center justify-center"
                                onClick={(e) => handleAnchorClick(e, '#how-it-works')}
                            >
                                How It Works
                            </a>
                        </div>
                    </div>
                    <div
                        className="w-full lg:w-1/2 flex justify-center"
                        data-aos="fade-left"
                        data-aos-duration="1000"
                    >
                        {/* AI Bot Animation */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 animate-float">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/40 rounded-full opacity-20 blur-xl animate-pulse-slow"></div>
                            <div className="absolute inset-8 bg-card rounded-full shadow-lg"></div>
                            <div className="absolute inset-10 rounded-full overflow-hidden bg-background flex items-center justify-center">
                                {/* Robot Face */}
                                <div className="relative w-full h-full">
                                    {/* Eyes */}
                                    <div className="absolute w-6 h-6 bg-neonblue rounded-full left-1/3 top-1/3 transform -translate-x-1/2 -translate-y-1/2 ai-bot-eye"></div>
                                    <div className="absolute w-6 h-6 bg-neonblue rounded-full right-1/3 top-1/3 transform translate-x-1/2 -translate-y-1/2 ai-bot-eye"></div>
                                    {/* Mouth */}
                                    <div className="absolute w-16 h-2 bg-neonblue rounded-full bottom-1/3 left-1/2 transform -translate-x-1/2"></div>
                                    {/* Circuit lines */}
                                    <div className="absolute w-full h-full">
                                        <div className="absolute w-1 h-12 bg-primary/40 top-1/2 left-1/4"></div>
                                        <div className="absolute w-12 h-1 bg-primary/40 top-1/4 right-1/4"></div>
                                        <div className="absolute w-1 h-16 bg-primary/40 bottom-1/4 right-1/3"></div>
                                        <div className="absolute w-16 h-1 bg-primary/40 bottom-1/3 left-1/3"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
