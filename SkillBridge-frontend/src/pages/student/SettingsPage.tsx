import { useState } from 'react';
import { User, Bell, Lock, Globe, Trash2, Mail, Smartphone } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'privacy', label: 'Privacy', icon: Globe },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [active, setActive] = useState('profile');
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, applications: true, recommendations: true, messages: false });

  const save = () => toast({ title: 'Settings saved', variant: 'success' });

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
                  <Field label="Full Name"><Input defaultValue="Rahim Ahmed" /></Field>
                  <Field label="Email"><Input defaultValue="rahim.ahmed@cuet.ac.bd" /></Field>
                  <Field label="Phone"><Input defaultValue="+880 1700-000000" /></Field>
                  <Field label="Location"><Input defaultValue="Chittagong, Bangladesh" /></Field>
                </div>
                <Field label="Bio"><Input defaultValue="Final-year CSE student at CUET passionate about building scalable web applications." /></Field>
                <Button onClick={save}>Save changes</Button>
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
                      onClick={() => setNotifPrefs({ ...notifPrefs, [p.key]: !notifPrefs[p.key] })}
                      className={`relative h-6 w-11 rounded-full transition ${notifPrefs[p.key] ? 'bg-brand-600' : 'bg-ink-200'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${notifPrefs[p.key] ? 'left-[22px]' : 'left-0.5'}`} />
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
                <Field label="Current Password"><Input type="password" placeholder="••••••••" /></Field>
                <Field label="New Password"><Input type="password" placeholder="••••••••" /></Field>
                <Field label="Confirm New Password"><Input type="password" placeholder="••••••••" /></Field>
                <Button onClick={save}>Update password</Button>
                <div className="mt-6 rounded-xl bg-danger-50 p-4">
                  <p className="text-sm font-semibold text-danger-700">Danger Zone</p>
                  <p className="mt-1 text-xs text-danger-600">Permanently delete your account and all data.</p>
                  <Button variant="danger" size="sm" className="mt-3"><Trash2 className="h-3.5 w-3.5" />Delete account</Button>
                </div>
              </div>
            </Card>
          )}

          {active === 'privacy' && (
            <Card>
              <CardHeader title="Privacy" subtitle="Control your profile visibility" />
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-ink-100 p-4">
                  <div><p className="text-sm font-medium text-ink-700">Public profile</p><p className="text-xs text-ink-400">Allow companies to view your profile</p></div>
                  <Select defaultValue="Public" className="w-32"><option>Public</option><option>Private</option></Select>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-ink-100 p-4">
                  <div><p className="text-sm font-medium text-ink-700">Show in search</p><p className="text-xs text-ink-400">Appear in candidate search results</p></div>
                  <Select defaultValue="Yes" className="w-32"><option>Yes</option><option>No</option></Select>
                </div>
                <Button onClick={save}>Save privacy settings</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
