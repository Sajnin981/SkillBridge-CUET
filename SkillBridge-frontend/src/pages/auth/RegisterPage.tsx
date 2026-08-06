import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, Building2, Check } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

const studentSteps = ['Account', 'Profile', 'Done'];
const companySteps = ['Account', 'Company', 'Done'];

export default function RegisterPage() {
  const [role, setRole] = useState<'student' | 'company'>('student');
  const [step, setStep] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  const steps = role === 'student' ? studentSteps : companySteps;

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < steps.length - 1) { setStep(step + 1); return; }
    setLoading(true);
    try {
      const user = await register('user@example.com', role === 'student' ? 'New Student' : 'New Company', role);
      toast({ title: 'Account created!', description: role === 'company' ? 'Pending admin verification.' : `Welcome, ${user.name.split(' ')[0]}.`, variant: 'success' });
      navigate(role === 'student' ? '/student' : '/verification-pending');
    } catch {
      toast({ title: 'Registration failed', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout side={role} title="Create your account" subtitle="Join SkillBridge CUET as a verified student or company.">
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-ink-100 p-1">
        {(['student', 'company'] as const).map((r) => (
          <button key={r} onClick={() => { setRole(r); setStep(0); }} className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium capitalize transition ${role === r ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'}`}>
            {r === 'student' ? <GraduationCap className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}{r}
          </button>
        ))}
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${i <= step ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400'}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`ml-2 text-xs font-medium ${i <= step ? 'text-ink-700' : 'text-ink-400'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`mx-2 h-px flex-1 ${i < step ? 'bg-brand-600' : 'bg-ink-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={next} className="space-y-4">
        {step === 0 && (
          <>
            <Field label="Full Name" icon={<User className="h-4 w-4" />}>
              <Input required placeholder="Your name" className="pl-10" />
            </Field>
            <Field label="Email" icon={<Mail className="h-4 w-4" />}>
              <Input type="email" required placeholder={role === 'student' ? 'you@cuet.ac.bd' : 'company@email.com'} className="pl-10" />
            </Field>
            <Field label="Password" icon={<Lock className="h-4 w-4" />}>
              <Input type={showPwd ? 'text' : 'password'} required placeholder="Min. 8 characters" className="pl-10 pr-10" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>
            <label className="flex items-start gap-2 text-sm text-ink-600">
              <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
              I agree to the <a href="#" className="font-medium text-brand-600">Terms</a> and <a href="#" className="font-medium text-brand-600">Privacy Policy</a>
            </label>
          </>
        )}
        {step === 1 && role === 'student' && (
          <>
            <Field label="Department">
              <Select required defaultValue=""><option value="" disabled>Select department</option><option>Computer Science & Engineering</option><option>Electrical & Electronic Engineering</option><option>Mechanical Engineering</option><option>Civil Engineering</option><option>Electronics & Telecommunication</option></Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Batch"><Input required placeholder="2022" /></Field>
              <Field label="CGPA"><Input required placeholder="3.78" /></Field>
            </div>
            <Field label="Phone"><Input placeholder="+880 1700-000000" /></Field>
          </>
        )}
        {step === 1 && role === 'company' && (
          <>
            <Field label="Company Name"><Input required placeholder="Acme Corp" /></Field>
            <Field label="Industry">
              <Select required defaultValue=""><option value="" disabled>Select industry</option><option>Software</option><option>Finance</option><option>HealthTech</option><option>Logistics</option><option>Manufacturing</option><option>Other</option></Select>
            </Field>
            <Field label="Website"><Input required placeholder="acme.com" /></Field>
            <Field label="Company Size">
              <Select required defaultValue=""><option value="" disabled>Select size</option><option>1-50</option><option>50-200</option><option>200-500</option><option>500-1000</option><option>1000+</option></Select>
            </Field>
          </>
        )}
        {step === 2 && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-600">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink-800">{role === 'student' ? 'You\'re all set!' : 'Application submitted!'}</h3>
            <p className="mt-2 text-sm text-ink-500">{role === 'student' ? 'Your SkillBridge account is ready to use.' : 'Our admin team will review and verify your company shortly.'}</p>
          </div>
        )}
        <div className="flex gap-3">
          {step > 0 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button type="submit" className="flex-1" size="lg" loading={loading}>{step === steps.length - 1 ? 'Finish' : 'Continue'}</Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
