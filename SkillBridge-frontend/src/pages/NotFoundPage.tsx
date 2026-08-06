import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600"><Compass className="h-10 w-10" /></div>
      <p className="mt-8 font-display text-7xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-800">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/"><Button><Home className="h-4 w-4" />Go Home</Button></Link>
        <Link to="/opportunities"><Button variant="outline"><ArrowLeft className="h-4 w-4" />Browse Opportunities</Button></Link>
      </div>
    </div>
  );
}
