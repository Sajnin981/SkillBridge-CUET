export type Role = 'student' | 'company' | 'admin';

export type OpportunityType =
  | 'Internship'
  | 'Job'
  | 'Freelancing'
  | 'Research'
  | 'Competition'
  | 'Scholarship'
  | 'Part-time';

export type ApplicationStatus = 'submitted' | 'shortlisted' | 'rejected';

export type CompanyStatus = 'pending' | 'verified' | 'rejected';

export interface Skill {
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  companyId: string;
  type: OpportunityType;
  category: string;
  location: string;
  remote: boolean;
  salary: string;
  stipend?: string;
  experience: string;
  deadline: string;
  postedAt: string;
  openings: number;
  applicants: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  tags: string[];
  saved?: boolean;
  applied?: boolean;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  website: string;
  about: string;
  achievements: string[];
  projects: { title: string; description: string; link: string }[];
  size: string;
  founded: string;
  status: CompanyStatus;
  verifiedAt?: string;
  openRoles: number;
  totalHires: number;
}

export interface Applicant {
  id: string;
  studentId: string;
  opportunityId: string;
  name: string;
  avatar: string;
  email: string;
  department: string;
  batch: string;
  skills: string[];
  matchScore: number;
  status: ApplicationStatus;
  appliedAt: string;
  resumeUrl: string;
  shortlisted?: boolean;
  rejected?: boolean;
}

export interface StudentProfile {
  name: string;
  avatar: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  batch: string;
  bio: string;
  skills: Skill[];
  projects: { title: string; description: string; link: string }[];
  achievements: string[];
  certifications: { name: string; issuer: string; year: string }[];
  education: { institution: string; degree: string; field: string; start: string; end: string; grade: string }[];
  experience: { company: string; role: string; start: string; end: string; description: string }[];
  resumeUrl?: string;
  social: { github?: string; linkedin?: string; facebook?: string; portfolio?: string; website?: string };
}

export interface Notification {
  id: string;
  type: 'application' | 'opportunity' | 'system' | 'message' | 'post';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
  opportunityId?: string;
  applicationId?: string;
  postId?: string;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info' | 'warning';
}
