import { useState, useRef, useEffect } from 'react';
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft, MessageSquare } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
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
}

export function MessagingView({ title, emptyTitle, emptyDescription, conversations, messagesByConv, onSendMessage, initialConversationId }: MessagingViewProps) {
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
      <PageContainer>
        <h2 className="mb-6 font-display text-2xl font-bold text-ink-800">{title}</h2>
        <div className="card">
          <EmptyState icon={<MessageSquare className="h-7 w-7" />} title={emptyTitle} description={emptyDescription} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h2 className="mb-6 font-display text-2xl font-bold text-ink-800">{title}</h2>
      <div className="card flex h-[600px] overflow-hidden p-0">
        {/* Conversation list */}
        <div className={cn('w-full border-r border-ink-100 sm:w-80', mobileChat && 'hidden')}>
          <div className="border-b border-ink-100 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" placeholder="Search conversations…" />
            </div>
          </div>
          <div className="overflow-y-auto scrollbar-thin">
            {filteredConvs.map((c) => (
              <button key={c.id} onClick={() => { setActiveId(c.id); setMobileChat(true); }} className={cn('flex w-full items-center gap-3 border-b border-ink-50 p-3.5 text-left transition hover:bg-ink-50', activeId === c.id && 'bg-brand-50')}>
                <div className="relative">
                  <Avatar name={c.name} size="md" />
                  {c.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success-500 ring-2 ring-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-ink-800">{c.name}</p>
                    <span className="text-xs text-ink-400">{c.time}</span>
                  </div>
                  <p className="truncate text-xs text-ink-500">{c.last}</p>
                </div>
                {c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">{c.unread}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className={cn('flex flex-1 flex-col', !mobileChat && 'hidden sm:flex')}>
          {active && (
            <>
              <div className="flex items-center gap-3 border-b border-ink-100 p-4">
                <button onClick={() => setMobileChat(false)} className="rounded-lg p-1 text-ink-400 sm:hidden"><ArrowLeft className="h-5 w-5" /></button>
                <div className="relative">
                  <Avatar name={active.name} size="md" />
                  {active.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success-500 ring-2 ring-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-800">{active.name}</p>
                  <p className="text-xs text-ink-400">{active.online ? 'Online now' : 'Offline'} · {active.role}</p>
                </div>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100"><Phone className="h-4 w-4" /></button>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100"><Video className="h-4 w-4" /></button>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100"><MoreVertical className="h-4 w-4" /></button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-ink-50 p-4 scrollbar-thin">
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
