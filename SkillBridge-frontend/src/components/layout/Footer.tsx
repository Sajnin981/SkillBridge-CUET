import { Link } from 'react-router-dom';
import { GraduationCap, Github, Linkedin, Twitter, Mail } from 'lucide-react';

const sections = [
  { title: 'Platform', links: ['Opportunities', 'Companies', 'AI Resume Analysis', 'Recommendations'] },
  { title: 'For Students', links: ['Browse Jobs', 'Track Applications', 'Build Profile', 'Career Resources'] },
  { title: 'For Companies', links: ['Post a Job', 'Find Talent', 'Pricing', 'Verification'] },
  { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
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
            <div className="mt-5 flex gap-2">
              {[Github, Linkedin, Twitter, Mail].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition hover:border-brand-300 hover:text-brand-600">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-sm font-semibold text-ink-800">{s.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {s.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-ink-500 transition hover:text-brand-600">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 sm:flex-row">
          <p className="text-sm text-ink-400">© 2026 SkillBridge CUET. All rights reserved.</p>
          <div className="flex gap-5 text-sm text-ink-400">
            <a href="#" className="hover:text-ink-600">Privacy</a>
            <a href="#" className="hover:text-ink-600">Terms</a>
            <a href="#" className="hover:text-ink-600">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
