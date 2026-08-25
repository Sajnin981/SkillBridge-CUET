import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, Brain, Target, Users, ShieldCheck, Briefcase, GraduationCap,
  Search, FileCheck, MessageSquare, TrendingUp, CheckCircle2, Star, Quote, ChevronDown,
  Building2, Trophy, Laptop, FlaskConical, Clock,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { trustedCompanies, testimonials, faqs, platformStats, categories } from '@/lib/constants';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <AIFeatures />
      <HowItWorks />
      <Benefits />
      <Stats />
      <Categories />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl" />
      </div>
      <div className="container-app py-20 lg:py-28">
        <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-3xl text-center">
          <motion.div variants={fadeUp}>
            <Badge tone="brand" className="mb-5 px-3.5 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered recruitment for CUET
            </Badge>
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-display text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Where <span className="text-brand-600">verified talent</span> meets <span className="text-accent-600">verified opportunities</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-lg text-ink-500">
            SkillBridge CUET connects verified CUET students with verified companies. Browse internships, jobs, research, and more — with AI matching that finds the right fit for you.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register"><Button size="lg" className="w-full sm:w-auto">Get Started Free <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/opportunities"><Button size="lg" variant="outline" className="w-full sm:w-auto">Browse Opportunities</Button></Link>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-6 flex items-center justify-center gap-6 text-sm text-ink-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success-500" />Free for students</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success-500" />Verified companies</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success-500" />AI-powered</span>
          </motion.div>
        </motion.div>

        {/* Hero illustration / dashboard preview */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="mx-auto mt-16 max-w-5xl">
          <div className="rounded-2xl bg-white p-2 shadow-pop ring-1 ring-ink-200/60">
            <div className="rounded-xl border border-ink-100 bg-ink-50 p-4">
              <div className="flex items-center gap-2 pb-4">
                <div className="h-3 w-3 rounded-full bg-danger-400" />
                <div className="h-3 w-3 rounded-full bg-warning-400" />
                <div className="h-3 w-3 rounded-full bg-success-400" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { title: 'Frontend Engineer Intern', company: 'Brain Station 23', type: 'Internship', remote: true, location: 'Dhaka, BD', salary: 'BDT 15,000/mo' },
                  { title: 'ML Research Assistant', company: 'Telenor Health', type: 'Research', remote: true, location: 'Remote', salary: 'BDT 20,000/mo' },
                  { title: 'Backend Engineer', company: 'Pathao', type: 'Job', remote: false, location: 'Dhaka, BD', salary: 'BDT 45,000/mo' },
                ].map((o) => (
                  <div key={o.title} className="rounded-xl bg-white p-4 shadow-soft ring-1 ring-ink-200/60">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={o.company} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-800">{o.title}</p>
                        <p className="text-xs text-ink-400">{o.company}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <Badge tone="brand">{o.type}</Badge>
                      {o.remote && <Badge tone="neutral">Remote</Badge>}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
                      <span>{o.location}</span>
                      <span className="font-medium text-brand-600">{o.salary}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustedBy() {
  return (
    <section className="border-y border-ink-100 bg-white py-10">
      <div className="container-app">
        <p className="text-center text-sm font-medium text-ink-400">Trusted by leading companies hiring from CUET</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {trustedCompanies.map((c) => (
            <span key={c} className="font-display text-lg font-bold text-ink-300 transition hover:text-ink-400">{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: ShieldCheck, title: 'Verified Ecosystem', description: 'Every student and company is verified. No spam, no fake postings — just real opportunities.' },
  { icon: Search, title: 'Advanced Search', description: 'Filter by skills, location, category, salary, and experience to find your perfect match.' },
  { icon: FileCheck, title: 'Application Tracking', description: 'Track every application from submitted to offered with a clear pipeline view.' },
  { icon: MessageSquare, title: 'Direct Messaging', description: 'Companies and students communicate directly within the platform.' },
  { icon: TrendingUp, title: 'Analytics Dashboard', description: 'Real-time insights on applications, profile strength, and hiring trends.' },
  { icon: Building2, title: 'Company Profiles', description: 'Rich company pages with verification status, open roles, and hire history.' },
];

function Features() {
  return (
    <section className="py-20">
      <div className="container-app">
        <SectionHeader eyebrow="Features" title="Everything you need to hire and get hired" description="A complete recruitment platform built for the CUET community with the tools that matter." />
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp}>
              <div className="card group h-full p-6 transition hover:shadow-card hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-800">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const aiFeatures = [
  { icon: Brain, title: 'AI Resume Analysis', description: 'Upload your resume and get an instant score with strengths, weaknesses, and improvement suggestions.', tone: 'brand' as const },
  { icon: Target, title: 'AI Opportunity Recommendation', description: 'Get personalized opportunity matches with match scores and reasons for each recommendation.', tone: 'accent' as const },
  { icon: Users, title: 'AI Candidate Matching', description: 'Companies get ranked candidates with match percentages and explanations for every applicant.', tone: 'success' as const },
];

function AIFeatures() {
  return (
    <section className="py-20">
      <div className="container-app">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 lg:p-14">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="neutral" className="bg-white/15 text-white ring-white/20"><Sparkles className="h-3.5 w-3.5" />AI-Powered</Badge>
            <h2 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">Smart matching with AI</h2>
            <p className="mt-4 text-lg text-brand-100">Three AI features that help students find the right opportunities and companies find the right talent — faster.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {aiFeatures.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/15">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-brand-100">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  { icon: GraduationCap, title: 'Create your profile', description: 'Students register with CUET email. Companies submit their profile for verification.' },
  { icon: Search, title: 'Discover opportunities', description: 'Browse and search opportunities with advanced filters and AI recommendations.' },
  { icon: FileCheck, title: 'Apply with one click', description: 'Submit your profile and resume. Track your application status in real time.' },
  { icon: MessageSquare, title: 'Connect & get hired', description: 'Companies shortlist, interview, and message candidates directly on the platform.' },
];

function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <div className="container-app">
        <SectionHeader eyebrow="How it works" title="Four simple steps to your next opportunity" description="From sign-up to hire — a streamlined process for students and companies." />
        <div className="mt-14 grid gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <s.icon className="h-7 w-7" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                <h3 className="text-base font-semibold text-ink-800">{s.title}</h3>
              </div>
              <p className="mt-2 text-sm text-ink-500">{s.description}</p>
              {i < steps.length - 1 && <div className="absolute right-0 top-7 hidden h-px w-full bg-ink-200 md:block" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const studentBenefits = [
  'Free for all CUET students',
  'AI-powered resume scoring',
  'Personalized opportunity recommendations',
  'Application tracking dashboard',
  'Direct messaging with recruiters',
  'Verified, scam-free opportunities',
];

const companyBenefits = [
  'Access to verified CUET talent pool',
  'AI candidate ranking and matching',
  'Applicant management pipeline',
  'Direct messaging with candidates',
  'Company profile with verification badge',
  'Analytics on applications and hires',
];

function Benefits() {
  return (
    <section className="py-20">
      <div className="container-app">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="card p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><GraduationCap className="h-6 w-6" /></div>
            <h3 className="mt-4 text-xl font-bold text-ink-800">For Students</h3>
            <p className="mt-2 text-sm text-ink-500">Everything you need to launch your career, in one place.</p>
            <ul className="mt-6 space-y-3">
              {studentBenefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-ink-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />{b}
                </li>
              ))}
            </ul>
            <Link to="/register"><Button className="mt-6">Join as Student <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
          <div className="card p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600"><Building2 className="h-6 w-6" /></div>
            <h3 className="mt-4 text-xl font-bold text-ink-800">For Companies</h3>
            <p className="mt-2 text-sm text-ink-500">Hire verified CUET talent with AI-powered matching.</p>
            <ul className="mt-6 space-y-3">
              {companyBenefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-ink-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />{b}
                </li>
              ))}
            </ul>
            <Link to="/register"><Button className="mt-6" variant="secondary">Hire on SkillBridge <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="py-20">
      <div className="container-app">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {platformStats.map((s) => (
            <div key={s.label} className="card p-6 text-center">
              <p className="font-display text-3xl font-extrabold text-brand-600 lg:text-4xl">{s.value.toLocaleString()}{s.suffix}</p>
              <p className="mt-1.5 text-sm text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const categoryIcons: Record<string, typeof Briefcase> = {
  Internship: Briefcase, Job: Building2, Freelancing: Laptop, Research: FlaskConical, Competition: Trophy, Scholarship: GraduationCap, 'Part-time': Clock,
};

function Categories() {
  return (
    <section className="bg-white py-20">
      <div className="container-app">
        <SectionHeader eyebrow="Categories" title="Explore opportunities by type" description="Internships, jobs, research, competitions, scholarships, and more." />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const Icon = categoryIcons[c.type] ?? Briefcase;
            return (
              <Link key={c.type} to="/opportunities" className="card group p-5 transition hover:shadow-card hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-ink-400">{c.count}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink-800">{c.type}</h3>
                <p className="mt-1 text-sm text-ink-500">{c.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-20">
      <div className="container-app">
        <SectionHeader eyebrow="Testimonials" title="Loved by students and companies" description="Real stories from the SkillBridge CUET community." />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <Quote className="h-7 w-7 text-brand-200" />
              <p className="mt-3 text-sm leading-relaxed text-ink-600">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
                <Avatar name={t.name} size="md" />
                <div>
                  <p className="text-sm font-semibold text-ink-800">{t.name}</p>
                  <p className="text-xs text-ink-400">{t.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning-500 text-warning-500" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-white py-20">
      <div className="container-app">
        <SectionHeader eyebrow="FAQ" title="Frequently asked questions" description="Everything you need to know about SkillBridge CUET." />
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
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20">
      <div className="container-app">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 p-10 text-center lg:p-16">
          <div className="absolute inset-0 -z-10 opacity-20">
            <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-accent-300 blur-3xl" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Ready to bridge the gap?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">Join SkillBridge CUET today and connect with verified opportunities and talent.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register"><Button size="lg" className="w-full bg-white text-brand-700 hover:bg-brand-50 sm:w-auto">Get Started Free <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/login"><Button size="lg" variant="ghost" className="w-full text-white hover:bg-white/10 sm:w-auto">Sign in</Button></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto max-w-2xl text-center">
      <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</motion.p>
      <motion.h2 variants={fadeUp} className="mt-2 font-display text-3xl font-bold text-ink-900 sm:text-4xl">{title}</motion.h2>
      <motion.p variants={fadeUp} className="mt-4 text-lg text-ink-500">{description}</motion.p>
    </motion.div>
  );
}
