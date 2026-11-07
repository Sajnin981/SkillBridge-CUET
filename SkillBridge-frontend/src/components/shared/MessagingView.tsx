import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Search, ArrowLeft, MessageSquare } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  participantPath?: string;
  role: string;
  last: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
}

interface MessagingViewProps {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  conversations: Conversation[];
  messagesByConv: Record<string, Message[]>;
  onSendMessage?: (conversationId: string, text: string) => Promise<void>;
  initialConversationId?: string | null;
  headerAction?: React.ReactNode;
  topContent?: React.ReactNode;
}

export function MessagingView({ title, emptyTitle, emptyDescription, conversations, messagesByConv, onSendMessage, initialConversationId, headerAction, topContent }: MessagingViewProps) {
  const [activeId, setActiveId] = useState<string | null>(initialConversationId && conversations.some((c) => c.id === initialConversationId) ? initialConversationId : conversations[0]?.id ?? null);
  const [messages, setMessages] = useState<Message[]>(activeId ? messagesByConv[activeId] ?? [] : []);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [mobileChat, setMobileChat] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  useEffect(() => {
    if (initialConversationId && conversations.some((c) => c.id === initialConversationId)) {
      setActiveId(initialConversationId);
    }
  }, [initialConversationId, conversations]);

  useEffect(() => {
    if (activeId) setMessages(messagesByConv[activeId] ?? []);
  }, [activeId, messagesByConv]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const active = conversations.find((c) => c.id === activeId);

  const filteredConvs = conversations.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase())
  );

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !activeId) return;
    setInput('');
    setMessages((prev) => [...prev, { id: Math.random().toString(36).slice(2), from: 'me', text, time: 'Now' }]);
    if (onSendMessage) {
      try {
        await onSendMessage(activeId, text);
      } catch {
        // Handled in parent
      }
    }
  };

  if (conversations.length === 0) {
    return (
      <PageContainer className="max-w-none">
        {topContent}
        <div className="mb-6 flex items-center justify-between gap-3"><h2 className="font-display text-2xl font-bold text-ink-800">{title}</h2>{headerAction}</div>
        <div className="card">
          <EmptyState icon={<MessageSquare className="h-7 w-7" />} title={emptyTitle} description={emptyDescription} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-none">
      {topContent}
      <div className="mb-6 flex items-center justify-between gap-3"><h2 className="font-display text-2xl font-bold text-ink-800">{title}</h2>{headerAction}</div>
      <div className="card grid h-[600px] min-w-0 grid-cols-1 overflow-hidden p-0 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Conversation list */}
        <div className={cn('min-h-0 min-w-0 flex-col border-r border-ink-100', mobileChat ? 'hidden lg:flex' : 'flex')}>
          <div className="shrink-0 border-b border-ink-100 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" placeholder="Search conversations…" />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
            {filteredConvs.map((c) => (
              <button key={c.id} onClick={() => { setActiveId(c.id); setMobileChat(true); }} className={cn('flex w-full min-w-0 items-center gap-3 border-b border-ink-50 px-4 py-3.5 text-left transition hover:bg-ink-50', activeId === c.id && 'bg-brand-50')}>
                <div className="relative shrink-0">
                  <Avatar name={c.name} src={c.avatar} size="md" />
                  {c.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success-500 ring-2 ring-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-800">{c.name}</p>
                  <p className="truncate text-xs text-ink-500">{c.last}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="whitespace-nowrap text-xs text-ink-400">{c.time}</span>
                  {c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">{c.unread}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className={cn('min-h-0 min-w-0 flex-col', mobileChat ? 'flex' : 'hidden lg:flex')}>
          {active && (
            <>
              <div className="flex shrink-0 items-center gap-3 border-b border-ink-100 p-4">
                <button onClick={() => setMobileChat(false)} className="rounded-lg p-1 text-ink-400 lg:hidden"><ArrowLeft className="h-5 w-5" /></button>
                <div className="relative">
                  {active.participantPath ? <Link to={active.participantPath}><Avatar name={active.name} src={active.avatar} size="md" /></Link> : <Avatar name={active.name} src={active.avatar} size="md" />}
                  {active.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success-500 ring-2 ring-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  {active.participantPath ? <Link to={active.participantPath} className="block truncate text-sm font-semibold text-ink-800 hover:text-brand-700">{active.name}</Link> : <p className="truncate text-sm font-semibold text-ink-800">{active.name}</p>}
                  <p className="text-xs text-ink-400">{active.online ? 'Online now' : 'Offline'} · {active.role}</p>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-ink-50 p-4 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-ink-400">No messages yet. Say hello!</div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm', m.from === 'me' ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-white text-ink-700 ring-1 ring-ink-200/60')}>
                        <p>{m.text}</p>
                        <p className={cn('mt-1 text-[10px]', m.from === 'me' ? 'text-brand-100' : 'text-ink-400')}>{m.time}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              <form onSubmit={send} className="flex items-center gap-2 border-t border-ink-100 p-3">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" className="input flex-1" />
                <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700"><Send className="h-4 w-4" /></button>
              </form>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
