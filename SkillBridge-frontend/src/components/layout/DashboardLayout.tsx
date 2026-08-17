import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, Search, LayoutDashboard, User, Briefcase, Bookmark, FileText, Sparkles, Bell, Settings, Building2, Users, ShieldCheck, ChartBar as FileBarChart, ChartBar as BarChart3, MessageSquare, Award, FolderGit2, FileUp, LogOut } from 'lucide-react';
import { NotificationDropdown, UserAvatarMenu } from './NotificationDropdown';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const studentNav: NavItem[] = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/opportunities', label: 'Browse Opportunities', icon: Briefcase },
  { to: '/student/recommendations', label: 'AI Recommendations', icon: Award },
  { to: '/student/applied', label: 'Applied', icon: FileText },
  { to: '/student/saved', label: 'Saved', icon: Bookmark },
  { to: '/student/messages', label: 'Messages', icon: MessageSquare },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/profile', label: 'Profile', icon: User },
  { to: '/student/portfolio', label: 'Portfolio', icon: FolderGit2 },
  { to: '/student/resume', label: 'Resume', icon: FileUp },
  { to: '/student/settings', label: 'Settings', icon: Settings },
];

const companyNav: NavItem[] = [
  { to: '/company', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/company/profile', label: 'Company Profile', icon: Building2 },
  { to: '/company/opportunities/new', label: 'Post Opportunity', icon: Briefcase },
  { to: '/company/opportunities', label: 'Manage Opportunities', icon: FileText },
  { to: '/company/applicants', label: 'Applicants', icon: Users },
  { to: '/company/messages', label: 'Messages', icon: MessageSquare },
  { to: '/company/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/company/settings', label: 'Settings', icon: Settings },
];

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/verifications', label: 'Verifications', icon: ShieldCheck },
  { to: '/admin/companies', label: 'Companies', icon: Building2 },
];

const navByRole: Record<string, NavItem[]> = {
  student: studentNav,
  company: companyNav,
  admin: adminNav,
};

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const role = user?.role ?? 'student';
  const name = user?.name ?? 'User';
  const avatar = user?.avatar ?? 'U';
  const nav = navByRole[role] ?? studentNav;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const current = nav.find((n) => n.to === location.pathname) ?? nav.find((n) => location.pathname.startsWith(n.to) && n.to !== `/${role}`);
  const pageTitle = current?.label ?? 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-ink-200 bg-white lg:flex lg:flex-col">
        <SidebarContent nav={nav} role={role} onNavigate={() => setSidebarOpen(false)} onLogout={handleLogout} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white animate-fade-in">
            <SidebarContent nav={nav} role={role} onNavigate={() => setSidebarOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/80 px-4 backdrop-blur-lg sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-ink-600 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-ink-800">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button className="hidden h-10 w-10 items-center justify-center rounded-xl text-ink-500 transition hover:bg-ink-100 sm:flex">
              <Search className="h-5 w-5" />
            </button>
            <NotificationDropdown role={role} />
            <UserAvatarMenu name={name} avatar={avatar} role={role} onLogout={handleLogout} />
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ nav, role, onNavigate, onLogout }: { nav: NavItem[]; role: string; onNavigate: () => void; onLogout: () => void }) {
  return (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-ink-100 px-5">
        <Link to={`/${role}`} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="font-display text-base font-bold text-ink-800">SkillBridge</span>
            <span className="ml-1 text-sm font-semibold text-brand-600">CUET</span>
          </div>
        </Link>
        <button onClick={onNavigate} className="ml-auto rounded-lg p-1.5 text-ink-400 lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{role} panel</p>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === `/${role}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-800',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ink-100 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-ink-50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-700">AI Powered</p>
            <p className="text-[11px] text-ink-400">Smart matching active</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger-600 transition hover:bg-danger-50">
          <LogOut className="h-[18px] w-[18px]" />Logout
        </button>
      </div>
    </>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl">{children}</div>;
}
