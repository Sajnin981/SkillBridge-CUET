import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { normalizeError } from '@/api/axios';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim(), password, 'admin');
      toast({ title: `Welcome, ${user.name.split(' ')[0]}`, variant: 'success' });
      navigate('/admin');
    } catch (err) {
      const apiErr = normalizeError(err);
      toast({ title: 'Admin sign in failed', description: apiErr.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout side="company" title="Admin sign in" subtitle="Sign in with your administrator account.">
      <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-ink-100 p-3 text-sm font-medium text-ink-700">
        <ShieldCheck className="h-4 w-4 text-brand-600" />Admin portal
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" icon={<Mail className="h-4 w-4" />}>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@skillbridge.com" className="pl-10" />
        </Field>
        <Field label="Password" icon={<Lock className="h-4 w-4" />}>
          <Input type={showPwd ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10" />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={loading}>Sign in as Admin</Button>
      </form>
    </AuthLayout>
  );
}
