import { useState } from 'react';
import { Lock } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { authService } from '@/services/authService';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [passwordDraft, setPasswordDraft] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const changePassword = async () => {
    if (passwordDraft.next !== passwordDraft.confirm) {
      toast({ title: 'New passwords do not match', variant: 'error' });
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(passwordDraft.current, passwordDraft.next);
      setPasswordDraft({ current: '', next: '', confirm: '' });
      toast({ title: 'Password updated', variant: 'success' });
    } catch {
      toast({ title: 'Could not update password', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <h2 className="mb-6 font-display text-2xl font-bold text-ink-800">Admin Settings</h2>
      <Card>
        <CardHeader title="Security" subtitle="Update your admin password." />
        <div className="space-y-4">
          <Field label="Current Password"><Input type="password" value={passwordDraft.current} onChange={(event) => setPasswordDraft({ ...passwordDraft, current: event.target.value })} /></Field>
          <Field label="New Password"><Input type="password" value={passwordDraft.next} onChange={(event) => setPasswordDraft({ ...passwordDraft, next: event.target.value })} /></Field>
          <Field label="Confirm New Password"><Input type="password" value={passwordDraft.confirm} onChange={(event) => setPasswordDraft({ ...passwordDraft, confirm: event.target.value })} /></Field>
          <Button onClick={changePassword} disabled={saving}><Lock className="h-4 w-4" />{saving ? 'Updating…' : 'Update password'}</Button>
        </div>
      </Card>
    </PageContainer>
  );
}