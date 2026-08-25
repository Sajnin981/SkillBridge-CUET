import { useEffect, useRef, useState } from 'react';
import { FileText, Upload, FileUp, CheckCircle2, GraduationCap, Briefcase, Award, FolderGit2, User } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { studentService } from '@/services/studentService';
import type { StudentProfile } from '@/lib/types';

export default function StudentResumePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ bio: '', skills: '', education: '', experience: '', certifications: '', achievements: '', portfolio: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    studentService.getProfile().then((p) => {
      setProfile(p);
      setDraft({
        bio: p.bio,
        skills: p.skills.map((s) => s.name).join(', '),
        education: p.education.map((e) => [e.institution, e.degree, e.field, e.start, e.end].join(' | ')).join('\n'),
        experience: p.experience.map((e) => [e.company, e.role, e.start, e.end, e.description].join(' | ')).join('\n'),
        certifications: p.certifications.map((c) => [c.name, c.issuer, c.year].join(' | ')).join('\n'),
        achievements: p.achievements.join('\n'),
        portfolio: p.projects.map((p) => p.title).join('\n'),
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateDraft = (field: keyof typeof draft, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  const handleSave = () => {
    setSaving(true);
    const splitLines = (value: string) => value.split('\n').map((line) => line.trim()).filter(Boolean);
    const splitFields = (value: string) => splitLines(value).map((line) => line.split('|').map((part) => part.trim()));
    studentService.updateProfile({
      bio: draft.bio,
      skills: draft.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      education: splitFields(draft.education).map(([institution = '', degree = '', field = '', startYear = '', endYear = '']) => ({ institution, degree, field, startYear, endYear })),
      experience: splitFields(draft.experience).map(([company = '', position = '', startDate = '', endDate = '', description = '']) => ({ company, position, startDate, endDate, description })),
      certifications: splitFields(draft.certifications).map(([name = '', issuer = '', date = '']) => ({ name, issuer, date })),
      achievements: splitLines(draft.achievements).map((title) => ({ title })),
      portfolio: splitLines(draft.portfolio),
    }).then((updated) => {
      setProfile(updated);
      setSaving(false);
      toast({ title: 'Resume details saved', variant: 'success' });
    }).catch(() => {
      setSaving(false);
      toast({ title: 'Could not save resume details', description: 'Please check the fields and try again.', variant: 'error' });
    });
  };

  const handleUpload = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    studentService.uploadResume(file).then((res) => {
      setProfile((prev) => prev ? { ...prev, resumeUrl: res.resumeUrl } : prev);
      setUploading(false);
      toast({ title: 'Resume uploaded', variant: 'success' });
    }).catch(() => {
      setUploading(false);
      toast({ title: 'Upload failed', variant: 'error' });
    });
  };

  if (loading) {
    return <PageContainer><SkeletonCard /></PageContainer>;
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Resume Builder</h2>
        <p className="mt-1 text-sm text-ink-500">Your professional resume, assembled from your profile data. Upload a PDF to attach to applications.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Edit Resume Details" subtitle="These supported profile fields are saved to your student account." action={<Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save details'}</Button>} />
            <div className="space-y-4">
              <Field label="Professional summary"><Textarea value={draft.bio} onChange={(e) => updateDraft('bio', e.target.value)} placeholder="A concise summary of your background and goals" /></Field>
              <Field label="Skills" hint="Separate skills with commas"><Textarea value={draft.skills} onChange={(e) => updateDraft('skills', e.target.value)} placeholder="React, Node.js, MongoDB" /></Field>
              <Field label="Education" hint="One entry per line: institution | degree | field | start year | end year"><Textarea value={draft.education} onChange={(e) => updateDraft('education', e.target.value)} placeholder="CUET | B.Sc. | Computer Science | 2022 | 2026" /></Field>
              <Field label="Experience" hint="One entry per line: company | role | start | end | description"><Textarea value={draft.experience} onChange={(e) => updateDraft('experience', e.target.value)} placeholder="Company | Intern | 2025 | 2025 | Built ..." /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Certifications" hint="One per line: name | issuer | date"><Textarea value={draft.certifications} onChange={(e) => updateDraft('certifications', e.target.value)} placeholder="AWS Cloud Practitioner | Amazon | 2025" /></Field>
                <Field label="Achievements" hint="One achievement per line"><Textarea value={draft.achievements} onChange={(e) => updateDraft('achievements', e.target.value)} placeholder="Dean's list" /></Field>
              </div>
              <Field label="Projects or portfolio items" hint="One project title or portfolio item per line"><Textarea value={draft.portfolio} onChange={(e) => updateDraft('portfolio', e.target.value)} placeholder="Campus marketplace" /></Field>
            </div>
          </Card>
          <Card>
            <CardHeader title="Resume Upload" action={<Button variant="outline" size="sm" onClick={handleUpload} disabled={uploading}><Upload className="h-3.5 w-3.5" />{uploading ? 'Uploading…' : 'Upload New'}</Button>} />
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
            {profile?.resumeUrl ? (
              <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><FileText className="h-6 w-6" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-800">My Resume</p>
                  <p className="text-xs text-ink-400">{profile.resumeUrl}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleUpload}>Replace</Button>
              </div>
            ) : (
              <EmptyState icon={<FileUp className="h-7 w-7" />} title="No resume uploaded" description="Upload your CV to apply for opportunities." action={<Button onClick={handleUpload} disabled={uploading}><Upload className="h-4 w-4" />{uploading ? 'Uploading…' : 'Upload Resume'}</Button>} />
            )}
          </Card>

          <Card>
            <CardHeader title="Professional Resume Preview" subtitle="Assembled from your profile data" />
            <div className="rounded-xl border border-ink-200 p-6">
              <div className="border-b border-ink-100 pb-4">
                <h3 className="font-display text-xl font-bold text-ink-800">{profile?.name || 'Your Name'}</h3>
                <p className="text-sm text-ink-500">{profile?.email} {profile?.phone && `· ${profile.phone}`}</p>
                <p className="text-sm text-ink-600">{profile?.title}</p>
              </div>

              {profile?.bio && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400">Summary</h4>
                  <p className="mt-1 text-sm text-ink-600">{profile.bio}</p>
                </div>
              )}

              {profile?.education && profile.education.length > 0 && (
                <div className="mt-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400"><GraduationCap className="h-3.5 w-3.5" />Education</h4>
                  <div className="mt-2 space-y-2">
                    {profile.education.map((e, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold text-ink-800">{e.institution}</p>
                        <p className="text-xs text-ink-500">{e.degree}{e.field && `, ${e.field}`}</p>
                        <p className="text-xs text-ink-400">{e.start}{e.end && ` — ${e.end}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile?.skills && profile.skills.length > 0 && (
                <div className="mt-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400"><User className="h-3.5 w-3.5" />Skills</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {profile.skills.map((s, i) => <Badge key={i} tone="neutral">{s.name}</Badge>)}
                  </div>
                </div>
              )}

              {profile?.experience && profile.experience.length > 0 && (
                <div className="mt-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400"><Briefcase className="h-3.5 w-3.5" />Experience</h4>
                  <div className="mt-2 space-y-2">
                    {profile.experience.map((e, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold text-ink-800">{e.role} — {e.company}</p>
                        <p className="text-xs text-ink-400">{e.start}{e.end && ` — ${e.end}`}</p>
                        {e.description && <p className="mt-0.5 text-xs text-ink-600">{e.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile?.projects && profile.projects.length > 0 && (
                <div className="mt-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400"><FolderGit2 className="h-3.5 w-3.5" />Projects</h4>
                  <div className="mt-2 space-y-2">
                    {profile.projects.map((p, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold text-ink-800">{p.title}</p>
                        {p.description && <p className="text-xs text-ink-600">{p.description}</p>}
                        {p.link && <a href={p.link} className="text-xs text-brand-600 hover:underline">{p.link}</a>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile?.certifications && profile.certifications.length > 0 && (
                <div className="mt-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400"><CheckCircle2 className="h-3.5 w-3.5" />Certifications</h4>
                  <div className="mt-2 space-y-1">
                    {profile.certifications.map((c, i) => (
                      <p key={i} className="text-sm text-ink-700">{c.name}{c.issuer && ` — ${c.issuer}`}{c.year && ` (${c.year})`}</p>
                    ))}
                  </div>
                </div>
              )}

              {profile?.achievements && profile.achievements.length > 0 && (
                <div className="mt-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400"><Award className="h-3.5 w-3.5" />Achievements</h4>
                  <div className="mt-2 space-y-1">
                    {profile.achievements.map((a, i) => (
                      <p key={i} className="text-sm text-ink-700">{a}</p>
                    ))}
                  </div>
                </div>
              )}

              {(!profile?.education?.length && !profile?.experience?.length && !profile?.skills?.length && !profile?.projects?.length && !profile?.certifications?.length && !profile?.achievements?.length) && (
                <div className="mt-4">
                  <EmptyState icon={<FileText className="h-6 w-6" />} title="Resume is empty" description="Add education, skills, experience, and projects to your profile to build your resume." />
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
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

          <Card>
            <CardHeader title="Profile Completeness" />
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#16a34a" strokeWidth="6" strokeDasharray={`${(profileCompleteness(profile) / 100) * 176} 176`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-800">{profileCompleteness(profile)}%</span>
              </div>
              <div className="space-y-1 text-xs text-ink-500">
                <p>Complete your profile to improve visibility</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function profileCompleteness(p: StudentProfile | null): number {
  if (!p) return 0;
  let filled = 0;
  const total = 8;
  if (p.bio) filled++;
  if (p.skills?.length) filled++;
  if (p.education?.length) filled++;
  if (p.experience?.length) filled++;
  if (p.projects?.length) filled++;
  if (p.certifications?.length) filled++;
  if (p.achievements?.length) filled++;
  if (p.resumeUrl) filled++;
  return Math.round((filled / total) * 100);
}
