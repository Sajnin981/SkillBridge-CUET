import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText, Upload, FileUp, Sparkles, CheckCircle2 } from 'lucide-react';

export default function StudentResumePage() {
  const hasResume = true;
  const resumeScore = 88;

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Resume</h2>
        <p className="mt-1 text-sm text-ink-500">Upload and manage your CV. Your resume is attached to every application.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Current Resume" action={<Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5" />Upload New</Button>} />
            {hasResume ? (
              <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><FileText className="h-6 w-6" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-800">Rahim_Ahmed_Resume.pdf</p>
                  <p className="text-xs text-ink-400">Updated 2 days ago · 2 pages</p>
                </div>
                <Button variant="ghost" size="sm">View</Button>
                <Button variant="ghost" size="sm">Replace</Button>
              </div>
            ) : (
              <EmptyState icon={<FileUp className="h-7 w-7" />} title="No resume uploaded" description="Upload your CV to apply for opportunities and unlock AI recommendations." action={<Button><Upload className="h-4 w-4" />Upload Resume</Button>} />
            )}
          </Card>

          <Card className="mt-6">
            <CardHeader title="Resume Tips" />
            <ul className="space-y-2.5">
              {[
                'Use a clean, single-column format for ATS compatibility',
                'Quantify achievements (e.g., "improved performance by 40%")',
                'Keep it to 1-2 pages maximum',
                'Tailor your resume for each role you apply to',
                'Include relevant keywords from the job description',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-ink-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />{t}</li>
              ))}
            </ul>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader title="Resume Score" action={<Sparkles className="h-4 w-4 text-brand-500" />} />
            <div className="flex flex-col items-center text-center">
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#2563eb" strokeWidth="10" strokeDasharray={`${(resumeScore / 100) * 327} 327`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-4xl font-extrabold text-ink-800">{resumeScore}</span>
                  <span className="text-xs text-ink-400">out of 100</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-500">Good resume. Visit AI Resume Analysis for detailed feedback.</p>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
