import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import NotFoundPage from '@/pages/NotFoundPage';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage';
import VerificationPendingPage from '@/pages/auth/VerificationPendingPage';

import PublicOpportunitiesPage from '@/pages/public/PublicOpportunitiesPage';
import PublicCompaniesPage from '@/pages/public/PublicCompaniesPage';
import PublicFAQPage from '@/pages/public/PublicFAQPage';
import AboutPage from '@/pages/public/AboutPage';

import StudentDashboard from '@/pages/student/StudentDashboard';
import OpportunityListingPage from '@/pages/student/OpportunityListingPage';
import OpportunityDetailsPage from '@/pages/student/OpportunityDetailsPage';
import StudentProfilePage from '@/pages/student/StudentProfilePage';
import AppliedOpportunitiesPage from '@/pages/student/AppliedOpportunitiesPage';
import SavedOpportunitiesPage from '@/pages/student/SavedOpportunitiesPage';
import AIRecommendationsPage from '@/pages/student/AIRecommendationsPage';
import NotificationsPage from '@/pages/student/NotificationsPage';
import SettingsPage from '@/pages/student/SettingsPage';
import StudentMessagingPage from '@/pages/student/StudentMessagingPage';
import StudentResumePage from '@/pages/student/StudentResumePage';

import CompanyDashboard from '@/pages/company/CompanyDashboard';
import CompanyProfilePage from '@/pages/company/CompanyProfilePage';
import PostOpportunityPage from '@/pages/company/PostOpportunityPage';
import ManageOpportunitiesPage from '@/pages/company/ManageOpportunitiesPage';
import ApplicantsPage from '@/pages/company/ApplicantsPage';
import MessagingPage from '@/pages/company/MessagingPage';
import CompanySettingsPage from '@/pages/company/CompanySettingsPage';
import CompanyAnalyticsPage from '@/pages/company/CompanyAnalyticsPage';
import ViewCompanyProfilePage from '@/pages/shared/ViewCompanyProfilePage';
import ViewStudentProfilePage from '@/pages/shared/ViewStudentProfilePage';
import SearchPage from '@/pages/shared/SearchPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/opportunities" element={<PublicOpportunitiesPage />} />
            <Route path="/companies" element={<PublicCompaniesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<PublicFAQPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/verification-pending" element={<VerificationPendingPage />} />

            {/* Student */}
            <Route path="/student" element={<ProtectedRoute role="student"><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="opportunities" element={<OpportunityListingPage />} />
              <Route path="opportunities/:id" element={<OpportunityDetailsPage />} />
              <Route path="applied" element={<AppliedOpportunitiesPage />} />
              <Route path="saved" element={<SavedOpportunitiesPage />} />
              <Route path="recommendations" element={<AIRecommendationsPage />} />
              <Route path="messages" element={<StudentMessagingPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="companies/:id" element={<ViewCompanyProfilePage />} />
              <Route path="students/:id" element={<ViewStudentProfilePage />} />
              <Route path="resume" element={<StudentResumePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Company */}
            <Route path="/company" element={<ProtectedRoute role="company"><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<CompanyDashboard />} />
              <Route path="profile" element={<CompanyProfilePage />} />
              <Route path="opportunities" element={<ManageOpportunitiesPage />} />
              <Route path="opportunities/new" element={<PostOpportunityPage />} />
              <Route path="applicants" element={<ApplicantsPage />} />
              <Route path="messages" element={<MessagingPage />} />
              <Route path="analytics" element={<CompanyAnalyticsPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="students/:id" element={<ViewStudentProfilePage />} />
              <Route path="companies/:id" element={<ViewCompanyProfilePage />} />
              <Route path="settings" element={<CompanySettingsPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
