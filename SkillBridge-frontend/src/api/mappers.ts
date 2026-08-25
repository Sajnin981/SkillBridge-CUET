import type {
  BackendStudent, BackendCompany, BackendAdmin, BackendOpportunity, BackendApplication,
  BackendConversation, BackendMessage, BackendNotification, BackendAILog, BackendOpportunityType,
} from './types';
import type {
  StudentProfile, Company, Opportunity, Applicant, Notification, Skill,
  OpportunityType, ApplicationStatus,
} from '@/lib/types';
import { colorFromString } from '@/lib/utils';

const typeMap: Record<BackendOpportunityType, OpportunityType> = {
  internship: 'Internship',
  job: 'Job',
  research: 'Research',
  'industrial-training': 'Internship',
  competition: 'Competition',
  freelancing: 'Freelancing',
};

export function mapStudent(s: BackendStudent): { id: string; name: string; email: string; avatar: string; role: 'student'; status: string } {
  return {
    id: s._id,
    name: s.fullName,
    email: s.email,
    avatar: s.avatarUrl || s.fullName.slice(0, 2).toUpperCase(),
    role: 'student',
    status: s.status,
  };
}

export function mapStudentProfile(s: BackendStudent): StudentProfile {
  return {
    name: s.fullName,
    avatar: s.avatarUrl || s.fullName.slice(0, 2).toUpperCase(),
    email: s.email,
    phone: s.phone,
    title: `${s.department} · Batch ${s.batch}`,
    department: s.department,
    cgpa: 0,
    batch: s.batch,
    location: '',
    bio: s.bio || '',
    skills: (s.skills || []).map((name) => ({ name } as Skill)),
    projects: (s.portfolio || []).map((p) => ({ title: p, description: '', link: '' })),
    achievements: (s.achievements || []).map((a) => a.title),
    certifications: (s.certifications || []).map((c) => ({ name: c.name, issuer: c.issuer || '', year: c.date || '' })),
    education: (s.education || []).map((e) => ({ institution: e.institution, degree: e.degree, field: e.field || '', start: e.startYear || '', end: e.endYear || '', cgpa: 0 })),
    experience: (s.experience || []).map((e) => ({ company: e.company, role: e.position, start: e.startDate || '', end: e.endDate || '', description: e.description || '' })),
    resumeUrl: s.resumeUrl,
    resumeScore: 0,
    social: {},
  };
}

export function mapCompany(c: BackendCompany): Company {
  return {
    id: c._id,
    name: c.companyName,
    logo: c.logoUrl ? '' : c.companyName.slice(0, 2).toUpperCase(),
    industry: c.industry,
    location: c.address,
    website: c.website || '',
    about: c.description || '',
    size: '',
    founded: '',
    status: c.status === 'approved' ? 'verified' : c.status === 'rejected' ? 'rejected' : 'pending',
    verifiedAt: c.createdAt,
    openRoles: 0,
    totalHires: 0,
  };
}

export function mapCompanyUser(c: BackendCompany): { id: string; name: string; email: string; avatar: string; role: 'company'; status: string } {
  return {
    id: c._id,
    name: c.companyName,
    email: c.email,
    avatar: c.logoUrl || c.companyName.slice(0, 2).toUpperCase(),
    role: 'company',
    status: c.status,
  };
}

export function mapAdmin(a: BackendAdmin): { id: string; name: string; email: string; avatar: string; role: 'admin' } {
  return {
    id: a._id,
    name: a.name,
    email: a.email,
    avatar: a.name.slice(0, 2).toUpperCase(),
    role: 'admin',
  };
}

export function mapOpportunity(o: BackendOpportunity): Opportunity {
  const companyRef = typeof o.company === 'object' ? o.company : null;
  return {
    id: o._id,
    title: o.title,
    company: companyRef?.companyName || 'Unknown Company',
    companyLogo: companyRef?.logoUrl || (companyRef?.companyName || 'CO').slice(0, 2).toUpperCase(),
    companyId: companyRef?._id || (typeof o.company === 'string' ? o.company : ''),
    type: typeMap[o.type] || 'Internship',
    category: typeMap[o.type] || 'Internship',
    location: o.location || 'Remote',
    remote: o.isRemote || false,
    salary: o.salary || '—',
    stipend: o.salary || '',
    experience: 'Any',
    deadline: o.deadline,
    postedAt: o.createdAt,
    openings: o.openings || 1,
    applicants: 0,
    description: o.description,
    responsibilities: o.responsibilities || [],
    requirements: o.requirements || [],
    skills: o.tags || [],
    tags: o.tags || [],
    saved: false,
    applied: false,
  };
}

export function mapApplicant(a: BackendApplication): Applicant {
  const studentRef = typeof a.student === 'object' ? a.student : null;
  const statusMap: Record<string, ApplicationStatus> = {
    pending: 'submitted',
    reviewing: 'reviewing',
    shortlisted: 'shortlisted',
    interview: 'interview',
    offered: 'offered',
    rejected: 'rejected',
    withdrawn: 'rejected',
  };
  return {
    id: a._id,
    name: studentRef?.fullName || 'Applicant',
    avatar: studentRef?.avatarUrl || (studentRef?.fullName || 'AP').slice(0, 2).toUpperCase(),
    email: studentRef?.email || '',
    department: studentRef?.department || '',
    cgpa: 0,
    batch: studentRef?.batch || '',
    skills: studentRef?.skills || [],
    matchScore: 0,
    status: statusMap[a.status] || 'submitted',
    appliedAt: a.createdAt,
    resumeScore: 0,
    experience: '',
    shortlisted: a.status === 'shortlisted',
    rejected: a.status === 'rejected',
  };
}

export function mapConversation(c: BackendConversation) {
  const studentRef = typeof c.student === 'object' ? c.student : null;
  const companyRef = typeof c.company === 'object' ? c.company : null;
  const oppRef = c.opportunity && typeof c.opportunity === 'object' ? c.opportunity : null;
  return {
    id: c._id,
    name: companyRef?.companyName || studentRef?.fullName || 'Unknown',
    avatar: companyRef?.logoUrl || studentRef?.avatarUrl || colorFromString(c._id),
    role: oppRef?.title || '',
    last: '',
    time: new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    unread: 0,
    online: false,
  };
}

export function mapMessage(m: BackendMessage, currentUserRole?: string, currentUserId?: string) {
  let isMe = false;
  if (currentUserId && m.sender === currentUserId) {
    isMe = true;
  } else if (currentUserRole === 'student') {
    isMe = m.senderModel === 'Student';
  } else if (currentUserRole === 'company') {
    isMe = m.senderModel === 'Company';
  } else {
    isMe = m.senderModel === 'Student';
  }

  return {
    id: m._id,
    from: (isMe ? 'me' : 'them') as 'me' | 'them',
    text: m.content,
    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export function mapNotification(n: BackendNotification): Notification {
  return {
    id: n._id,
    type: (n.type === 'application' ? 'application' : n.type === 'opportunity' ? 'opportunity' : n.type === 'message' ? 'message' : 'system') as Notification['type'],
    title: n.title,
    message: n.body,
    time: n.createdAt,
    read: n.isRead,
  };
}

export function mapAILog(l: BackendAILog) {
  const requesterRef = typeof l.requester === 'object' ? l.requester : null;
  const featureLabel = l.feature === 'resume-analysis' ? 'Resume Analysis' : l.feature === 'recommendation' ? 'Opportunity Recommendation' : 'Candidate Matching';
  return {
    id: l._id,
    feature: featureLabel,
    user: requesterRef?.fullName || requesterRef?.companyName || 'Unknown',
    email: requesterRef?.email || '',
    score: 0,
    duration: `${l.durationMs}ms`,
    status: 'Success',
    time: l.createdAt,
  };
}
