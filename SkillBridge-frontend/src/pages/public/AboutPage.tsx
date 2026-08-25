import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Users, Sparkles, Target, Brain, Award } from 'lucide-react';

const values = [
  { icon: ShieldCheck, title: 'Verified & Trusted', description: 'Every student and company is verified to ensure a safe, scam-free ecosystem.' },
  { icon: Sparkles, title: 'AI-Powered', description: 'Smart matching, resume analysis, and candidate ranking powered by AI.' },
  { icon: Users, title: 'Community First', description: 'Built exclusively for the CUET community to connect talent with opportunity.' },
  { icon: Award, title: 'Quality Driven', description: 'We focus on meaningful opportunities, not spam postings or fake listings.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <section className="container-app py-20 text-center">
        <h1 className="font-display text-4xl font-extrabold text-ink-900 sm:text-5xl">Bridging CUET talent with opportunity</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-500">SkillBridge CUET is a centralized recruitment platform that connects verified CUET students with verified companies. We make hiring transparent, efficient, and trustworthy.</p>
      </section>

      <section className="container-app pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><v.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 text-lg font-semibold text-ink-800">{v.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-app">
          <h2 className="text-center font-display text-3xl font-bold text-ink-900">Our AI Features</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              { icon: Brain, title: 'AI Resume Analysis', description: 'Instant resume scoring with strengths, weaknesses, and improvement suggestions.' },
              { icon: Target, title: 'AI Recommendations', description: 'Personalized opportunity matches with match scores and reasoning.' },
              { icon: Users, title: 'AI Candidate Matching', description: 'Companies get ranked candidates with match percentages and explanations.' },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><f.icon className="h-6 w-6" /></div>
                <h3 className="mt-4 text-lg font-semibold text-ink-800">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
