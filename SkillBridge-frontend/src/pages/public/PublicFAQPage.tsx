import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqService, type FAQItem } from '@/services/faqService';
import { normalizeError } from '@/api/axios';
import { EmptyState } from '@/components/ui/EmptyState';

export default function PublicFAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    faqService.getPublished()
      .then(setFaqs)
      .catch((err) => setError(normalizeError(err).message))
      .finally(() => setLoading(false));
  }, []);

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
          {loading && <p className="text-center text-sm text-ink-400">Loading FAQs…</p>}
          {!loading && error && <div className="card p-6 text-center text-sm text-danger-600">{error}</div>}
          {!loading && !error && faqs.length === 0 && <div className="card"><EmptyState icon={<HelpCircle className="h-7 w-7" />} title="No FAQs published yet" description="Frequently asked questions will appear here when they are published." /></div>}
          {!loading && !error && faqs.map((f, i) => (
            <div key={f._id} className="card overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                <span className="text-base font-medium text-ink-800">{f.question}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-ink-400 transition ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <div className="px-5 pb-5 text-sm leading-relaxed text-ink-500 animate-fade-in">{f.answer}</div>}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
