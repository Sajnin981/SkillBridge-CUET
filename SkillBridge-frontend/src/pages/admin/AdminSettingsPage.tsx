import { useState } from 'react';
import { Lock, Bell, Shield } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

const sections = [
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [active, setActive] = useState('security');
  const [prefs, setPrefs] = useState({ newVerifications: true, reports: true, dailyDigest: false });

  const save = () => toast({ title: 'Settings saved', variant: 'success' });

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
          {active === 'security' && (
            <Card>
              <CardHeader title="Security" subtitle="Manage your admin password" />
              <div className="space-y-4">
                <Field label="Current Password"><Input type="password" placeholder="••••••••" /></Field>
                <Field label="New Password"><Input type="password" placeholder="••••••••" /></Field>
                <Field label="Confirm Password"><Input type="password" placeholder="••••••••" /></Field>
                <Button onClick={save}>Update password</Button>
              </div>
            </Card>
          )}
          {active === 'notifications' && (
            <Card>
              <CardHeader title="Notification Preferences" />
              <div className="space-y-3">
                {([
                  { key: 'newVerifications', label: 'New verification requests', desc: 'Companies awaiting approval' },
                  { key: 'reports', label: 'User reports', desc: 'Content moderation alerts' },
                  { key: 'dailyDigest', label: 'Daily digest', desc: 'Platform activity summary' },
                ] as const).map((p) => (
                  <div key={p.key} className="flex items-center justify-between rounded-xl border border-ink-100 p-4">
                    <div><p className="text-sm font-medium text-ink-700">{p.label}</p><p className="text-xs text-ink-400">{p.desc}</p></div>
                    <button onClick={() => setPrefs({ ...prefs, [p.key]: !prefs[p.key] })} className={`relative h-6 w-11 rounded-full transition ${prefs[p.key] ? 'bg-brand-600' : 'bg-ink-200'}`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${prefs[p.key] ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
                <Button onClick={save}>Save preferences</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
