import { useEffect, useState } from 'react';
import { Building2, Lock } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { companyService } from '@/services/companyService';
import { authService } from '@/services/authService';
import type { BackendCompany } from '@/api/types';

const sections = [
  { id: 'company', label: 'Company Info', icon: Building2 },
  { id: 'security', label: 'Security', icon: Lock },
];

export default function CompanySettingsPage() {
  const { toast } = useToast();
  const [active, setActive] = useState('company');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BackendCompany | null>(null);
  const [profileDraft, setProfileDraft] = useState({ industry: '', website: '', address: '', size: '', founded: '', description: '' });
  const [passwordDraft, setPasswordDraft] = useState({ current: '', next: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    companyService.getRawProfile()
      .then((rawProfile) => {
        setProfile(rawProfile);
        if (rawProfile) {
          setProfileDraft({
            industry: rawProfile.industry || '',
            website: rawProfile.website || '',
            address: rawProfile.address || '',
            size: rawProfile.size || '',
            founded: rawProfile.founded || '',
            description: rawProfile.description || '',
          });
        }
      })
      .catch(() => toast({ title: 'Could not load company settings', variant: 'error' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await companyService.updateProfile(profileDraft);
      setProfile((current) => (current ? { ...current, ...profileDraft } : current));
      toast({ title: 'Company information saved', variant: 'success' });
    } catch {
      toast({ title: 'Could not save company information', variant: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (passwordDraft.next !== passwordDraft.confirm) {
      toast({ title: 'New passwords do not match', variant: 'error' });
      return;
    }
    try {
      await authService.changePassword(passwordDraft.current, passwordDraft.next);
      setPasswordDraft({ current: '', next: '', confirm: '' });
      toast({ title: 'Password updated', variant: 'success' });
    } catch {
      toast({ title: 'Could not update password', variant: 'error' });
    }
  };

  if (loading) return <PageContainer><SkeletonCard /></PageContainer>;

  return (
    <PageContainer>
      <h2 className="mb-6 font-display text-2xl font-bold text-ink-800">Settings</h2>
      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <div className="card p-2">
            {sections.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active === s.id ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'}`}>
                <s.icon className="h-[18px] w-[18px]" />{s.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:col-span-3">
          {active === 'company' && (
            <Card>
              <CardHeader title="Company Information" subtitle="Update your company details" />
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Company Name"><Input value={profile?.companyName || ''} disabled /></Field>
                  <Field label="Industry"><Input value={profileDraft.industry} onChange={(e) => setProfileDraft({ ...profileDraft, industry: e.target.value })} /></Field>
                  <Field label="Website"><Input value={profileDraft.website} onChange={(e) => setProfileDraft({ ...profileDraft, website: e.target.value })} placeholder="company.com" /></Field>
                  <Field label="Location"><Input value={profileDraft.address} onChange={(e) => setProfileDraft({ ...profileDraft, address: e.target.value })} /></Field>
                  <Field label="Company Size"><Select value={profileDraft.size} onChange={(e) => setProfileDraft({ ...profileDraft, size: e.target.value })}><option value="">Not specified</option><option>1-50</option><option>50-200</option><option>200-500</option><option>500-1000</option><option>1000+</option></Select></Field>
                  <Field label="Founded"><Input value={profileDraft.founded} onChange={(e) => setProfileDraft({ ...profileDraft, founded: e.target.value })} placeholder="e.g. 2006" /></Field>
                </div>
                <Field label="About"><Textarea value={profileDraft.description} onChange={(e) => setProfileDraft({ ...profileDraft, description: e.target.value })} /></Field>
                <Button onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save changes'}</Button>
              </div>
            </Card>
          )}

          {active === 'security' && (
            <Card>
              <CardHeader title="Security" />
              <div className="space-y-4">
                <Field label="Current Password"><Input type="password" value={passwordDraft.current} onChange={(e) => setPasswordDraft({ ...passwordDraft, current: e.target.value })} /></Field>
                <Field label="New Password"><Input type="password" value={passwordDraft.next} onChange={(e) => setPasswordDraft({ ...passwordDraft, next: e.target.value })} /></Field>
                <Field label="Confirm Password"><Input type="password" value={passwordDraft.confirm} onChange={(e) => setPasswordDraft({ ...passwordDraft, confirm: e.target.value })} /></Field>
                <Button onClick={changePassword}>Update password</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
