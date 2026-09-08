import { useEffect, useState } from 'react';
import { User, Bell, Lock, Mail, Smartphone } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { studentService, type StudentSettings } from '@/services/studentService';
import { authService } from '@/services/authService';
import type { StudentProfile } from '@/lib/types';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [active, setActive] = useState('profile');
  const [settings, setSettings] = useState<StudentSettings | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileDraft, setProfileDraft] = useState({ phone: '', bio: '' });
  const [passwordDraft, setPasswordDraft] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([studentService.getSettings(), studentService.getProfile()])
      .then(([savedSettings, savedProfile]) => {
        setSettings(savedSettings);
        setProfile(savedProfile);
        setProfileDraft({ phone: savedProfile?.phone || '', bio: savedProfile?.bio || '' });
      })
      .catch(() => toast({ title: 'Could not load settings', variant: 'error' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const save = () => {
    if (!settings) return;
    studentService.updateSettings(settings).then(setSettings).then(() => toast({ title: 'Settings saved', variant: 'success' })).catch(() => toast({ title: 'Could not save settings', variant: 'error' }));
  };

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

          {active === 'notifications' && (
            <Card>
              <CardHeader title="Notification Preferences" subtitle="Choose what you want to be notified about" />
              <div className="space-y-3">
                {([
                  { key: 'email', label: 'Email notifications', desc: 'Receive notifications via email', icon: Mail },
                  { key: 'push', label: 'Push notifications', desc: 'Browser push notifications', icon: Bell },
                  { key: 'applications', label: 'Application updates', desc: 'Status changes on your applications', icon: User },
                  { key: 'recommendations', label: 'AI recommendations', desc: 'New matching opportunities', icon: Bell },
                  { key: 'messages', label: 'Message alerts', desc: 'New messages from companies', icon: Smartphone },
                ] as const).map((p) => (
                  <div key={p.key} className="flex items-center justify-between rounded-xl border border-ink-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-500"><p.icon className="h-4 w-4" /></div>
                      <div>
                        <p className="text-sm font-medium text-ink-700">{p.label}</p>
                        <p className="text-xs text-ink-400">{p.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => settings && setSettings({ ...settings, notifications: { ...settings.notifications, [p.key]: !settings.notifications[p.key] } })}
                      className={`relative h-6 w-11 rounded-full transition ${settings?.notifications[p.key] ? 'bg-brand-600' : 'bg-ink-200'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${settings?.notifications[p.key] ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
                <Button onClick={save} className="mt-2">Save preferences</Button>
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
