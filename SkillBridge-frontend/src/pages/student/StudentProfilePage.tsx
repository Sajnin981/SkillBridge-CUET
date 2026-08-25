import { useEffect, useState } from 'react';
import { Pencil, Upload, Plus, Github, Linkedin, Globe, Award, FolderGit2, GraduationCap, Briefcase, FileText, CheckCircle2, User } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { studentService } from '@/services/studentService';
import type { StudentProfile } from '@/lib/types';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', phone: '', location: '', skills: '' });

  useEffect(() => {
    studentService.getProfile().then((p) => {
      setProfile(p);
      setEditForm({ bio: p.bio, phone: p.phone, location: p.location, skills: p.skills.map((s) => s.name).join(', ') });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setSaving(true);
    const skills = editForm.skills.split(',').map((s) => s.trim()).filter(Boolean);
    studentService.updateProfile({ bio: editForm.bio, skills }).then((p) => {
      setProfile(p);
      setSaving(false);
      setEditOpen(false);
      toast({ title: 'Profile updated', variant: 'success' });
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
        <div className="h-24 bg-gradient-to-r from-brand-700 to-brand-600" />
        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end justify-between">
            <Avatar name={profile?.name ?? user?.name ?? 'User'} size="xl" ring />
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
          </div>
          <div className="mt-3">
            <h2 className="text-xl font-bold text-ink-800">{profile?.name ?? user?.name ?? 'Student'}</h2>
            <p className="text-sm text-ink-500">{profile?.email ?? user?.email}</p>
            <p className="mt-1 text-sm text-ink-600">{profile?.title}</p>
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
            {profile?.resumeUrl ? (
              <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><FileText className="h-6 w-6" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-800">My Resume</p>
                  <p className="text-xs text-ink-400">{profile.resumeUrl}</p>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ) : (
              <EmptyState icon={<FileText className="h-6 w-6" />} title="No resume uploaded" description="Upload your CV to apply for opportunities and unlock AI recommendations." action={<Button size="sm"><Upload className="h-3.5 w-3.5" />Upload Resume</Button>} />
            )}
          </Card>

          <Card>
            <CardHeader title="Projects" action={<Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5" />Add</Button>} />
            {profile?.projects && profile.projects.length > 0 ? (
              <div className="space-y-3">
                {profile.projects.map((p, i) => (
                  <div key={i} className="rounded-xl border border-ink-100 p-4">
                    <p className="text-sm font-semibold text-ink-800">{p.title}</p>
                    <p className="mt-1 text-xs text-ink-500">{p.description}</p>
                    {p.link && <a href={p.link} className="mt-1 text-xs text-brand-600 hover:underline">{p.link}</a>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<FolderGit2 className="h-6 w-6" />} title="No projects yet" description="Add your projects to showcase your work to recruiters." action={<Button size="sm"><Plus className="h-3.5 w-3.5" />Add Project</Button>} />
            )}
          </Card>

          <Card>
            <CardHeader title="Achievements" action={<Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5" />Add</Button>} />
            {profile?.achievements && profile.achievements.length > 0 ? (
              <div className="space-y-2">
                {profile.achievements.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-lg bg-ink-50 p-3">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                    <p className="text-sm text-ink-700">{a}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Award className="h-6 w-6" />} title="No achievements added" description="Highlight your awards and accomplishments." />
            )}
          </Card>

          <Card>
            <CardHeader title="Certifications" action={<Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5" />Add</Button>} />
            {profile?.certifications && profile.certifications.length > 0 ? (
              <div className="space-y-2">
                {profile.certifications.map((c, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-lg bg-ink-50 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                    <div>
                      <p className="text-sm font-medium text-ink-700">{c.name}</p>
                      <p className="text-xs text-ink-400">{c.issuer}{c.year && ` · ${c.year}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="No certifications" description="Add your professional certifications." />
            )}
          </Card>

          <Card>
            <CardHeader title="Education" />
            {profile?.education && profile.education.length > 0 ? (
              <div className="space-y-3">
                {profile.education.map((e, i) => (
                  <div key={i} className="rounded-xl border border-ink-100 p-4">
                    <p className="text-sm font-semibold text-ink-800">{e.institution}</p>
                    <p className="text-xs text-ink-500">{e.degree}{e.field && `, ${e.field}`}</p>
                    <p className="text-xs text-ink-400">{e.start}{e.end && ` — ${e.end}`}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<GraduationCap className="h-6 w-6" />} title="No education records" description="Add your educational background." />
            )}
          </Card>

          <Card>
            <CardHeader title="Experience" action={<Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5" />Add</Button>} />
            {profile?.experience && profile.experience.length > 0 ? (
              <div className="space-y-3">
                {profile.experience.map((e, i) => (
                  <div key={i} className="rounded-xl border border-ink-100 p-4">
                    <p className="text-sm font-semibold text-ink-800">{e.role}</p>
                    <p className="text-xs text-ink-500">{e.company}</p>
                    <p className="text-xs text-ink-400">{e.start}{e.end && ` — ${e.end}`}</p>
                    {e.description && <p className="mt-1 text-xs text-ink-600">{e.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Briefcase className="h-6 w-6" />} title="No experience added" description="Add your work or internship experience." />
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Skills" action={<Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5" />Add</Button>} />
            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s, i) => (
                  <Badge key={i} tone="brand">{s.name}</Badge>
                ))}
              </div>
            ) : (
              <EmptyState icon={<User className="h-6 w-6" />} title="No skills added" description="Add your skills to improve AI matching." />
            )}
          </Card>

          <Card>
            <CardHeader title="Bio" />
            {profile?.bio ? (
              <p className="text-sm text-ink-600">{profile.bio}</p>
            ) : (
              <EmptyState icon={<User className="h-6 w-6" />} title="No bio added" description="Tell recruiters about yourself." />
            )}
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
        footer={<><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button></>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={profile?.name ?? user?.name ?? 'U'} size="xl" />
            <div><Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5" />Upload photo</Button><p className="mt-1.5 text-xs text-ink-400">JPG or PNG, max 2MB</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name"><Input defaultValue={profile?.name ?? user?.name} disabled /></Field>
            <Field label="Email"><Input defaultValue={profile?.email ?? user?.email} disabled /></Field>
            <Field label="Department"><Input defaultValue={profile?.department} disabled /></Field>
            <Field label="Batch"><Input defaultValue={profile?.batch} disabled /></Field>
            <Field label="Phone"><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></Field>
            <Field label="Location"><Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} /></Field>
          </div>
          <Field label="Skills (comma-separated)"><Input value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} placeholder="React, Node.js, Python" /></Field>
          <Field label="Bio"><Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell recruiters about yourself…" /></Field>
        </div>
      </Modal>
    </PageContainer>
  );
}
