import type { OpportunityType } from '@/lib/types';

export const trustedCompanies = ['Brain Station 23', 'Pathao', 'Telenor Health', 'ShopUp', 'SELISE', 'Enosis', 'DataSoft'];

export const testimonials = [
  { name: 'Tasnim Rahman', role: 'SWE Intern, Brain Station 23', avatar: 'TR', quote: 'SkillBridge helped me find my dream internship in days. Building out my profile made it easier to share my experience with employers.', rating: 5 },
  { name: 'Imran Kabir', role: 'Talent Lead, Pathao', avatar: 'IK', quote: 'We hired 6 verified CUET students through SkillBridge this season. The platform made it easier to review applications and connect with candidates.', rating: 5 },
  { name: 'Sadia Islam', role: 'ML Researcher, Telenor Health', avatar: 'SI', quote: 'SkillBridge helped me discover research roles I wouldn\'t have found otherwise. Now I\'m publishing papers.', rating: 5 },
];

export const platformStats = [
  { label: 'Verified Students', value: 4800, suffix: '+' },
  { label: 'Verified Companies', value: 120, suffix: '+' },
  { label: 'Opportunities Posted', value: 850, suffix: '+' },
  { label: 'Successful Hires', value: 640, suffix: '+' },
];

export const categories: { type: OpportunityType; icon: string; description: string }[] = [
  { type: 'Internship', icon: 'Briefcase', description: 'Hands-on roles to launch your career' },
  { type: 'Job', icon: 'Building2', description: 'Full-time positions at top companies' },
  { type: 'Freelancing', icon: 'Laptop', description: 'Flexible project-based work' },
  { type: 'Research', icon: 'FlaskConical', description: 'Academic and industry research' },
  { type: 'Competition', icon: 'Trophy', description: 'Hackathons and contests with prizes' },
];
