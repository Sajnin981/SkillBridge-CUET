import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, Building2, Check, Upload, Phone, MapPin, Globe } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { authService } from '@/services/authService';
import { normalizeError } from '@/api/axios';

const studentSteps = ['Account', 'Details', 'ID & Resume'];
const companySteps = ['Account', 'Details', 'Verification'];

export default function RegisterPage() {
  const [role, setRole] = useState<'student' | 'company'>('student');
  const [step, setStep] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Student Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [batch, setBatch] = useState('2022');
  const [phone, setPhone] = useState('');
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Company Form State
  const [companyName, setCompanyName] = useState('');
  const [hrName, setHrName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Software');
  const [address, setAddress] = useState('');
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const steps = role === 'student' ? studentSteps : companySteps;

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }

    // Final step: submit registration
    if (role === 'student' && !idCardFile) {
      toast({ title: 'Student ID Card Required', description: 'Please upload a photo or scan of your CUET ID card.', variant: 'error' });
      return;
    }
    if (role === 'company' && !tradeLicenseFile) {
      toast({ title: 'Trade License Required', description: 'Please upload your company trade license document.', variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (role === 'student') {
        const user = await authService.registerStudent({
          fullName: fullName.trim(),
          email: email.trim(),
          studentId: studentId.trim() || '1804001',
          department,
          batch,
          phone: phone.trim() || '+8801700000000',
          password,
          idCard: idCardFile!,
          resume: resumeFile || undefined,
        });
        toast({ title: 'Account created!', description: `Welcome, ${user.name.split(' ')[0]}. Verification is pending.`, variant: 'success' });
        navigate('/student');
      } else {
        await authService.registerCompany({
          companyName: companyName.trim(),
          hrName: hrName.trim() || fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || '+8801700000000',
          website: website.trim(),
          industry,
          address: address.trim() || 'Dhaka, Bangladesh',
          password,
          tradeLicense: tradeLicenseFile!,
          logo: logoFile || undefined,
        });
        toast({ title: 'Application submitted!', description: 'Your company registration is pending admin approval.', variant: 'success' });
        navigate('/verification-pending');
      }
    } catch (err) {
      const apiErr = normalizeError(err);
      toast({ title: 'Registration failed', description: apiErr.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout side={role} title="Create your account" subtitle="Join SkillBridge CUET as a verified student or company.">
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-ink-100 p-1">
        {(['student', 'company'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => { setRole(r); setStep(0); }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium capitalize transition ${role === r ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'}`}
          >
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

      <form onSubmit={handleNext} className="space-y-4">
        {step === 0 && (
          <>
            <Field label={role === 'student' ? 'Full Name' : 'Contact Person / HR Name'} icon={<User className="h-4 w-4" />}>
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Rahim Ahmed" className="pl-10" />
            </Field>
            <Field label="Email" icon={<Mail className="h-4 w-4" />}>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'student' ? 'you@cuet.ac.bd' : 'hr@company.com'}
                className="pl-10"
              />
            </Field>
            <Field label="Password" icon={<Lock className="h-4 w-4" />}>
              <Input
                type={showPwd ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="pl-10 pr-10"
              />
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
            <Field label="Student ID (7 digits)">
              <Input required value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. 1804001" />
            </Field>
            <Field label="Department">
              <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option>Computer Science & Engineering</option>
                <option>Electrical & Electronic Engineering</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
                <option>Electronics & Telecommunication</option>
                <option>Biomedical Engineering</option>
                <option>Mechatronics Engineering</option>
                <option>Materials Science & Engineering</option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Batch">
                <Input required value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="2022" />
              </Field>
              <Field label="Phone">
                <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1700-000000" />
              </Field>
            </div>
          </>
        )}

        {step === 1 && role === 'company' && (
          <>
            <Field label="Company Name" icon={<Building2 className="h-4 w-4" />}>
              <Input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Brain Station 23" className="pl-10" />
            </Field>
            <Field label="Industry">
              <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option>Software</option>
                <option>Finance</option>
                <option>HealthTech</option>
                <option>Logistics</option>
                <option>Telecommunications</option>
                <option>Manufacturing</option>
                <option>Other</option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Website" icon={<Globe className="h-4 w-4" />}>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="pl-10" />
              </Field>
              <Field label="Phone" icon={<Phone className="h-4 w-4" />}>
                <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1700-000000" className="pl-10" />
              </Field>
            </div>
            <Field label="Headquarters / Address" icon={<MapPin className="h-4 w-4" />}>
              <Input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Gulshan-1, Dhaka" className="pl-10" />
            </Field>
          </>
        )}

        {step === 2 && role === 'student' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700">CUET Student ID Card (Required)</label>
              <p className="text-xs text-ink-500 mb-2">Upload a scan/photo of your CUET ID (JPG, PNG, or PDF, max 5MB)</p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                required
                onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-ink-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700">Resume / CV (Optional)</label>
              <p className="text-xs text-ink-500 mb-2">Upload your current resume for instant AI analysis and employer matching</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-ink-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>
          </div>
        )}

        {step === 2 && role === 'company' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700">Trade License / Incorporation Document (Required)</label>
              <p className="text-xs text-ink-500 mb-2">Required for CUET admin company verification (PDF, JPG, PNG, max 5MB)</p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                onChange={(e) => setTradeLicenseFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-ink-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700">Company Logo (Optional)</label>
              <p className="text-xs text-ink-500 mb-2">Upload your company logo for opportunity postings</p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-ink-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button type="submit" className="flex-1" size="lg" loading={loading}>
            {step === steps.length - 1 ? 'Create Account' : 'Continue'}
          </Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
