import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Send, Search, ArrowLeft, MessageSquare } from 'lucide-react';
import { io, type Socket } from 'socket.io-client';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { API_ORIGIN, getAuthToken, normalizeError, type BackendMessage } from '@/api/axios';
import { mapMessage } from '@/api/mappers';
import { messageService } from '@/services/messageService';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  participantPath?: string;
  role: string;
  last: string;
  time: string;
  lastMessageAt: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
  createdAt?: string;
}

interface MessagingViewProps {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  conversations: Conversation[];
  messagesByConv: Record<string, Message[]>;
  onSendMessage?: (conversationId: string, text: string) => Promise<BackendMessage>;
  initialConversationId?: string | null;
  headerAction?: React.ReactNode;
  topContent?: React.ReactNode;
}

interface MessageEvent {
  conversationId: string;
  message: BackendMessage;
}

function mergeMessages(current: Message[], incoming: Message): Message[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  byId.set(incoming.id, incoming);
  return [...byId.values()].sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
    return aTime - bTime || a.id.localeCompare(b.id);
  });
}

export function MessagingView({ title, emptyTitle, emptyDescription, conversations, messagesByConv, onSendMessage, initialConversationId, headerAction, topContent }: MessagingViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(initialConversationId && conversations.some((c) => c.id === initialConversationId) ? initialConversationId : conversations[0]?.id ?? null);
  const [conversationItems, setConversationItems] = useState(conversations);
  const [messagesByConversation, setMessagesByConversation] = useState(messagesByConv);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [mobileChat, setMobileChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'unavailable' | 'sync-error'>('connecting');
  const endRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const conversationItemsRef = useRef(conversationItems);
  const activeIdRef = useRef(activeId);
  const mobileChatRef = useRef(mobileChat);
  const messagesByConversationRef = useRef(messagesByConversation);
  const previousConversationRef = useRef<string | null>(null);
  conversationItemsRef.current = conversationItems;
  activeIdRef.current = activeId;
  mobileChatRef.current = mobileChat;
  messagesByConversationRef.current = messagesByConversation;

  useEffect(() => {
    setConversationItems((current) => conversations.map((conversation) => {
      const previous = current.find((item) => item.id === conversation.id);
      return previous && Date.parse(previous.lastMessageAt) > Date.parse(conversation.lastMessageAt) ? previous : conversation;
    }));
  }, [conversations]);

  useEffect(() => {
    setMessagesByConversation((current) => {
      const merged = { ...current };
      Object.entries(messagesByConv).forEach(([conversationId, messages]) => {
        merged[conversationId] = messages.reduce(mergeMessages, current[conversationId] ?? []);
      });
      return merged;
    });
  }, [messagesByConv]);

  useEffect(() => {
    if (!activeId && conversationItems.length > 0) {
      setActiveId(conversationItems[0].id);
    }
  }, [conversationItems, activeId]);

  useEffect(() => {
    if (initialConversationId && conversationItems.some((c) => c.id === initialConversationId)) {
      setActiveId(initialConversationId);
      setMobileChat(true);
    }
  }, [initialConversationId, conversationItems]);

  const activeMessages = useMemo(
    () => activeId ? messagesByConversation[activeId] ?? [] : [],
    [activeId, messagesByConversation],
  );

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeMessages]);

  const active = conversationItems.find((c) => c.id === activeId);

  const filteredConvs = conversationItems.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const userId = user?.id;
    const userRole = user?.role;
    if (!userId || !userRole) return;

    const token = getAuthToken(userRole);
    if (!token) {
      setLiveStatus('unavailable');
      return;
    }

    const socket = io(API_ORIGIN, { auth: { token } });
    socketRef.current = socket;

    const applyMessage = (event: MessageEvent, updatePreview: boolean) => {
      if (!event?.conversationId || event.message?.conversation !== event.conversationId) return;
      const mapped = mapMessage(event.message, userRole, userId) as Message;
      setMessagesByConversation((current) => ({
        ...current,
        [event.conversationId]: mergeMessages(current[event.conversationId] ?? [], mapped),
      }));

      if (updatePreview) {
        if (!conversationItemsRef.current.some((conversation) => conversation.id === event.conversationId)) {
          void messageService.getConversations(userRole).then((latestConversations) => {
            setConversationItems((current) => latestConversations.map((conversation) => {
              const previous = current.find((item) => item.id === conversation.id);
              return previous && Date.parse(previous.lastMessageAt) > Date.parse(conversation.lastMessageAt) ? previous : conversation;
            }));
          }).catch(() => setLiveStatus('sync-error'));
        }
        setConversationItems((current) => current
          .map((conversation) => conversation.id === event.conversationId
            ? {
              ...conversation,
              last: event.message.content,
              time: new Date(event.message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              lastMessageAt: event.message.createdAt,
              unread: mapped.from === 'them'
                ? (activeIdRef.current === event.conversationId &&
                  (window.matchMedia('(min-width: 1024px)').matches || mobileChatRef.current)
                  ? 0
                  : conversation.unread + 1)
                : conversation.unread,
            }
            : conversation)
          .sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt)));

        if (
          mapped.from === 'them' &&
          activeIdRef.current === event.conversationId &&
          (window.matchMedia('(min-width: 1024px)').matches || mobileChatRef.current)
        ) {
          messageService.markRead(event.conversationId).catch(() => setLiveStatus('sync-error'));
        }
      }
    };

    const recoverFromRest = async () => {
      try {
        const latestConversations = await messageService.getConversations(userRole);
        setConversationItems((current) => latestConversations.map((conversation) => {
          const previous = current.find((item) => item.id === conversation.id);
          return previous && Date.parse(previous.lastMessageAt) > Date.parse(conversation.lastMessageAt) ? previous : conversation;
        }));

        const conversationId = activeIdRef.current;
        if (conversationId) {
          const currentMessages = messagesByConversationRef.current[conversationId] ?? [];
          const lastMessage = currentMessages[currentMessages.length - 1];
          const history = await messageService.getMessagesSince(conversationId, userRole, userId, lastMessage?.createdAt);
          setMessagesByConversation((current) => ({
            ...current,
            [conversationId]: history.reduce(mergeMessages, current[conversationId] ?? []),
          }));
        }
        setLiveStatus('connected');
      } catch {
        setLiveStatus('sync-error');
      }
    };

    const joinActiveConversation = (conversationId: string) => {
      socket.emit('conversation:join', conversationId, (result: { ok: boolean }) => {
        if (!result?.ok) setLiveStatus('unavailable');
      });
    };

    socket.on('connect', () => {
      setLiveStatus('connected');
      const conversationId = activeIdRef.current;
      if (conversationId) joinActiveConversation(conversationId);
      void recoverFromRest();
    });
    socket.on('disconnect', () => setLiveStatus('disconnected'));
    socket.on('connect_error', () => setLiveStatus('unavailable'));
    socket.on('message:new', (event: MessageEvent) => applyMessage(event, false));
    socket.on('conversation:activity', (event: MessageEvent) => applyMessage(event, true));

    return () => {
      const conversationId = activeIdRef.current;
      if (conversationId) socket.emit('conversation:leave', conversationId);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('message:new');
      socket.off('conversation:activity');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    const previousConversationId = previousConversationRef.current;
    const socket = socketRef.current;
    if (previousConversationId && previousConversationId !== activeId) {
      socket?.emit('conversation:leave', previousConversationId);
    }
    previousConversationRef.current = activeId;
    if (!activeId || !(window.matchMedia('(min-width: 1024px)').matches || mobileChat)) return;

    if (socket?.connected) {
      socket.emit('conversation:join', activeId, (result: { ok: boolean }) => {
        if (!result?.ok) setLiveStatus('unavailable');
      });
    }
    messageService.markRead(activeId).then(() => {
      setConversationItems((current) => current.map((conversation) =>
        conversation.id === activeId ? { ...conversation, unread: 0 } : conversation
      ));
    }).catch(() => setLiveStatus('sync-error'));
  }, [activeId, mobileChat]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !activeId || !onSendMessage || sending) return;
    setSending(true);
    try {
      const savedMessage = await onSendMessage(activeId, text);
      const mapped = mapMessage(savedMessage, user?.role, user?.id) as Message;
      setMessagesByConversation((current) => ({
        ...current,
        [activeId]: mergeMessages(current[activeId] ?? [], mapped),
      }));
      setConversationItems((current) => current
        .map((conversation) => conversation.id === activeId
          ? {
            ...conversation,
            last: savedMessage.content,
            time: new Date(savedMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            lastMessageAt: savedMessage.createdAt,
            unread: 0,
          }
          : conversation)
        .sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt)));
      setInput('');
    } catch (err) {
      toast({ title: 'Message not sent', description: normalizeError(err).message, variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  if (conversationItems.length === 0) {
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
                  <p className="text-xs text-ink-400">{active.online ? `Online now · ${active.role}` : active.role}</p>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-ink-50 p-4 scrollbar-thin">
                {liveStatus !== 'connected' && <p className="text-center text-xs text-ink-400">{liveStatus === 'connecting' ? 'Connecting to live messages…' : liveStatus === 'disconnected' ? 'Reconnecting to live messages…' : liveStatus === 'sync-error' ? 'Could not sync message history.' : 'Live updates are unavailable.'}</p>}
                {activeMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-ink-400">No messages yet. Say hello!</div>
                ) : (
                  activeMessages.map((m) => (
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
                <button type="submit" disabled={sending} className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-50"><Send className="h-4 w-4" /></button>
              </form>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
