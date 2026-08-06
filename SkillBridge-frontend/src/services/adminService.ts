function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const adminService = {
  async getStats() {
    await delay();
    return { totalStudents: 0, totalCompanies: 0, totalOpportunities: 0, pendingVerifications: 0 };
  },

  async getPendingVerifications() {
    await delay();
    return [];
  },

  async getPlatformActivity() {
    await delay();
    return [];
  },

  async getSystemHealth() {
    await delay();
    return [
      { label: 'API Status', value: 'Operational', tone: 'success' as const },
      { label: 'Database', value: 'Operational', tone: 'success' as const },
      { label: 'AI Service', value: 'Operational', tone: 'success' as const },
    ];
  },
};
