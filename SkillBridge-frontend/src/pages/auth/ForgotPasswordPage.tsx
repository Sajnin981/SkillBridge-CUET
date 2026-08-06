import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast({ title: 'Reset link sent', description: 'Check your inbox for the link.', variant: 'success' });
  };

  return (
    <AuthLayout title="Forgot password" subtitle="Enter your email and we'll send you a reset link.">
      {sent ? (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-600"><CheckCircle2 className="h-8 w-8" /></div>
          <h3 className="mt-4 text-lg font-semibold text-ink-800">Check your email</h3>
          <p className="mt-2 text-sm text-ink-500">We've sent a password reset link to your email address.</p>
          <Link to="/reset-password"><Button className="mt-6 w-full">Open reset page (demo)</Button></Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email" icon={<Mail className="h-4 w-4" />}>
            <Input type="email" required placeholder="you@cuet.ac.bd" className="pl-10" />
          </Field>
          <Button type="submit" className="w-full" size="lg">Send reset link</Button>
        </form>
      )}
      <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
        <ArrowLeft className="h-4 w-4" />Back to sign in
      </Link>
    </AuthLayout>
  );
}
