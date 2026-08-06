import { Clock, ShieldCheck, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';

export default function VerificationPendingPage() {
  return (
    <AuthLayout side="company" title="Verification in progress" subtitle="Your company account is being reviewed by our admin team.">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning-50 text-warning-600"><Clock className="h-8 w-8" /></div>
        <h3 className="mt-4 text-lg font-semibold text-ink-800">Pending verification</h3>
        <p className="mt-2 text-sm text-ink-500">Our admin team reviews every company to keep SkillBridge safe. You'll be notified by email once your company is approved — usually within 1-2 business days.</p>
        <div className="mt-6 space-y-2 rounded-xl bg-ink-50 p-4 text-left">
          <div className="flex items-center gap-2 text-sm text-ink-600"><ShieldCheck className="h-4 w-4 text-brand-500" />Verification keeps the platform trusted</div>
          <div className="flex items-center gap-2 text-sm text-ink-600"><Building2 className="h-4 w-4 text-brand-500" />You can post opportunities once approved</div>
        </div>
        <Link to="/login"><Button variant="outline" className="mt-6 w-full">Back to sign in</Button></Link>
      </div>
    </AuthLayout>
  );
}
