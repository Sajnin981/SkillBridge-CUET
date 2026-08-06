import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import OpportunityListingPage from '@/pages/student/OpportunityListingPage';

export default function PublicOpportunitiesPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="container-app py-8">
        <OpportunityListingPage />
      </div>
      <Footer />
    </div>
  );
}
