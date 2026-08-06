import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { faqs, platformStats } from '@/lib/constants';
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function PublicFAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="container-app py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><HelpCircle className="h-7 w-7" /></div>
          <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 sm:text-4xl">Frequently Asked Questions</h1>
          <p className="mt-3 text-lg text-ink-500">Everything you need to know about SkillBridge CUET.</p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="card overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                <span className="text-base font-medium text-ink-800">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-ink-400 transition ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <div className="px-5 pb-5 text-sm leading-relaxed text-ink-500 animate-fade-in">{f.a}</div>}
            </div>
          ))}
        </div>
        <div className="mt-16 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {platformStats.map((s) => (
            <div key={s.label} className="card p-6 text-center">
              <p className="font-display text-3xl font-extrabold text-brand-600">{s.value.toLocaleString()}{s.suffix}</p>
              <p className="mt-1.5 text-sm text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
