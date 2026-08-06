import type { OpportunityType } from '@/lib/types';

export const trustedCompanies = ['Brain Station 23', 'Pathao', 'Telenor Health', 'ShopUp', 'SELISE', 'Enosis', 'DataSoft'];

export const testimonials = [
  { name: 'Tasnim Rahman', role: 'SWE Intern, Brain Station 23', avatar: 'TR', quote: 'SkillBridge matched me with my dream internship in days. The AI resume analysis helped me fix gaps I didn\'t even know I had.', rating: 5 },
  { name: 'Imran Kabir', role: 'Talent Lead, Pathao', avatar: 'IK', quote: 'We hired 6 verified CUET students through SkillBridge this season. The candidate ranking saved our team hours of screening.', rating: 5 },
  { name: 'Sadia Islam', role: 'ML Researcher, Telenor Health', avatar: 'SI', quote: 'The AI recommendations surfaced research roles I wouldn\'t have found otherwise. Now I\'m publishing papers.', rating: 5 },
];

export const faqs = [
  { q: 'Who can use SkillBridge CUET?', a: 'Verified CUET students and verified companies. Students apply with their CUET email; companies undergo admin verification before posting.' },
  { q: 'Is SkillBridge free for students?', a: 'Yes. Students can register, build a profile, upload a resume, and apply to unlimited opportunities at no cost.' },
  { q: 'How does company verification work?', a: 'After registering, companies submit their profile and verification documents. An admin reviews and approves verified companies, who can then post opportunities.' },
  { q: 'What are the AI features?', a: 'AI Resume Analysis scores your CV and suggests improvements, AI Recommendations match opportunities to your skills, and AI Candidate Matching ranks applicants for companies.' },
  { q: 'What types of opportunities are available?', a: 'Internships, full-time jobs, freelancing, research, competitions, scholarships, and part-time roles.' },
  { q: 'How do I apply to an opportunity?', a: 'Open any opportunity, review the details, and click Apply. Your profile and resume are sent to the company for review.' },
];

export const platformStats = [
  { label: 'Verified Students', value: 4800, suffix: '+' },
  { label: 'Verified Companies', value: 120, suffix: '+' },
  { label: 'Opportunities Posted', value: 850, suffix: '+' },
  { label: 'Successful Hires', value: 640, suffix: '+' },
];

export const categories: { type: OpportunityType; icon: string; count: number; description: string }[] = [
  { type: 'Internship', icon: 'Briefcase', count: 48, description: 'Hands-on roles to launch your career' },
  { type: 'Job', icon: 'Building2', count: 32, description: 'Full-time positions at top companies' },
  { type: 'Freelancing', icon: 'Laptop', count: 19, description: 'Flexible project-based work' },
  { type: 'Research', icon: 'FlaskConical', count: 12, description: 'Academic and industry research' },
  { type: 'Competition', icon: 'Trophy', count: 8, description: 'Hackathons and contests with prizes' },
  { type: 'Scholarship', icon: 'GraduationCap', count: 6, description: 'Financial aid and merit awards' },
  { type: 'Part-time', icon: 'Clock', count: 24, description: 'Roles that fit your schedule' },
];
