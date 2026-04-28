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

export interface FaqItem {
    question: string;
    answer: string;
}
