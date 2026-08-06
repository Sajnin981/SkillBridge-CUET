import { api, type ApiEnvelope } from '@/api/axios';

interface ResumeAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  keywordsDetected: string[];
  isPlaceholder: boolean;
}

interface Recommendation {
  opportunityId: string;
  title: string;
  company: string;
  matchScore: number;
  matchReasons: string[];
}

interface CandidateMatch {
  studentId: string;
  fullName: string;
  matchScore: number;
  matchReasons: string[];
}

export const aiService = {
  async analyzeResume(resumeText?: string): Promise<{ score: number; summary: string; strengths: string[]; weaknesses: string[]; missingSkills: string[]; suggestions: string[] } | null> {
    const res = await api.post<ApiEnvelope<{ analysis: ResumeAnalysis }>>('/ai/resume-analysis', { resumeText });
    const a = res.data.data.analysis;
    return {
      score: a.score,
      summary: a.summary,
      strengths: a.strengths,
      weaknesses: a.gaps,
      missingSkills: [],
      suggestions: a.suggestions,
    };
  },

  async getRecommendations(): Promise<{ opportunityId: string; matchScore: number; reason: string; missingSkills: string[] }[]> {
    const res = await api.get<ApiEnvelope<{ recommendations: Recommendation[]; isPlaceholder: boolean }>>('/ai/recommendations');
    return res.data.data.recommendations.map((r) => ({
      opportunityId: r.opportunityId,
      matchScore: r.matchScore,
      reason: r.matchReasons.join(', '),
      missingSkills: [],
    }));
  },

  async getCandidateMatches(opportunityId?: string): Promise<{ applicantId: string; matchScore: number; reason: string; skillsMatched: string[] }[]> {
    const res = await api.post<ApiEnvelope<{ candidates: CandidateMatch[]; isPlaceholder: boolean }>>('/ai/candidate-matching', { opportunityId });
    return res.data.data.candidates.map((c) => ({
      applicantId: c.studentId,
      matchScore: c.matchScore,
      reason: c.matchReasons.join(', '),
      skillsMatched: [],
    }));
  },

  async getLogs(): Promise<{ id: string; feature: string; user: string; email: string; score: number; duration: string; status: string; time: string }[]> {
    const res = await api.get<ApiEnvelope<{ items: { _id: string; feature: string; requester: { fullName?: string; companyName?: string; email: string } | string; durationMs: number; createdAt: string }[]; pagination: unknown }>>('/admin/ai-logs');
    return res.data.data.items.map((l) => {
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
    });
  },
};
