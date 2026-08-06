function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const aiService = {
  async analyzeResume(): Promise<{ score: number; summary: string; strengths: string[]; weaknesses: string[]; missingSkills: string[]; suggestions: string[] } | null> {
    await delay(600);
    return null;
  },

  async getRecommendations(): Promise<{ opportunityId: string; matchScore: number; reason: string; missingSkills: string[] }[]> {
    await delay();
    return [];
  },

  async getCandidateMatches(): Promise<{ applicantId: string; matchScore: number; reason: string; skillsMatched: string[] }[]> {
    await delay();
    return [];
  },

  async getLogs(): Promise<{ id: string; feature: string; user: string; email: string; score: number; duration: string; status: string; time: string }[]> {
    await delay();
    return [];
  },
};
