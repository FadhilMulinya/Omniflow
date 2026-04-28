import { Testimonial, FaqItem } from './types';

/** Waitlist section — capacity messaging */
export const WAITLIST_TOTAL_SPOTS = 6_000;

export const WAITLIST_BENEFITS = [
    '25% lifetime discount',
    'Exclusive beta features',
    'Direct product team access',
    'Shape the roadmap',
] as const;

export const testimonials: Testimonial[] = [
    {
        rating: 5,
        quote:
            'AI Builder has revolutionized how we handle customer inquiries. We built an AI agent that processes and categorizes customer emails, automatically routing them to the right department. What used to take hours now happens instantly.',
        author: {
            initials: 'SL',
            name: 'Sarah Lee',
            role: 'Customer Success Manager',
            company: 'TechCorp',
        },
    },
    {
        rating: 5,
        quote:
            'I was skeptical about no-code AI solutions, but AI Builder exceeded my expectations. We created a data analysis agent that automatically processes our weekly reports and sends insights to our team. The ROI has been incredible.',
        author: {
            initials: 'MJ',
            name: 'Marcus Johnson',
            role: 'Data Analyst',
            company: 'DataFlow',
        },
    },
    {
        rating: 5,
        quote:
            'AI Builder has saved our marketing team countless hours. We set up an agent to generate social media content ideas based on trending topics in our industry. What used to take days of brainstorming now happens at the click of a button.',
        author: {
            initials: 'RN',
            name: 'Rachel Nguyen',
            role: 'Marketing Director',
            company: 'NexGen',
        },
    },
];


export const faqItems: FaqItem[] = [
    {
        question: 'Do I need coding experience to use AI Builder?',
        answer:
            'No, AI Builder is designed for users with no coding experience. Our drag-and-drop interface makes it easy to create powerful AI agents without writing a single line of code. If you do have coding skills, you can use our advanced features to extend functionality.',
    },
    {
        question: 'What kinds of AI agents can I build?',
        answer:
            'The possibilities are nearly endless. Our users build AI agents for customer service, data analysis, content generation, social media management, lead qualification, and much more. Our template library provides starting points for common use cases.',
    },
    {
        question: 'How secure is my data on AI Builder?',
        answer:
            "Security is our top priority. We use industry-standard encryption for data in transit and at rest. We're SOC 2 compliant and offer enterprise-grade security features like role-based access control, audit logs, and data retention policies. We never use your data to train our models.",
    },
    {
        question: 'Can I integrate AI Builder with my existing tools?',
        answer:
            'Yes, we offer over 100 pre-built integrations with popular tools and services like Slack, Google Workspace, Salesforce, Zapier, and more. If you need a custom integration, our Enterprise plan includes custom integration development.',
    },
    {
        question: 'How much is the subscription?',
        answer:
            'The subscription is free for now',
    },
];
