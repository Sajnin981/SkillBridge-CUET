import { useEffect, useState } from 'react';
import { MapPin, Globe, CheckCircle2, Pencil, Upload, Building2, Trophy, Briefcase } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { companyService } from '@/services/companyService';
import type { Company } from '@/lib/types';

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ description: '', website: '', industry: '', address: '', logoUrl: '', achievements: '', projects: '' });

  useEffect(() => {
    companyService.getProfile().then((c) => {
      setCompany(c);
      if (c) {
        setEditForm({ description: c.about, website: c.website, industry: c.industry, address: c.location, logoUrl: '', achievements: c.achievements.join('\n'), projects: c.projects.map((p) => [p.title, p.description, p.link].join(' | ')).join('\n') });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setSaving(true);
    companyService.updateProfile({
      description: editForm.description,
      website: editForm.website,
      industry: editForm.industry,
      address: editForm.address,
      logoUrl: editForm.logoUrl || undefined,
      achievements: editForm.achievements.split('\n').map((item) => item.trim()).filter(Boolean),
      projects: editForm.projects.split('\n').map((line) => line.split('|').map((item) => item.trim())).filter(([title]) => title).map(([title, description = '', link = '']) => ({ title, description, link })),
    }).then((c) => {
      setCompany(c);
      setSaving(false);
      setEditOpen(false);
      toast({ title: 'Company profile updated', variant: 'success' });
    }).catch(() => {
      setSaving(false);
      toast({ title: 'Failed to update profile', variant: 'error' });
    });
  };

  if (loading) {
    return <PageContainer><SkeletonCard /></PageContainer>;
  }

  return (
    <PageContainer>
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-700 to-brand-600" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end justify-between">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-brand-600 shadow-card ring-4 ring-white">{company?.logo || user?.avatar || 'CO'}</div>
            <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" />Edit Profile</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-ink-800">{company?.name ?? user?.name ?? 'Company'}</h2>
            {company?.status === 'verified' && <Badge tone="success"><CheckCircle2 className="h-3 w-3" />Verified</Badge>}
            {company?.status === 'pending' && <Badge tone="warning">Pending Verification</Badge>}
            {company?.status === 'rejected' && <Badge tone="danger">Rejected</Badge>}
          </div>
          <p className="mt-1 text-sm text-ink-500">{company?.website && <span className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{company.website}</span>}</p>
          <p className="mt-1 text-sm text-ink-500">{company?.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{company.location}</span>}</p>
          <p className="mt-1 text-sm text-ink-500">{user?.email}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Verification Status" />
          <div className="flex flex-col items-center text-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${company?.status === 'verified' ? 'bg-success-50 text-success-600' : company?.status === 'pending' ? 'bg-warning-50 text-warning-600' : 'bg-danger-50 text-danger-600'}`}>
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-800">{company?.status === 'verified' ? 'Verified Company' : company?.status === 'pending' ? 'Pending Verification' : 'Rejected'}</p>
            <p className="mt-1 text-xs text-ink-400">{company?.status === 'verified' ? 'You can post opportunities and recruit students' : 'Awaiting admin approval'}</p>
          </div>
        </Card>
        <Card>
          <CardHeader title="Industry" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Building2 className="h-5 w-5" /></div>
            <p className="text-sm font-semibold text-ink-800">{company?.industry || 'Not specified'}</p>
          </div>
        </Card>
        <Card>
          <CardHeader title="Profile Completeness" />
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#16a34a" strokeWidth="6" strokeDasharray={`${(completeness(company) / 100) * 176} 176`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-800">{completeness(company)}%</span>
            </div>
            <div className="space-y-1 text-xs text-ink-500">
              <p>Add company description</p>
              <p>Add industry & website</p>
              <p>Upload company logo</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="About" action={<Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil className="h-3.5 w-3.5" />Edit</Button>} />
        {company?.about ? (
          <p className="text-sm text-ink-600">{company.about}</p>
        ) : (
          <EmptyState icon={<Building2 className="h-6 w-6" />} title="No company description" description="Add your company description to help students learn about you." action={<Button size="sm" onClick={() => setEditOpen(true)}><Pencil className="h-3.5 w-3.5" />Edit Profile</Button>} />
        )}
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Achievements" />
          {company?.achievements.length ? <ul className="space-y-2">{company.achievements.map((item) => <li key={item} className="flex gap-2 text-sm text-ink-600"><Trophy className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />{item}</li>)}</ul> : <p className="text-sm text-ink-500">No achievements added yet.</p>}
        </Card>
        <Card>
          <CardHeader title="Projects and Current Work" />
          {company?.projects.length ? <div className="space-y-3">{company.projects.map((project) => <div key={project.title}><p className="flex items-center gap-2 text-sm font-semibold text-ink-800"><Briefcase className="h-4 w-4 text-brand-600" />{project.title}</p>{project.description && <p className="mt-1 text-sm text-ink-600">{project.description}</p>}{project.link && <a href={project.link} className="text-xs text-brand-600 hover:underline">{project.link}</a>}</div>)}</div> : <p className="text-sm text-ink-500">No projects added yet.</p>}
        </Card>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Company Profile" size="lg"
        footer={<><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button></>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-600">{company?.logo || user?.avatar || 'CO'}</div>
            <div><Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5" />Upload logo</Button><p className="mt-1.5 text-xs text-ink-400">Square image, max 1MB</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company Name"><Input defaultValue={company?.name ?? user?.name} disabled /></Field>
            <Field label="Industry"><Input value={editForm.industry} onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })} /></Field>
            <Field label="Website"><Input value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} placeholder="company.com" /></Field>
            <Field label="Location"><Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} placeholder="Dhaka, BD" /></Field>
          </div>
          <Field label="About"><Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Describe your company…" /></Field>
          <Field label="Achievements" hint="One achievement per line"><Textarea value={editForm.achievements} onChange={(e) => setEditForm({ ...editForm, achievements: e.target.value })} placeholder="Recognized as ..." /></Field>
          <Field label="Projects and current work" hint="One per line: title | description | link"><Textarea value={editForm.projects} onChange={(e) => setEditForm({ ...editForm, projects: e.target.value })} placeholder="Product platform | Building ... | https://example.com" /></Field>
        </div>
      </Modal>
    </PageContainer>
  );
}

function completeness(c: Company | null): number {
  if (!c) return 0;
  let filled = 0;
  const total = 4;
  if (c.about) filled++;
  if (c.industry) filled++;
  if (c.website) filled++;
  if (c.logo) filled++;
  return Math.round((filled / total) * 100);
}
