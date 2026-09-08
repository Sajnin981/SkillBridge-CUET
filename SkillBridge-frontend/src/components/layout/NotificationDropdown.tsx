import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, MessageSquare, Briefcase, Info, LogOut, Heart } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { notificationService } from '@/services/notificationService';
import { timeAgo } from '@/lib/utils';
import type { Notification, Role } from '@/lib/types';

const icons = {
  application: CheckCircle2,
  opportunity: Briefcase,
  message: MessageSquare,
  post: Heart,
  system: Info,
};

const tones = {
  application: 'bg-success-50 text-success-600',
  opportunity: 'bg-brand-50 text-brand-600',
  message: 'bg-accent-50 text-accent-600',
  post: 'bg-danger-50 text-danger-600',
  system: 'bg-ink-100 text-ink-500',
};

interface NotificationDropdownProps {
  role: Role;
}

export function NotificationDropdown({ role }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    notificationService.getAll(role).then(setItems);
  }, [role]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationService.markAllRead();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition hover:bg-ink-100">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-card ring-1 ring-ink-200 animate-scale-in sm:w-96">
          <div className="flex items-center justify-between border-b border-ink-100 p-4">
            <div>
              <h3 className="text-sm font-semibold text-ink-800">Notifications</h3>
              <p className="text-xs text-ink-400">{unread} unread</p>
            </div>
            <button onClick={markAllRead} className="text-xs font-medium text-brand-600 hover:text-brand-700">Mark all read</button>
          </div>
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-400">No notifications yet</div>
            ) : (
              items.map((n) => {
                const Icon = icons[n.type];
                return (
                  <Link to={n.link || `/${role}/notifications`} key={n.id} onClick={() => { if (!n.read) notificationService.markRead(n.id); setOpen(false); }} className={`flex gap-3 border-b border-ink-50 p-4 transition hover:bg-ink-50 ${!n.read ? 'bg-brand-50/40' : ''}`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[n.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-800">{n.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500">{n.message}</p>
                      <p className="mt-1 text-[11px] text-ink-400">{timeAgo(n.time)}</p>
                    </div>
                    {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </Link>
                );
              })
            )}
          </div>
          <Link to={`/${role}/notifications`} onClick={() => setOpen(false)} className="block border-t border-ink-100 p-3 text-center text-sm font-medium text-brand-600 hover:bg-ink-50">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

interface UserMenuProps {
  name: string;
  avatar: string;
  role: Role;
  onLogout: () => void;
}

export function UserAvatarMenu({ name, avatar, role, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const base = `/${role}`;
  const links = [
    { label: 'My Profile', to: role === 'admin' ? '/admin' : `${base}/profile` },
    { label: 'Settings', to: `${base}/settings` },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-ink-100">
        <Avatar name={name} src={avatar} size="sm" />
        <span className="hidden text-sm font-medium text-ink-700 sm:block">{name.split(' ')[0]}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-card ring-1 ring-ink-200 animate-scale-in">
          <div className="border-b border-ink-100 p-4">
            <p className="text-sm font-semibold text-ink-800">{name}</p>
            <p className="text-xs capitalize text-ink-400">{role} account</p>
          </div>
          <div className="p-1.5">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-600 transition hover:bg-ink-50">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-ink-100 p-1.5">
            <button onClick={() => { setOpen(false); onLogout(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger-600 transition hover:bg-danger-50">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
