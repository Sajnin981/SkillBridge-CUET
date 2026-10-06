import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MessageSquare, UserRound, Building2 } from 'lucide-react';
import { MessagingView } from '@/components/shared/MessagingView';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { messageService } from '@/services/messageService';
import { searchService } from '@/services/searchService';
import { normalizeError } from '@/api/axios';
import type { BackendCompany, BackendStudent } from '@/api/types';

interface Conversation { id: string; name: string; avatar: string; participantPath?: string; role: string; last: string; time: string; unread: number; online: boolean }
interface Message { id: string; from: 'me' | 'them'; text: string; time: string }

export default function AdminMessagingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>({});
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<BackendStudent[]>([]);
  const [companies, setCompanies] = useState<BackendCompany[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const items = await messageService.getConversations('admin');
    const messageMap: Record<string, Message[]> = {};
    await Promise.all(items.map(async (item) => { messageMap[item.id] = await messageService.getMessages(item.id, user.role, user.id); }));
    setConversations(items as Conversation[]);
    setMessagesByConv(messageMap);
  }, [user]);

  useEffect(() => { loadConversations().catch(() => undefined).finally(() => setLoading(false)); }, [loadConversations]);

  useEffect(() => {
    if (query.trim().length < 2) { setStudents([]); setCompanies([]); return; }
    searchService.search(query).then((result) => { setStudents(result.students); setCompanies(result.companies); }).catch(() => undefined);
  }, [query]);

  const start = async (target: { studentId?: string; companyId?: string }) => {
    try {
      const conversation = await messageService.startConversation(target);
      // Reload conversations into state so the new/existing thread is selectable.
      await loadConversations();
      setQuery('');
      // Use React Router navigate so MessagingView receives the updated
      // initialConversationId and selects the correct thread.
      navigate(`/admin/messages?conversationId=${conversation._id}`);
    } catch (err) {
      toast({ title: 'Could not start conversation', description: normalizeError(err).message, variant: 'error' });
    }
  };

  const handleSendMessage = async (conversationId: string, text: string) => { await messageService.sendMessage(conversationId, text); };

  if (loading) return <div className="py-20 text-center text-sm text-ink-400">Loading messages…</div>;

  return (
    <MessagingView
      title="Messages"
      emptyTitle="No admin conversations yet"
      emptyDescription="Search for a student or company above to start a conversation."
      conversations={conversations}
      messagesByConv={messagesByConv}
      onSendMessage={handleSendMessage}
      initialConversationId={conversationId}
      headerAction={<MessageSquare className="h-5 w-5 text-brand-600" />}
      topContent={<div className="mb-5 card p-4"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Search a student or company to message" /></div>{(students.length > 0 || companies.length > 0) && <div className="mt-3 space-y-1">{students.map((student) => <button key={student._id} onClick={() => start({ studentId: student._id })} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-ink-50"><UserRound className="h-4 w-4 text-brand-600" /><span className="text-sm text-ink-700">{student.fullName}</span><span className="ml-auto text-xs text-ink-400">Student</span></button>)}{companies.map((company) => <button key={company._id} onClick={() => start({ companyId: company._id })} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-ink-50"><Building2 className="h-4 w-4 text-brand-600" /><span className="text-sm text-ink-700">{company.companyName}</span><span className="ml-auto text-xs text-ink-400">Company</span></button>)}</div>}</div>}
    />
  );
}