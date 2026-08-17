import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Briefcase, Users, CircleCheck as CheckCircle2, Bookmark, Share2, ExternalLink, Calendar, DollarSign } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { SkillTags } from '@/components/shared/SkillTags';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { opportunityService } from '@/services/opportunityService';
import { applicationService } from '@/services/applicationService';
import { studentService } from '@/services/studentService';
import type { Opportunity } from '@/lib/types';
import { daysLeft, timeAgo } from '@/lib/utils';

const typeTones: Record<string, 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple'> = {
  Internship: 'brand', Job: 'success', Freelancing: 'accent', Research: 'purple', Competition: 'warning', Scholarship: 'danger', 'Part-time': 'neutral',
};

export default function OpportunityDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applyOpen, setApplyOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [togglingSave, setTogglingSave] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    opportunityService.getById(id).then((o) => {
      setOpportunity(o);
      setLoading(false);
      studentService.getSavedOpportunities().then((savedIds) => {
        setSaved(savedIds.some((sid: string) => sid === id));
      }).catch(() => {});
      applicationService.getApplications().then((apps) => {
        setApplied(apps.some((a) => a.opportunityId === id));
      }).catch(() => {});
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <PageContainer><div className="py-20 text-center text-sm text-ink-400">Loading opportunity…</div></PageContainer>;

  if (!opportunity) {
    return (
      <PageContainer>
        <div className="card"><EmptyState icon={<Briefcase className="h-7 w-7" />} title="Opportunity not found" description="This opportunity may have been removed or is no longer available." action={<Link to="/student/opportunities"><Button>Back to opportunities</Button></Link>} /></div>
      </PageContainer>
    );
  }

  const tone = typeTones[opportunity.type] ?? 'neutral';

  const submitApplication = () => {
    if (!id) return;
    setApplying(true);
    applicationService.apply(id, { coverLetter }).then(() => {
      setApplied(true);
      setApplying(false);
      setApplyOpen(false);
      setCoverLetter('');
      toast({ title: 'Application submitted!', description: `${opportunity.company} will review your application.`, variant: 'success' });
    }).catch(() => {
      setApplying(false);
      toast({ title: 'Failed to submit application', variant: 'error' });
    });
  };

  const toggleSave = () => {
    if (!id) return;
    setTogglingSave(true);
    if (saved) {
      studentService.unsaveOpportunity(id).then(() => {
        setSaved(false);
        setTogglingSave(false);
        toast({ title: 'Removed from saved', variant: 'info' });
      }).catch(() => setTogglingSave(false));
    } else {
      studentService.saveOpportunity(id).then(() => {
        setSaved(true);
        setTogglingSave(false);
        toast({ title: 'Saved!', variant: 'success' });
      }).catch(() => setTogglingSave(false));
    }
  };

  return (
    <PageContainer>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
        <ArrowLeft className="h-4 w-4" />Back
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <Avatar name={opportunity.company} size="lg" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={tone}>{opportunity.type}</Badge>
                  {opportunity.remote && <Badge tone="neutral">Remote</Badge>}
                  <span className="text-xs text-ink-400">· {timeAgo(opportunity.postedAt)}</span>
                </div>
                <h1 className="mt-2 font-display text-2xl font-bold text-ink-800">{opportunity.title}</h1>
                <p className="mt-1 text-sm text-ink-500">{opportunity.company} · {opportunity.location}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoBox icon={<Briefcase className="h-4 w-4" />} label="Experience" value={opportunity.experience} />
              <InfoBox icon={<DollarSign className="h-4 w-4" />} label="Salary" value={opportunity.stipend || opportunity.salary} />
              <InfoBox icon={<Users className="h-4 w-4" />} label="Applicants" value={`${opportunity.applicants}`} />
              <InfoBox icon={<Calendar className="h-4 w-4" />} label="Deadline" value={`${daysLeft(opportunity.deadline)} days`} />
            </div>

            <div className="mt-6 border-t border-ink-100 pt-6">
              <h3 className="text-base font-semibold text-ink-800">About the role</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{opportunity.description}</p>
            </div>

            {opportunity.responsibilities.length > 0 && (
              <div className="mt-6 border-t border-ink-100 pt-6">
                <h3 className="text-base font-semibold text-ink-800">Responsibilities</h3>
                <ul className="mt-3 space-y-2">
                  {opportunity.responsibilities.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-sm text-ink-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {opportunity.requirements.length > 0 && (
              <div className="mt-6 border-t border-ink-100 pt-6">
                <h3 className="text-base font-semibold text-ink-800">Requirements</h3>
                <ul className="mt-3 space-y-2">
                  {opportunity.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-sm text-ink-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {opportunity.skills.length > 0 && (
              <div className="mt-6 border-t border-ink-100 pt-6">
                <h3 className="mb-3 text-base font-semibold text-ink-800">Required Skills</h3>
                <SkillTags skills={opportunity.skills} />
              </div>
            )}

            {opportunity.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {opportunity.tags.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card sticky top-20 p-5">
            <h3 className="text-base font-semibold text-ink-800">Apply now</h3>
            <p className="mt-1 text-sm text-ink-500">{daysLeft(opportunity.deadline)} days left to apply</p>
            <div className="mt-4 space-y-2">
              {applied ? (
                <Button className="w-full" variant="success" disabled><CheckCircle2 className="h-4 w-4" />Application submitted</Button>
              ) : (
                <Button className="w-full" onClick={() => setApplyOpen(true)}>Apply Now</Button>
              )}
              <Button variant="outline" className="w-full" onClick={toggleSave} disabled={togglingSave}>
                <Bookmark className={`h-4 w-4 ${saved ? 'fill-brand-600 text-brand-600' : ''}`} />{saved ? 'Saved' : 'Save for later'}
              </Button>
              <Button variant="ghost" className="w-full"><Share2 className="h-4 w-4" />Share</Button>
            </div>
            <div className="mt-4 rounded-xl bg-ink-50 p-3 text-xs text-ink-500">
              <p className="font-medium text-ink-600">{opportunity.openings} openings</p>
              <p className="mt-1">{opportunity.applicants} applicants so far</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-base font-semibold text-ink-800">Company</h3>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={opportunity.company} size="md" />
              <div>
                <p className="flex items-center gap-1 text-sm font-semibold text-ink-800">{opportunity.company}<CheckCircle2 className="h-3.5 w-3.5 text-brand-500" /></p>
                <p className="text-xs text-ink-400">Verified company</p>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-sm text-ink-500">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{opportunity.location}</p>
              <Link to={`/student/companies/${opportunity.companyId}`} className="flex items-center gap-2 text-brand-600 hover:underline"><ExternalLink className="h-4 w-4" />View company profile</Link>
            </div>
          </div>
        </div>
      </div>

      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Apply to this opportunity" description={`${opportunity.title} at ${opportunity.company}`} size="md"
        footer={<><Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button><Button onClick={submitApplication} disabled={applying}>{applying ? 'Submitting…' : 'Submit Application'}</Button></>}>
        <div className="space-y-4">
          <div className="rounded-xl bg-brand-50 p-4">
            <p className="text-sm font-medium text-brand-700">Your profile will be shared</p>
            <p className="mt-1 text-xs text-brand-600">The company will see your name, profile, resume, and skills. Make sure your profile is up to date.</p>
          </div>
          <div className="rounded-xl border border-ink-100 p-4">
            <p className="text-sm font-semibold text-ink-800">Resume</p>
            <p className="mt-1 text-xs text-ink-500">Your latest resume will be attached automatically.</p>
          </div>
          <div>
            <label className="label">Cover letter (optional)</label>
            <textarea className="input min-h-[120px] resize-y" placeholder="Tell the company why you're a great fit…" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}

function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 p-3">
      <div className="flex items-center gap-1.5 text-ink-400">{icon}<span className="text-xs">{label}</span></div>
      <p className="mt-1 text-sm font-semibold text-ink-700">{value}</p>
    </div>
  );
}
