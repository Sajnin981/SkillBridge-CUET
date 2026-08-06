import { useEffect, useState } from 'react';
import { Sparkles, Upload, FileText, CheckCircle2, XCircle, Lightbulb, Target, RefreshCw, Brain } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { aiService } from '@/services/aiService';

type Analysis = { score: number; summary: string; strengths: string[]; weaknesses: string[]; missingSkills: string[]; suggestions: string[] };

export default function AIResumeAnalysisPage() {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  const analyze = () => {
    setAnalyzing(true);
    aiService.analyzeResume().then((result) => {
      setAnalyzing(false);
      setAnalysis(result);
      if (result) toast({ title: 'Resume analysis complete', variant: 'success' });
      else toast({ title: 'Upload a resume first', description: 'Add your CV to get AI analysis.', variant: 'warning' });
    });
  };

  if (!hasResume && !analyzing) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-800">AI Resume Analysis <Badge tone="brand"><Sparkles className="h-3 w-3" />AI</Badge></h2>
          <p className="mt-1 text-sm text-ink-500">Get an instant AI-powered review of your resume with actionable insights.</p>
        </div>
        <div className="card">
          <EmptyState
            icon={<Brain className="h-7 w-7" />}
            title="Upload your CV to unlock AI analysis"
            description="Our AI will extract skills, score your resume, and provide personalized improvement suggestions."
            action={<Button onClick={() => { setHasResume(true); analyze(); }}><Upload className="h-4 w-4" />Upload & Analyze</Button>}
          />
        </div>
      </PageContainer>
    );
  }

  if (analyzing) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-800">AI Resume Analysis <Badge tone="brand"><Sparkles className="h-3 w-3" />AI</Badge></h2>
        </div>
        <Card>
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><RefreshCw className="h-8 w-8 animate-spin" /></div>
            <h3 className="mt-4 text-lg font-semibold text-ink-800">Analyzing your resume…</h3>
            <p className="mt-2 text-sm text-ink-500">Extracting skills, scoring content, and generating insights.</p>
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (!analysis) {
    return (
      <PageContainer>
        <div className="mb-6">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-800">AI Resume Analysis <Badge tone="brand"><Sparkles className="h-3 w-3" />AI</Badge></h2>
        </div>
        <Card>
          <EmptyState icon={<FileText className="h-7 w-7" />} title="No analysis available" description="Upload your resume and run the AI analysis to see your score and suggestions." action={<Button onClick={analyze}><RefreshCw className="h-4 w-4" />Run Analysis</Button>} />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-800">AI Resume Analysis <Badge tone="brand"><Sparkles className="h-3 w-3" />AI</Badge></h2>
          <p className="mt-1 text-sm text-ink-500">Instant AI-powered review with actionable insights.</p>
        </div>
        <Button variant="outline" onClick={analyze}><RefreshCw className="h-4 w-4" />Re-analyze</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-1">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-medium text-ink-500">Resume Score</p>
            <div className="relative mt-3 h-32 w-32">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray={`${(analysis.score / 100) * 327} 327`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-extrabold text-ink-800">{analysis.score}</span>
                <span className="text-xs text-ink-400">out of 100</span>
              </div>
            </div>
          </div>
        </Card>
        <Card className="sm:col-span-2">
          <CardHeader title="Summary" />
          <p className="text-sm leading-relaxed text-ink-600">{analysis.summary}</p>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 p-3">
            <Lightbulb className="h-4 w-4 text-brand-600" />
            <p className="text-xs text-brand-700">Re-analyze after updates to track your score improvement.</p>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Strengths" action={<Badge tone="success"><CheckCircle2 className="h-3 w-3" />Positive</Badge>} />
          <ul className="space-y-3">
            {analysis.strengths.map((s) => (
              <li key={s} className="flex items-start gap-3 text-sm text-ink-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />{s}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Weaknesses" action={<Badge tone="danger"><XCircle className="h-3 w-3" />Needs work</Badge>} />
          <ul className="space-y-3">
            {analysis.weaknesses.map((w) => (
              <li key={w} className="flex items-start gap-3 text-sm text-ink-600"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" />{w}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Missing Skills" action={<Target className="h-5 w-5 text-brand-500" />} />
        <div className="flex flex-wrap gap-2">
          {analysis.missingSkills.map((s) => <span key={s} className="chip bg-warning-50 text-warning-700 ring-1 ring-warning-200/60">{s}</span>)}
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Improvement Suggestions" action={<Badge tone="brand"><Sparkles className="h-3 w-3" />AI</Badge>} />
        <div className="space-y-3">
          {analysis.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-ink-50 p-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</div>
              <p className="text-sm text-ink-600">{s}</p>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
