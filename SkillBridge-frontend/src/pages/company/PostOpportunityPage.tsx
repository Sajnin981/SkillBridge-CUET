import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowLeft, MapPin, DollarSign, Calendar, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import type { OpportunityType } from '@/lib/types';

const types: OpportunityType[] = ['Internship', 'Job', 'Freelancing', 'Research', 'Competition', 'Scholarship', 'Part-time'];

export default function PostOpportunityPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript']);
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => { if (skillInput.trim() && !skills.includes(skillInput.trim())) { setSkills([...skills, skillInput.trim()]); setSkillInput(''); } };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Opportunity posted!', description: 'It is now live for students to apply.', variant: 'success' });
    navigate('/company/opportunities');
  };

  return (
    <PageContainer>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
        <ArrowLeft className="h-4 w-4" />Back
      </button>
      <h2 className="mb-6 font-display text-2xl font-bold text-ink-800">Post a New Opportunity</h2>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Basic Information" subtitle="The essentials about this role" />
            <div className="space-y-4">
              <Field label="Job Title"><Input required placeholder="e.g. Frontend Engineer Intern" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Opportunity Type"><Select required defaultValue=""><option value="" disabled>Select type</option>{types.map((t) => <option key={t}>{t}</option>)}</Select></Field>
                <Field label="Category"><Select defaultValue=""><option value="" disabled>Select category</option><option>Engineering</option><option>Design</option><option>Data</option><option>AI/ML</option><option>Marketing</option><option>Security</option></Select></Field>
              </div>
              <Field label="Description"><Textarea required placeholder="Describe the role, what the candidate will do, and what makes it exciting…" className="min-h-[140px]" /></Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Requirements" subtitle="What you're looking for" />
            <div className="space-y-4">
              <Field label="Responsibilities (one per line)"><Textarea placeholder="Build and maintain React components&#10;Collaborate with designers" className="min-h-[100px]" /></Field>
              <Field label="Requirements (one per line)"><Textarea placeholder="Strong React fundamentals&#10;Familiarity with TypeScript" className="min-h-[100px]" /></Field>
              <Field label="Required Skills">
                <div className="flex gap-2">
                  <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Type a skill and press Enter" />
                  <Button type="button" variant="outline" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {skills.map((s) => <button key={s} type="button" onClick={() => removeSkill(s)} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">{s}<X className="h-3 w-3" /></button>)}
                </div>
              </Field>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Details" />
            <div className="space-y-4">
              <Field label="Location" icon={<MapPin className="h-4 w-4" />}><Input placeholder="Dhaka, BD" className="pl-10" /></Field>
              <label className="flex items-center gap-2 text-sm text-ink-600"><input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />Remote friendly</label>
              <Field label="Salary / Stipend" icon={<DollarSign className="h-4 w-4" />}><Input placeholder="BDT 15,000/mo" className="pl-10" /></Field>
              <Field label="Experience Required"><Select defaultValue="0-1 yrs"><option>0-1 yrs</option><option>1-2 yrs</option><option>1-3 yrs</option><option>2+ yrs</option><option>Any</option></Select></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Openings" icon={<Users className="h-4 w-4" />}><Input type="number" defaultValue={1} className="pl-10" /></Field>
                <Field label="Deadline" icon={<Calendar className="h-4 w-4" />}><Input type="date" className="pl-10" /></Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Tags" subtitle="Add perks or highlights" />
            <Input placeholder="e.g. Remote, Mentorship" />
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" className="flex-1">Post Opportunity</Button>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
