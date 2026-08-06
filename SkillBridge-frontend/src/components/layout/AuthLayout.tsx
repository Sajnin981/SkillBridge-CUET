import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

const benefits = ['Verified CUET community', 'AI-powered matching', 'Free for students', 'Direct recruiter access'];

export function AuthLayout({ children, title, subtitle, side = 'student' }: { children: ReactNode; title: string; subtitle: string; side?: 'student' | 'company' }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left form */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-base font-bold text-ink-800">SkillBridge</span>
              <span className="ml-1 text-sm font-semibold text-brand-600">CUET</span>
            </div>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
            <ArrowLeft className="h-4 w-4" />Back home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <h1 className="font-display text-2xl font-bold text-ink-900">{title}</h1>
            <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
      {/* Right panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 lg:flex lg:flex-col lg:justify-center lg:p-14">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-accent-300 blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white ring-1 ring-white/20">
            <Sparkles className="h-3.5 w-3.5" /> {side === 'student' ? 'For Students' : 'For Companies'}
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight text-white">
            {side === 'student' ? 'Launch your career with verified opportunities' : 'Hire verified CUET talent with confidence'}
          </h2>
          <p className="mt-4 max-w-md text-brand-100">
            {side === 'student'
              ? 'Join thousands of CUET students finding internships, jobs, research, and more — all in one place.'
              : 'Post opportunities, get AI-ranked candidates, and hire the best CUET has to offer.'}
          </p>
          <ul className="mt-8 space-y-3.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-brand-50">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-300" />{b}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <div className="flex -space-x-2">
              {['RA', 'SI', 'TH', 'NJ'].map((a) => (
                <div key={a} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white ring-2 ring-brand-700">{a}</div>
              ))}
            </div>
            <p className="text-sm text-brand-50"><span className="font-semibold text-white">4,800+</span> students already on SkillBridge</p>
          </div>
        </div>
      </div>
    </div>
  );
}
