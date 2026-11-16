import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Upload, Github, Linkedin, Globe, GraduationCap, Briefcase, FileText, User, Trash2, Facebook, Plus } from 'lucide-react';
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
import { PostFeed } from '@/components/shared/PostFeed';
import { api } from '@/api/axios';
import type { StudentProfile } from '@/lib/types';

export default function StudentProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusPostId = searchParams.get('postId') || undefined;
  const editSection = searchParams.get('editSection');
  const { user } = useAuth();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionEditor, setSectionEditor] = useState<{ section: 'education' | 'experience'; index: number | null } | null>(null);
  const [educationDraft, setEducationDraft] = useState({ institution: '', degree: '', field: '', startYear: '', endYear: '', grade: '' });
  const [experienceDraft, setExperienceDraft] = useState({ company: '', position: '', startDate: '', endDate: '', description: '' });
  const [editForm, setEditForm] = useState({ bio: '', phone: '', skills: '', linkedin: '', github: '', facebook: '', portfolio: '', website: '' });
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const skillsFieldRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const openResume = async () => {
    if (!profile?.resumeUrl) return;
    const [, folder, filename] = profile.resumeUrl.split('/').filter(Boolean);
    const response = await api.get(`/files/${folder}/${filename}`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const uploadResume = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await studentService.uploadResume(file);
      setProfile((current) => current ? { ...current, resumeUrl: result.resumeUrl } : current);
      toast({ title: 'Resume uploaded', variant: 'success' });
    } catch {
      toast({ title: 'Resume upload failed', variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    studentService.getProfile().then((p) => {
      setProfile(p);
      if (p) {
        setEditForm({
          bio: p.bio,
          phone: p.phone,
          skills: p.skills.map((s) => s.name).join(', '),
          linkedin: p.social.linkedin || '',
          github: p.social.github || '',
          facebook: p.social.facebook || '',
          portfolio: p.social.portfolio || '',
          website: p.social.website || '',
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && editSection === 'skills') setEditOpen(true);
  }, [editSection, loading]);

  useEffect(() => {
    if (!editOpen || editSection !== 'skills') return;
    const frame = window.requestAnimationFrame(() => {
      skillsFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('student-profile-skills')?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [editOpen, editSection]);

  const openSkillsEditor = () => {
    const next = new URLSearchParams(searchParams);
    next.set('editSection', 'skills');
    setSearchParams(next, { replace: true });
    setEditOpen(true);
  };

  const closeEditor = () => {
    setEditOpen(false);
    if (searchParams.has('editSection')) {
      const next = new URLSearchParams(searchParams);
      next.delete('editSection');
      setSearchParams(next, { replace: true });
    }
  };

  const handleSave = () => {
    setSaving(true);
    const skills = editForm.skills.split(',').map((s) => s.trim()).filter(Boolean);
    studentService.updateProfile({
      bio: editForm.bio,
      phone: editForm.phone,
      skills,
      socialLinks: {
        linkedin: editForm.linkedin,
        github: editForm.github,
        facebook: editForm.facebook,
        portfolio: editForm.portfolio,
        website: editForm.website,
      },
    }).then((p) => {
      setProfile(p);
      setSaving(false);
      closeEditor();
      toast({ title: 'Profile updated', variant: 'success' });
    }).catch(() => {
      setSaving(false);
      toast({ title: 'Failed to update profile', variant: 'error' });
    });
  };

  const openEducationEditor = (index: number | null = null) => {
    const education = index === null ? null : profile?.education[index];
    setEducationDraft({
      institution: education?.institution || '',
      degree: education?.degree || '',
      field: education?.field || '',
      startYear: education?.start || '',
      endYear: education?.end || '',
      grade: education?.grade || '',
    });
    setSectionEditor({ section: 'education', index });
  };

  const openExperienceEditor = (index: number | null = null) => {
    const experience = index === null ? null : profile?.experience[index];
    setExperienceDraft({
      company: experience?.company || '',
      position: experience?.role || '',
      startDate: experience?.start || '',
      endDate: experience?.end || '',
      description: experience?.description || '',
    });
    setSectionEditor({ section: 'experience', index });
  };

  const saveSection = async () => {
    if (!profile || !sectionEditor) return;
    if (sectionEditor.section === 'education') {
      if (!educationDraft.institution.trim() || !educationDraft.degree.trim()) {
        toast({ title: 'Institution and degree are required', variant: 'error' });
        return;
      }
      const education = profile.education.map((item) => ({
        institution: item.institution,
        degree: item.degree,
        field: item.field,
        startYear: item.start,
        endYear: item.end,
        grade: item.grade,
      }));
      const entry = {
        institution: educationDraft.institution.trim(),
        degree: educationDraft.degree.trim(),
        field: educationDraft.field.trim(),
        startYear: educationDraft.startYear.trim(),
        endYear: educationDraft.endYear.trim(),
        grade: educationDraft.grade.trim(),
      };
      if (sectionEditor.index === null) education.push(entry);
      else education[sectionEditor.index] = entry;

      setSaving(true);
      try {
        setProfile(await studentService.updateProfile({ education }));
        setSectionEditor(null);
        toast({ title: 'Education saved', variant: 'success' });
      } catch {
        toast({ title: 'Could not save education', variant: 'error' });
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!experienceDraft.company.trim() || !experienceDraft.position.trim()) {
      toast({ title: 'Company and role are required', variant: 'error' });
      return;
    }
    const experience = profile.experience.map((item) => ({
      company: item.company,
      position: item.role,
      startDate: item.start,
      endDate: item.end,
      description: item.description,
    }));
    const entry = {
      company: experienceDraft.company.trim(),
      position: experienceDraft.position.trim(),
      startDate: experienceDraft.startDate.trim(),
      endDate: experienceDraft.endDate.trim(),
      description: experienceDraft.description.trim(),
    };
    if (sectionEditor.index === null) experience.push(entry);
    else experience[sectionEditor.index] = entry;

    setSaving(true);
    try {
      setProfile(await studentService.updateProfile({ experience }));
      setSectionEditor(null);
      toast({ title: 'Experience saved', variant: 'success' });
    } catch {
      toast({ title: 'Could not save experience', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const deleteSectionEntry = async (section: 'education' | 'experience', index: number) => {
    if (!profile) return;
    setSaving(true);
    try {
      if (section === 'education') {
        const education = profile.education
          .filter((_, itemIndex) => itemIndex !== index)
          .map((item) => ({
            institution: item.institution,
            degree: item.degree,
            field: item.field,
            startYear: item.start,
            endYear: item.end,
            grade: item.grade,
          }));
        setProfile(await studentService.updateProfile({ education }));
      } else {
        const experience = profile.experience
          .filter((_, itemIndex) => itemIndex !== index)
          .map((item) => ({
            company: item.company,
            position: item.role,
            startDate: item.start,
            endDate: item.end,
            description: item.description,
          }));
        setProfile(await studentService.updateProfile({ experience }));
      }
      toast({ title: `${section === 'education' ? 'Education' : 'Experience'} removed`, variant: 'success' });
    } catch {
      toast({ title: `Could not remove ${section}`, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const result = await studentService.uploadAvatar(file);
      setProfile((current) => current ? { ...current, avatar: result.avatarUrl } : current);
      toast({ title: 'Profile picture updated', variant: 'success' });
    } catch {
      toast({ title: 'Could not upload profile picture', variant: 'error' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const deleteAvatar = async () => {
    try {
      await studentService.deleteAvatar();
      setProfile((current) => current ? { ...current, avatar: '' } : current);
      toast({ title: 'Profile picture removed', variant: 'success' });
    } catch {
      toast({ title: 'Could not remove profile picture', variant: 'error' });
    }
  };

  const deleteResume = async () => {
    try {
      await studentService.deleteResume();
      setProfile((current) => current ? { ...current, resumeUrl: '' } : current);
      toast({ title: 'Resume removed', variant: 'success' });
    } catch {
      toast({ title: 'Could not remove resume', variant: 'error' });
    }
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
            <Avatar name={profile?.name ?? user?.name ?? 'User'} src={profile?.avatar} size="xl" ring />
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
            <CardHeader title="Resume" subtitle="Your latest CV attached to applications" action={<><input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(event) => uploadResume(event.target.files?.[0])} /><Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}><Upload className="h-3.5 w-3.5" />{uploading ? 'Uploading…' : 'Upload'}</Button></>} />
            {profile?.resumeUrl ? (
              <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><FileText className="h-6 w-6" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-800">My Resume</p>
                  <p className="text-xs text-ink-400">{profile.resumeUrl}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openResume().catch(() => toast({ title: 'Could not open resume', variant: 'error' }))}>View</Button>
                <Button variant="ghost" size="sm" onClick={deleteResume}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
              </div>
            ) : (
              <EmptyState icon={<FileText className="h-6 w-6" />} title="No resume uploaded" description="Upload your CV to include it with opportunity applications." action={<Button size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-3.5 w-3.5" />Upload Resume</Button>} />
            )}
          </Card>

          <Card>
            <CardHeader title="Education" action={<Button variant="outline" size="sm" onClick={() => openEducationEditor()}><Plus className="h-3.5 w-3.5" />Add</Button>} />
            {profile?.education && profile.education.length > 0 ? (
              <div className="space-y-3">
                {profile.education.map((e, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink-800">{e.institution}</p>
                      <p className="text-xs text-ink-500">{e.degree}{e.field && `, ${e.field}`}</p>
                      <p className="text-xs text-ink-400">{e.start}{e.end && ` — ${e.end}`}</p>
                      {e.grade && <p className="mt-1 text-xs text-ink-500">Grade: {e.grade}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEducationEditor(i)} aria-label={`Edit ${e.institution}`}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteSectionEntry('education', i)} disabled={saving} aria-label={`Delete ${e.institution}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<GraduationCap className="h-6 w-6" />} title="No education records" description="Add your educational background." action={<Button size="sm" onClick={() => openEducationEditor()}><Plus className="h-3.5 w-3.5" />Add education</Button>} />
            )}
          </Card>

          <Card>
            <CardHeader title="Experience" action={<Button variant="outline" size="sm" onClick={() => openExperienceEditor()}><Plus className="h-3.5 w-3.5" />Add</Button>} />
            {profile?.experience && profile.experience.length > 0 ? (
              <div className="space-y-3">
                {profile.experience.map((e, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink-800">{e.role}</p>
                      <p className="text-xs text-ink-500">{e.company}</p>
                      <p className="text-xs text-ink-400">{e.start}{e.end && ` — ${e.end}`}</p>
                      {e.description && <p className="mt-1 text-xs text-ink-600">{e.description}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openExperienceEditor(i)} aria-label={`Edit ${e.role}`}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteSectionEntry('experience', i)} disabled={saving} aria-label={`Delete ${e.role}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Briefcase className="h-6 w-6" />} title="No experience added" description="Add your work or internship experience." action={<Button size="sm" onClick={() => openExperienceEditor()}><Plus className="h-3.5 w-3.5" />Add experience</Button>} />
            )}
          </Card>

          {user && (
            <PostFeed
              myId={user.id}
              myRole="student"
              authorId={user.id}
              authorType="student"
              canCreate
              focusPostId={focusPostId}
            />
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Skills" action={<Button variant="outline" size="sm" onClick={openSkillsEditor}><Plus className="h-3.5 w-3.5" />Add</Button>} />
            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s, i) => (
                  <Badge key={i} tone="brand">{s.name}</Badge>
                ))}
              </div>
            ) : (
              <EmptyState icon={<User className="h-6 w-6" />} title="No skills added" description="Add your skills to receive relevant opportunity recommendations." />
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
            <div className="space-y-2 text-sm">
              <a href={profile?.social.linkedin || '#'} target="_blank" rel="noreferrer" className={`flex items-center gap-2 ${profile?.social.linkedin ? 'text-brand-700 hover:underline' : 'pointer-events-none text-ink-400'}`}><Linkedin className="h-4 w-4" />{profile?.social.linkedin || 'No LinkedIn added'}</a>
              <a href={profile?.social.github || '#'} target="_blank" rel="noreferrer" className={`flex items-center gap-2 ${profile?.social.github ? 'text-brand-700 hover:underline' : 'pointer-events-none text-ink-400'}`}><Github className="h-4 w-4" />{profile?.social.github || 'No GitHub added'}</a>
              <a href={profile?.social.facebook || '#'} target="_blank" rel="noreferrer" className={`flex items-center gap-2 ${profile?.social.facebook ? 'text-brand-700 hover:underline' : 'pointer-events-none text-ink-400'}`}><Facebook className="h-4 w-4" />{profile?.social.facebook || 'No Facebook added'}</a>
              <a href={profile?.social.portfolio || profile?.social.website || '#'} target="_blank" rel="noreferrer" className={`flex items-center gap-2 ${(profile?.social.portfolio || profile?.social.website) ? 'text-brand-700 hover:underline' : 'pointer-events-none text-ink-400'}`}><Globe className="h-4 w-4" />{profile?.social.portfolio || profile?.social.website || 'No website added'}</a>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={editOpen} onClose={closeEditor} title="Edit profile" size="lg"
        footer={<><Button variant="outline" onClick={closeEditor}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button></>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={profile?.name ?? user?.name ?? 'U'} src={profile?.avatar} size="xl" />
            <div>
              <input ref={avatarRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(event) => uploadAvatar(event.target.files?.[0])} />
              <div className="flex gap-2">
                {profile?.avatar?.trim() ? <Button variant="outline" size="sm" onClick={deleteAvatar}><Trash2 className="h-3.5 w-3.5" />Delete</Button> : <Button variant="outline" size="sm" onClick={() => avatarRef.current?.click()} disabled={avatarUploading}><Upload className="h-3.5 w-3.5" />{avatarUploading ? 'Uploading…' : 'Upload photo'}</Button>}
              </div>
              <p className="mt-1.5 text-xs text-ink-400">JPG, PNG, or WEBP</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name"><Input defaultValue={profile?.name ?? user?.name} disabled /></Field>
            <Field label="Email"><Input defaultValue={profile?.email ?? user?.email} disabled /></Field>
            <Field label="Department"><Input defaultValue={profile?.department} disabled /></Field>
            <Field label="Batch"><Input defaultValue={profile?.batch} disabled /></Field>
            <Field label="Phone"><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></Field>
          </div>
          <div ref={skillsFieldRef}>
            <Field label="Skills (comma-separated)">
              <Input id="student-profile-skills" value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} placeholder="React, Node.js, Python" />
            </Field>
          </div>
          <Field label="Bio"><Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell recruiters about yourself…" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="LinkedIn URL"><Input value={editForm.linkedin} onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" /></Field>
            <Field label="GitHub URL"><Input value={editForm.github} onChange={(e) => setEditForm({ ...editForm, github: e.target.value })} placeholder="https://github.com/username" /></Field>
            <Field label="Facebook URL"><Input value={editForm.facebook} onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })} placeholder="https://facebook.com/username" /></Field>
            <Field label="Portfolio URL"><Input value={editForm.portfolio} onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })} placeholder="https://your-portfolio.com" /></Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={sectionEditor !== null}
        onClose={() => setSectionEditor(null)}
        title={`${sectionEditor?.index === null ? 'Add' : 'Edit'} ${sectionEditor?.section === 'education' ? 'education' : 'experience'}`}
        size="md"
        footer={<><Button variant="outline" onClick={() => setSectionEditor(null)}>Cancel</Button><Button onClick={saveSection} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button></>}
      >
        {sectionEditor?.section === 'education' ? (
          <div className="space-y-4">
            <Field label="Institution *"><Input autoFocus value={educationDraft.institution} onChange={(event) => setEducationDraft({ ...educationDraft, institution: event.target.value })} /></Field>
            <Field label="Degree *"><Input value={educationDraft.degree} onChange={(event) => setEducationDraft({ ...educationDraft, degree: event.target.value })} /></Field>
            <Field label="Field of study"><Input value={educationDraft.field} onChange={(event) => setEducationDraft({ ...educationDraft, field: event.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start year"><Input value={educationDraft.startYear} onChange={(event) => setEducationDraft({ ...educationDraft, startYear: event.target.value })} /></Field>
              <Field label="End year"><Input value={educationDraft.endYear} onChange={(event) => setEducationDraft({ ...educationDraft, endYear: event.target.value })} /></Field>
            </div>
            <Field label="Grade"><Input value={educationDraft.grade} onChange={(event) => setEducationDraft({ ...educationDraft, grade: event.target.value })} /></Field>
          </div>
        ) : sectionEditor?.section === 'experience' ? (
          <div className="space-y-4">
            <Field label="Company *"><Input autoFocus value={experienceDraft.company} onChange={(event) => setExperienceDraft({ ...experienceDraft, company: event.target.value })} /></Field>
            <Field label="Role *"><Input value={experienceDraft.position} onChange={(event) => setExperienceDraft({ ...experienceDraft, position: event.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date"><Input value={experienceDraft.startDate} onChange={(event) => setExperienceDraft({ ...experienceDraft, startDate: event.target.value })} /></Field>
              <Field label="End date"><Input value={experienceDraft.endDate} onChange={(event) => setExperienceDraft({ ...experienceDraft, endDate: event.target.value })} /></Field>
            </div>
            <Field label="Description"><Textarea value={experienceDraft.description} onChange={(event) => setExperienceDraft({ ...experienceDraft, description: event.target.value })} /></Field>
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  );
}
