'use client';
import React, { useState, useEffect, useRef } from 'react';
import 'aos/dist/aos.css';
import AOS from 'aos';

import {
  Navigation,
  Hero,
  Partners,
  Features,
  HowItWorks,
  Testimonials,
  Pricing,
  Faq,
  Waitlist,
  Footer,
  testimonials,
  pricingPlans,
  faqItems
} from '@/components/landing';

const AIBuilderLandingPage: React.FC = () => {
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State for testimonial carousel
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // State for FAQ accordion
  const [openFaqItem, setOpenFaqItem] = useState<number | null>(null);

  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Ref for back to top button
  const backToTopBtnRef = useRef<HTMLButtonElement>(null);

  // Handle scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Handle smooth scrolling for anchor links
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
      });

      // Close mobile menu if open
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }
  };

  // Initialize AOS and handle dark mode detection
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
    });

    // Dark mode detection
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
    };

    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);

    // Handle back to top button visibility
    const handleScroll = () => {
      if (window.scrollY > 300) {
        backToTopBtnRef.current?.classList.remove('scale-0');
        backToTopBtnRef.current?.classList.add('scale-100');
      } else {
        backToTopBtnRef.current?.classList.remove('scale-100');
        backToTopBtnRef.current?.classList.add('scale-0');
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup event listeners
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/30">
      <Navigation
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleAnchorClick={handleAnchorClick}
      />

      <main>
        <Hero handleAnchorClick={handleAnchorClick} />
        <Partners />
        <Features />
        <HowItWorks />
        <Testimonials
          testimonials={testimonials}
          currentTestimonial={currentTestimonial}
          setCurrentTestimonial={setCurrentTestimonial}
        />
        <Pricing pricingPlans={pricingPlans} handleAnchorClick={handleAnchorClick} />
        <Faq
          faqItems={faqItems}
          openFaqItem={openFaqItem}
          setOpenFaqItem={setOpenFaqItem}
        />
        <Waitlist />
      </main>

      <Footer />

      {/* Back to top button */}
      <button
        ref={backToTopBtnRef}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 scale-0 transform hover:-translate-y-1 focus:outline-none ring-offset-background focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Back to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </div>
  );
};

export default AIBuilderLandingPage;
