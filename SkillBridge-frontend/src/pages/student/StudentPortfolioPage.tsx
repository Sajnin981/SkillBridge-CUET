import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { FolderGit2, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { studentService } from '@/services/studentService';
import { normalizeError } from '@/api/axios';

export default function StudentPortfolioPage() {
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [projectUrl, setProjectUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    studentService.getProfile().then((p) => {
      setPortfolio(p.projects.map((proj) => proj.title || proj.link).filter(Boolean));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectUrl.trim()) return;
    setSaving(true);
    const updated = Array.from(new Set([...portfolio, projectUrl.trim()]));
    try {
      await studentService.updateProfile({ portfolio: updated });
      setPortfolio(updated);
      setProjectUrl('');
      setOpenAdd(false);
      toast({ title: 'Project added to portfolio', variant: 'success' });
    } catch (err) {
      const apiErr = normalizeError(err);
      toast({ title: 'Failed to add project', description: apiErr.message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (item: string) => {
    const updated = portfolio.filter((p) => p !== item);
    try {
      await studentService.updateProfile({ portfolio: updated });
      setPortfolio(updated);
      toast({ title: 'Project removed', variant: 'info' });
    } catch (err) {
      const apiErr = normalizeError(err);
      toast({ title: 'Failed to remove project', description: apiErr.message, variant: 'error' });
    }
  };

  if (loading) {
    return <PageContainer><SkeletonCard /></PageContainer>;
  }

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-800">Portfolio</h2>
          <p className="mt-1 text-sm text-ink-500">Showcase your project links and repositories to recruiters.</p>
        </div>
        <Button onClick={() => setOpenAdd(true)}><Plus className="h-4 w-4" />Add Project Link</Button>
      </div>

      {portfolio.length === 0 ? (
        <div className="card"><EmptyState icon={<FolderGit2 className="h-7 w-7" />} title="No projects yet" description="Add your first project to showcase your work to companies." action={<Button onClick={() => setOpenAdd(true)}><Plus className="h-4 w-4" />Add Project Link</Button>} /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {portfolio.map((p) => (
            <Card key={p}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><FolderGit2 className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-ink-800 truncate">{p}</p>
                  <a href={p.startsWith('http') ? p : `https://${p}`} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline truncate max-w-full">
                    {p} <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(p)}>
                  <Trash2 className="h-4 w-4 text-danger-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Project to Portfolio" size="sm"
        footer={<><Button variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button><Button onClick={handleAdd} loading={saving}>Add Project</Button></>}>
        <form onSubmit={handleAdd} className="space-y-4">
          <Field label="Project URL or Repository">
            <Input required value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="e.g. https://github.com/myusername/project" />
          </Field>
        </form>
      </Modal>
    </PageContainer>
  );
}
