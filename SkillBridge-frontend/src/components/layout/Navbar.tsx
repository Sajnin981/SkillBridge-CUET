import { Link, NavLink } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/companies', label: 'Companies' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/70 bg-white/80 backdrop-blur-lg">
      <nav className="container-app flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="font-display text-base font-bold text-ink-800">SkillBridge</span>
            <span className="ml-1 text-sm font-semibold text-brand-600">CUET</span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn('rounded-lg px-3.5 py-2 text-sm font-medium transition', isActive ? 'text-brand-700 bg-brand-50' : 'text-ink-600 hover:text-ink-800 hover:bg-ink-50')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login"><Button variant="ghost" size="md">Sign in</Button></Link>
          <Link to="/register"><Button size="md">Get Started</Button></Link>
        </div>

        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-ink-600 md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-100 bg-white px-4 py-3 md:hidden">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={({ isActive }) => cn('block rounded-lg px-3 py-2.5 text-sm font-medium', isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600')}>
              {l.label}
            </NavLink>
          ))}
          <div className="mt-2 flex gap-2 border-t border-ink-100 pt-3">
            <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Sign in</Button></Link>
            <Link to="/register" className="flex-1"><Button className="w-full">Get Started</Button></Link>
          </div>
        </div>
      )}
    </header>
  );
}
