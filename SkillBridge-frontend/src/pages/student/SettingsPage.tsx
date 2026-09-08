import { useEffect, useState } from 'react';
import { User, Lock } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { studentService } from '@/services/studentService';
import { authService } from '@/services/authService';
import type { StudentProfile } from '@/lib/types';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [active, setActive] = useState('profile');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileDraft, setProfileDraft] = useState({ phone: '', bio: '' });
  const [passwordDraft, setPasswordDraft] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getProfile()
      .then((savedProfile) => {
        setProfile(savedProfile);
        setProfileDraft({ phone: savedProfile?.phone || '', bio: savedProfile?.bio || '' });
      })
      .catch(() => toast({ title: 'Could not load settings', variant: 'error' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const saveProfile = async () => {
    try {
      const updated = await studentService.updateProfile({ bio: profileDraft.bio });
      setProfile(updated);
      toast({ title: 'Profile settings saved', variant: 'success' });
    } catch {
      toast({ title: 'Could not save profile settings', variant: 'error' });
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

  return (
    <PageContainer>
      <h2 className="mb-6 font-display text-2xl font-bold text-ink-800">Settings</h2>
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-2">
            {sections.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active === s.id ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'}`}>
                <s.icon className="h-[18px] w-[18px]" />{s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {active === 'profile' && (
            <Card>
              <CardHeader title="Profile Settings" subtitle="Manage your personal information" />
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name"><Input value={profile?.name || ''} disabled /></Field>
                  <Field label="Email"><Input value={profile?.email || ''} disabled /></Field>
                  <Field label="Phone"><Input value={profileDraft.phone} disabled /></Field>
                  <Field label="Department"><Input value={profile?.department || ''} disabled /></Field>
                </div>
                <Field label="Bio"><Textarea value={profileDraft.bio} onChange={(event) => setProfileDraft({ ...profileDraft, bio: event.target.value })} /></Field>
                <Button onClick={saveProfile} disabled={loading}>Save changes</Button>
              </div>
            </Card>
          )}

          {active === 'security' && (
            <Card>
              <CardHeader title="Security" subtitle="Manage your password and account security" />
              <div className="space-y-4">
                <Field label="Current Password"><Input type="password" value={passwordDraft.current} onChange={(event) => setPasswordDraft({ ...passwordDraft, current: event.target.value })} /></Field>
                <Field label="New Password"><Input type="password" value={passwordDraft.next} onChange={(event) => setPasswordDraft({ ...passwordDraft, next: event.target.value })} /></Field>
                <Field label="Confirm New Password"><Input type="password" value={passwordDraft.confirm} onChange={(event) => setPasswordDraft({ ...passwordDraft, confirm: event.target.value })} /></Field>
                <Button onClick={changePassword}>Update password</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
