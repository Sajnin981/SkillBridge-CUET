import { useState } from 'react';
import { Pencil, Upload, Plus, Github, Linkedin, Globe, Award, FolderGit2, GraduationCap, Briefcase, FileText, CheckCircle2, User } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <PageContainer>
      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-700 to-brand-600" />
        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end justify-between">
            <Avatar name={user?.name ?? 'User'} size="xl" ring />
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
          </div>
          <div className="mt-3">
            <h2 className="text-xl font-bold text-ink-800">{user?.name ?? 'Student'}</h2>
            <p className="text-sm text-ink-500">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="brand">Student</Badge>
              <Badge tone="neutral">CUET</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Resume" subtitle="Your latest CV attached to applications" action={<Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5" />Upload</Button>} />
            <EmptyState icon={<FileText className="h-6 w-6" />} title="No resume uploaded" description="Upload your CV to apply for opportunities and unlock AI recommendations." action={<Button size="sm"><Upload className="h-3.5 w-3.5" />Upload Resume</Button>} />
          </Card>

          <Card>
            <CardHeader title="Projects" action={<Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5" />Add</Button>} />
            <EmptyState icon={<FolderGit2 className="h-6 w-6" />} title="No projects yet" description="Add your projects to showcase your work to recruiters." action={<Button size="sm"><Plus className="h-3.5 w-3.5" />Add Project</Button>} />
          </Card>

          <Card>
            <CardHeader title="Achievements" action={<Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5" />Add</Button>} />
            <EmptyState icon={<Award className="h-6 w-6" />} title="No achievements added" description="Highlight your awards and accomplishments." />
          </Card>

          <Card>
            <CardHeader title="Certifications" action={<Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5" />Add</Button>} />
            <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="No certifications" description="Add your professional certifications." />
          </Card>

          <Card>
            <CardHeader title="Education" />
            <EmptyState icon={<GraduationCap className="h-6 w-6" />} title="No education records" description="Add your educational background." />
          </Card>

          <Card>
            <CardHeader title="Experience" action={<Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5" />Add</Button>} />
            <EmptyState icon={<Briefcase className="h-6 w-6" />} title="No experience added" description="Add your work or internship experience." />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Skills" action={<Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5" />Add</Button>} />
            <EmptyState icon={<User className="h-6 w-6" />} title="No skills added" description="Add your skills to improve AI matching." />
          </Card>

          <Card>
            <CardHeader title="Social Links" />
            <div className="flex gap-2">
              <Button variant="outline" size="icon"><Github className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Linkedin className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Globe className="h-4 w-4" /></Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile" size="lg"
        footer={<><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={() => { setEditOpen(false); toast({ title: 'Profile updated', variant: 'success' }); }}>Save changes</Button></>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name ?? 'U'} size="xl" />
            <div><Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5" />Upload photo</Button><p className="mt-1.5 text-xs text-ink-400">JPG or PNG, max 2MB</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name"><Input defaultValue={user?.name} /></Field>
            <Field label="Title"><Input placeholder="e.g. Aspiring Software Engineer" /></Field>
            <Field label="Department"><Input placeholder="Computer Science & Engineering" /></Field>
            <Field label="CGPA"><Input placeholder="3.78" /></Field>
            <Field label="Batch"><Input placeholder="2022" /></Field>
            <Field label="Location"><Input placeholder="Chittagong, Bangladesh" /></Field>
            <Field label="Phone"><Input placeholder="+880 1700-000000" /></Field>
            <Field label="Email"><Input defaultValue={user?.email} /></Field>
          </div>
          <Field label="Bio"><Textarea placeholder="Tell recruiters about yourself…" /></Field>
        </div>
      </Modal>
    </PageContainer>
  );
}
