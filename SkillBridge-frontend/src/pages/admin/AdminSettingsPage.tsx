import { useEffect, useState } from 'react';
import { Bell, ShieldCheck, Server } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { adminService, type AdminSettings } from '@/services/adminService';

const fields = [
  { key: 'emailNotifications', label: 'Email notifications', description: 'Receive platform activity by email.', icon: Bell },
  { key: 'verificationAlerts', label: 'Verification alerts', description: 'Notify me about pending account reviews.', icon: ShieldCheck },
  { key: 'systemAlerts', label: 'System alerts', description: 'Receive important service status alerts.', icon: Server },
] as const;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { adminService.getSettings().then(setSettings).catch(() => toast({ title: 'Could not load settings', variant: 'error' })); }, [toast]);
  const save = () => { if (!settings) return; setSaving(true); adminService.updateSettings(settings).then(setSettings).then(() => toast({ title: 'Settings saved', variant: 'success' })).catch(() => toast({ title: 'Could not save settings', variant: 'error' })).finally(() => setSaving(false)); };
  if (!settings) return <PageContainer><SkeletonCard /></PageContainer>;
  return <PageContainer><h2 className="mb-6 font-display text-2xl font-bold text-ink-800">Admin Settings</h2><Card><CardHeader title="Notification preferences" subtitle="These settings are stored on your admin account." /><div className="space-y-3">{fields.map(({ key, label, description, icon: Icon }) => <div key={key} className="flex items-center justify-between rounded-xl border border-ink-100 p-4"><div className="flex items-center gap-3"><Icon className="h-5 w-5 text-brand-600" /><div><p className="text-sm font-medium text-ink-700">{label}</p><p className="text-xs text-ink-400">{description}</p></div></div><button type="button" onClick={() => setSettings({ ...settings, [key]: !settings[key] })} className={`relative h-6 w-11 rounded-full ${settings[key] ? 'bg-brand-600' : 'bg-ink-200'}`} aria-label={label}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${settings[key] ? 'left-[22px]' : 'left-0.5'}`} /></button></div>)}<Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</Button></div></Card></PageContainer>;
}