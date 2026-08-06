import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/types';

const roleConfig: { role: Role; icon: typeof GraduationCap; label: string; placeholder: string }[] = [
  { role: 'student', icon: GraduationCap, label: 'Student', placeholder: 'you@cuet.ac.bd' },
  { role: 'company', icon: Building2, label: 'Company', placeholder: 'company@email.com' },
  { role: 'admin', icon: ShieldCheck, label: 'Admin', placeholder: 'admin@skillbridge.edu' },
];

export default function LoginPage() {
  const [role, setRole] = useState<Role>('student');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login('user@example.com', 'password', role);
      toast({ title: `Welcome back, ${user.name.split(' ')[0]}!`, variant: 'success' });
      navigate(`/${role}`);
    } catch {
      toast({ title: 'Sign in failed', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout side={role === 'admin' ? 'company' : role} title="Welcome back" subtitle="Sign in to your SkillBridge account to continue.">
      <div className="mb-6 grid grid-cols-3 gap-2 rounded-xl bg-ink-100 p-1">
        {roleConfig.map(({ role: r, icon: Icon, label }) => (
          <button key={r} onClick={() => setRole(r)} className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition ${role === r ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" icon={<Mail className="h-4 w-4" />}>
          <Input type="email" required placeholder={roleConfig.find((r) => r.role === role)!.placeholder} className="pl-10" />
        </Field>
        <Field label="Password" icon={<Lock className="h-4 w-4" />}>
          <Input type={showPwd ? 'text' : 'password'} required placeholder="••••••••" className="pl-10 pr-10" />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </Field>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>Sign in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Don't have an account? <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
