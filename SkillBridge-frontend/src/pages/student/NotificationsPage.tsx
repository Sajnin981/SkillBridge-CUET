import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, MessageSquare, Briefcase, Info } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { timeAgo } from '@/lib/utils';
import type { Notification } from '@/lib/types';

const icons = { application: CheckCircle2, opportunity: Briefcase, message: MessageSquare, system: Info };
const tones = { application: 'bg-success-50 text-success-600', opportunity: 'bg-brand-50 text-brand-600', message: 'bg-accent-50 text-accent-600', system: 'bg-ink-100 text-ink-500' };

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) notificationService.getAll(user.role).then((n) => { setItems(n); setLoading(false); });
  }, [user]);

  const visible = filter === 'all' ? items : items.filter((n) => !n.read);
  const markAllRead = () => { notificationService.markAllRead(); setItems((prev) => prev.map((n) => ({ ...n, read: true }))); };
  const toggleRead = (id: string) => { notificationService.toggleRead(id); setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: !n.read } : n)); };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-800">Notifications</h2>
          <p className="mt-1 text-sm text-ink-500">Stay updated on applications, opportunities, and messages.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-ink-100 p-1">
            {(['all', 'unread'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${filter === f ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'}`}>{f}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="card p-4"><Skeleton className="h-4 w-3/4" /><Skeleton className="mt-2 h-3 w-1/2" /></div>)}</div>
      ) : visible.length === 0 ? (
        <div className="card"><EmptyState icon={<Bell className="h-7 w-7" />} title="No notifications" description="You're all caught up. New notifications will appear here." /></div>
      ) : (
        <div className="space-y-2">
          {visible.map((n) => {
            const Icon = icons[n.type];
            return (
              <Link to={n.link || `/${user?.role || 'student'}/notifications`} key={n.id} className={`card flex items-start gap-4 p-4 ${!n.read ? 'ring-1 ring-brand-200/60' : ''}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[n.type]}`}><Icon className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-800">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-500">{n.message}</p>
                  <p className="mt-1 text-xs text-ink-400">{timeAgo(n.time)}</p>
                </div>
                <button onClick={() => toggleRead(n.id)} className="text-xs font-medium text-brand-600 hover:text-brand-700">{n.read ? 'Mark unread' : 'Mark read'}</button>
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
