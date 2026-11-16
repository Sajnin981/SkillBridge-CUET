import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const sections = [
  {
    title: 'Platform',
    links: [
      { label: 'Opportunities', to: '/opportunities' },
      { label: 'Companies', to: '/companies' },
      { label: 'About', to: '/about' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    title: 'For Students',
    links: [
      { label: 'Track Applications', to: '/student/applied' },
      { label: 'Build Profile', to: '/student/profile' },
      { label: 'Resume Builder', to: '/student/resume' },
      { label: 'Recommendations', to: '/student/recommendations' },
    ],
  },
  {
    title: 'For Companies',
    links: [
      { label: 'Post an Opportunity', to: '/company/opportunities/new' },
      { label: 'Manage Opportunities', to: '/company/opportunities' },
      { label: 'Review Applicants', to: '/company/applicants' },
      { label: 'Company Profile', to: '/company/profile' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="container-app py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display text-base font-bold text-ink-800">SkillBridge</span>
                <span className="ml-1 text-sm font-semibold text-brand-600">CUET</span>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-ink-500">Connecting verified CUET talent with verified companies. Build your career with confidence.</p>
          </div>
          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-sm font-semibold text-ink-800">{s.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {s.links.map((link) => (
                  <li key={link.to}><Link to={link.to} className="text-sm text-ink-500 transition hover:text-brand-600">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 sm:flex-row">
          <p className="text-sm text-ink-400">© 2026 SkillBridge CUET. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
