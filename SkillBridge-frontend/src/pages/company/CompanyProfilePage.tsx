import { useState } from 'react';
import { MapPin, Globe, Users, Calendar, CheckCircle2, Pencil, Upload, Briefcase, Building2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <PageContainer>
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-700 to-brand-600" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end justify-between">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-brand-600 shadow-card ring-4 ring-white">{user?.avatar ?? 'CO'}</div>
            <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" />Edit Profile</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-ink-800">{user?.name ?? 'Company'}</h2>
            <Badge tone="success"><CheckCircle2 className="h-3 w-3" />Verified</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">{user?.email}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Verification Status" />
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-success-600"><CheckCircle2 className="h-7 w-7" /></div>
            <p className="mt-3 text-sm font-semibold text-ink-800">Verified Company</p>
            <p className="mt-1 text-xs text-ink-400">You can post opportunities and recruit students</p>
          </div>
        </Card>
        <Card>
          <CardHeader title="Hiring Stats" />
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-brand-50 p-4 text-center"><p className="text-2xl font-bold text-brand-600">0</p><p className="text-xs text-ink-400">Open roles</p></div>
            <div className="rounded-xl bg-accent-50 p-4 text-center"><p className="text-2xl font-bold text-accent-600">0</p><p className="text-xs text-ink-400">Total hires</p></div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Profile Completeness" />
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#16a34a" strokeWidth="6" strokeDasharray={`${0.3 * 176} 176`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-800">30%</span>
            </div>
            <div className="space-y-1 text-xs text-ink-500">
              <p>Add company description</p>
              <p>Add industry & size</p>
              <p>Upload company logo</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="About" />
        <EmptyState icon={<Building2 className="h-6 w-6" />} title="No company description" description="Add your company description to help students learn about you." action={<Button size="sm" onClick={() => setEditOpen(true)}><Pencil className="h-3.5 w-3.5" />Edit Profile</Button>} />
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Company Profile" size="lg"
        footer={<><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={() => { setEditOpen(false); toast({ title: 'Company profile updated', variant: 'success' }); }}>Save changes</Button></>}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-600">{user?.avatar ?? 'CO'}</div>
            <div><Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5" />Upload logo</Button><p className="mt-1.5 text-xs text-ink-400">Square image, max 1MB</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company Name"><Input defaultValue={user?.name} /></Field>
            <Field label="Industry"><Select><option>Software</option><option>Finance</option><option>HealthTech</option><option>Logistics</option></Select></Field>
            <Field label="Website"><Input placeholder="company.com" /></Field>
            <Field label="Location"><Input placeholder="Dhaka, BD" /></Field>
            <Field label="Company Size"><Select><option>1-50</option><option>50-200</option><option>200-500</option><option>500-1000</option><option>1000+</option></Select></Field>
            <Field label="Founded"><Input placeholder="2015" /></Field>
          </div>
          <Field label="About"><Textarea placeholder="Describe your company…" /></Field>
        </div>
      </Modal>
    </PageContainer>
  );
}
