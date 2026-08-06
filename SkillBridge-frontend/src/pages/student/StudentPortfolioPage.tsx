import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FolderGit2, Plus, ExternalLink } from 'lucide-react';

const projects = [
  { title: 'SkillBridge CUET', description: 'A centralized recruitment platform for CUET students and companies with AI-powered matching.', link: 'github.com/rahim/skillbridge', tags: ['React', 'TypeScript', 'Tailwind'] },
  { title: 'Campus Eats', description: 'Food delivery app for university cafeterias with real-time order tracking.', link: 'github.com/rahim/campus-eats', tags: ['React', 'Node.js', 'Socket.io'] },
  { title: 'StudyBuddy', description: 'Peer-to-peer tutoring marketplace with scheduling and video calls.', link: 'github.com/rahim/studybuddy', tags: ['Next.js', 'Prisma', 'WebRTC'] },
];

export default function StudentPortfolioPage() {
  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-800">Portfolio</h2>
          <p className="mt-1 text-sm text-ink-500">Showcase your projects to recruiters.</p>
        </div>
        <Button><Plus className="h-4 w-4" />Add Project</Button>
      </div>

      {projects.length === 0 ? (
        <div className="card"><EmptyState icon={<FolderGit2 className="h-7 w-7" />} title="No projects yet" description="Add your first project to showcase your work to companies." action={<Button><Plus className="h-4 w-4" />Add Project</Button>} /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.title}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><FolderGit2 className="h-5 w-5" /></div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-ink-800">{p.title}</p>
                  <p className="mt-1 text-sm text-ink-500">{p.description}</p>
                  <a href="#" className="mt-1.5 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">{p.link} <ExternalLink className="h-3 w-3" /></a>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => <span key={t} className="chip bg-ink-100 text-ink-600 text-[11px]">{t}</span>)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
