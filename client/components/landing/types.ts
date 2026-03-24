export interface Testimonial {
    rating: number;
    quote: string;
    author: {
        initials: string;
        name: string;
        role: string;
        company: string;
    };
}

export interface PricingPlan {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    popular?: boolean;
    detailedFeatures: string[];
    ctaText: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}
