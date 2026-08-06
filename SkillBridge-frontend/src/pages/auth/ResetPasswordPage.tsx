import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function ResetPasswordPage() {
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Password reset', description: 'You can now sign in with your new password.', variant: 'success' });
    navigate('/login');
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Enter your new password below.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="New password" icon={<Lock className="h-4 w-4" />}>
          <Input type={showPwd ? 'text' : 'password'} required placeholder="Min. 8 characters" className="pl-10 pr-10" />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </Field>
        <Field label="Confirm password" icon={<Lock className="h-4 w-4" />}>
          <Input type="password" required placeholder="Re-enter password" className="pl-10" />
        </Field>
        <div className="rounded-xl bg-ink-50 p-3 text-xs text-ink-500">
          <p className="font-medium text-ink-600">Password must contain:</p>
          <ul className="mt-1.5 space-y-1">
            <li>• At least 8 characters</li>
            <li>• One uppercase and one lowercase letter</li>
            <li>• One number or special character</li>
          </ul>
        </div>
        <Button type="submit" className="w-full" size="lg">Reset password</Button>
      </form>
      <Link to="/login" className="mt-6 block text-center text-sm text-ink-500 hover:text-ink-700">Back to sign in</Link>
    </AuthLayout>
  );
}
