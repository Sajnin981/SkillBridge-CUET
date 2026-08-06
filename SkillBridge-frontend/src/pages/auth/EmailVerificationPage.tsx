import { Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function EmailVerificationPage() {
  const { toast } = useToast();
  return (
    <AuthLayout title="Verify your email" subtitle="We've sent a verification link to your email address.">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Mail className="h-8 w-8" /></div>
        <p className="mt-4 text-sm text-ink-500">Click the link in the email to verify your account and continue.</p>
        <div className="mt-6 rounded-xl bg-ink-50 p-4 text-left">
          <div className="flex items-center gap-2 text-sm text-ink-600"><CheckCircle2 className="h-4 w-4 text-success-500" />Email sent to your inbox</div>
          <p className="mt-1.5 text-xs text-ink-400">Didn't receive it? Check your spam folder or resend.</p>
        </div>
        <Button variant="outline" className="mt-6 w-full" onClick={() => toast({ title: 'Verification email resent', variant: 'info' })}>
          <RefreshCw className="h-4 w-4" />Resend email
        </Button>
      </div>
    </AuthLayout>
  );
}
