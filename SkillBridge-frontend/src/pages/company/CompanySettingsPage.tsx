import { useState } from 'react';
import { Building2, Bell, Lock, Users, Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

const sections = [
  { id: 'company', label: 'Company Info', icon: Building2 },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
];

const team = [
  { name: 'Imran Kabir', email: 'imran@brainstation23.com', role: 'Admin', avatar: 'IK' },
  { name: 'Sarah Lee', email: 'sarah@brainstation23.com', role: 'Recruiter', avatar: 'SL' },
  { name: 'David Chen', email: 'david@brainstation23.com', role: 'Recruiter', avatar: 'DC' },
];

export default function CompanySettingsPage() {
  const { toast } = useToast();
  const [active, setActive] = useState('company');
  const [prefs, setPrefs] = useState({ newApplicants: true, dailyDigest: true, messages: true, weeklyReport: false });

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
          {active === 'company' && (
            <Card>
              <CardHeader title="Company Information" subtitle="Update your company details" />
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Company Name"><Input defaultValue="Brain Station 23" /></Field>
                  <Field label="Industry"><Select defaultValue="Software"><option>Software</option><option>Finance</option><option>HealthTech</option></Select></Field>
                  <Field label="Website"><Input defaultValue="brainstation-23.com" /></Field>
                  <Field label="Location"><Input defaultValue="Dhaka, BD" /></Field>
                  <Field label="Company Size"><Select defaultValue="500-1000"><option>1-50</option><option>50-200</option><option>200-500</option><option>500-1000</option><option>1000+</option></Select></Field>
                  <Field label="Founded"><Input defaultValue="2006" /></Field>
                </div>
                <Button onClick={save}>Save changes</Button>
              </div>
            </Card>
          )}

          {active === 'team' && (
            <Card>
              <CardHeader title="Team Members" subtitle="Manage who has access to this company account" action={<Button size="sm"><Users className="h-3.5 w-3.5" />Invite</Button>} />
              <div className="space-y-3">
                {team.map((m) => (
                  <div key={m.email} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">{m.avatar}</div>
                    <div className="flex-1"><p className="text-sm font-semibold text-ink-800">{m.name}</p><p className="text-xs text-ink-400">{m.email}</p></div>
                    <Select defaultValue={m.role} className="w-32"><option>Admin</option><option>Recruiter</option><option>Viewer</option></Select>
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-danger-500" /></Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {active === 'notifications' && (
            <Card>
              <CardHeader title="Notification Preferences" />
              <div className="space-y-3">
                {([
                  { key: 'newApplicants', label: 'New applicant alerts', desc: 'Get notified when someone applies' },
                  { key: 'dailyDigest', label: 'Daily digest', desc: 'Summary of activity each day' },
                  { key: 'messages', label: 'Message notifications', desc: 'New messages from candidates' },
                  { key: 'weeklyReport', label: 'Weekly report', desc: 'Hiring metrics summary' },
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

          {active === 'security' && (
            <Card>
              <CardHeader title="Security" />
              <div className="space-y-4">
                <Field label="Current Password"><Input type="password" placeholder="••••••••" /></Field>
                <Field label="New Password"><Input type="password" placeholder="••••••••" /></Field>
                <Field label="Confirm Password"><Input type="password" placeholder="••••••••" /></Field>
                <Button onClick={save}>Update password</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
