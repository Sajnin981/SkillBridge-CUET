export type BackendRole = 'student' | 'company' | 'admin';

export type BackendOpportunityType =
  | 'internship'
  | 'job'
  | 'research'
  | 'industrial-training'
  | 'competition'
  | 'freelancing';

export type BackendApplicationStatus =
  | 'new'
  | 'pending'
  | 'shortlisted'
  | 'rejected'
  | 'withdrawn';

export type BackendAccountStatus = 'pending' | 'approved' | 'rejected';

export interface BackendStudent {
  _id: string;
  fullName: string;
  email: string;
  studentId: string;
  department: string;
  batch: string;
  phone: string;
  idCardUrl: string;
  resumeUrl?: string;
  aiResumeUrl?: string;
  sharedResumeUrl?: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    facebook?: string;
    portfolio?: string;
    website?: string;
  };
  education?: BackendEducation[];
  experience?: BackendExperience[];
  certifications?: BackendCertification[];
  achievements?: BackendAchievement[];
  portfolio?: string[];
  savedOpportunities?: string[];
  status: BackendAccountStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCompanySettings {
  notifications: { newApplicants: boolean; dailyDigest: boolean; messages: boolean; weeklyReport: boolean };
}

export interface BackendCompany {
  _id: string;
  companyName: string;
  hrName: string;
  email: string;
  phone: string;
  website?: string;
  industry: string;
  address: string;
  size?: string;
  founded?: string;
  logoUrl?: string;
  tradeLicenseUrl: string;
  description?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    facebook?: string;
    website?: string;
  };
  achievements?: string[];
  projects?: { title: string; description?: string; link?: string }[];
  status: BackendAccountStatus;
  rejectionReason?: string;
  settings?: BackendCompanySettings;
  createdAt: string;
  updatedAt: string;
}

export interface BackendAdmin {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendOpportunity {
  _id: string;
  company: string | { _id: string; companyName: string; logoUrl?: string; industry?: string; website?: string; description?: string };
  title: string;
  type: BackendOpportunityType;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  location?: string;
  isRemote?: boolean;
  salary?: string;
  deadline: string;
  openings?: number;
  tags?: string[];
  status: 'open' | 'closed';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendApplication {
  _id: string;
  opportunity: string | { _id: string; title: string; type: string; location: string; deadline: string; status: string };
  student: string | {
    _id: string;
    fullName: string;
    email: string;
    department: string;
    batch: string;
    phone: string;
    resumeUrl: string;
    avatarUrl?: string;
    skills?: string[];
  };
  company: string | { _id: string; companyName: string; logoUrl?: string };
  coverLetter?: string;
  resumeUrl: string;
  status: BackendApplicationStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendConversation {
  _id: string;
  student: string | { _id: string; fullName: string; avatarUrl?: string };
  company: string | { _id: string; companyName: string; logoUrl?: string };
  opportunity?: string | { _id: string; title: string; type: string } | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendMessage {
  _id: string;
  conversation: string;
  sender: string;
  senderModel: 'Student' | 'Company';
  content: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendNotification {
  _id: string;
  recipient: string;
  recipientModel: string;
  actor?: string;
  actorModel?: string;
  title: string;
  body: string;
  type?: string;
  link?: string;
  postId?: string;
  opportunityId?: string;
  applicationId?: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface BackendAILog {
  _id: string;
  feature: string;
  requester: string | { _id: string; fullName?: string; companyName?: string; email: string };
  requesterModel: string;
  inputSummary: string;
  outputSummary: string;
  durationMs: number;
  createdAt: string;
}

export interface BackendEducation {
  institution: string;
  degree: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
}

export interface BackendExperience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface BackendCertification {
  name: string;
  issuer?: string;
  date?: string;
  credentialUrl?: string;
}

export interface BackendAchievement {
  title: string;
  description?: string;
  date?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
