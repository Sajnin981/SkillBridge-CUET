import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessagingView } from '@/components/shared/MessagingView';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { messageService } from '@/services/messageService';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { normalizeError } from '@/api/axios';

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

export default function MessagingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    messageService.getConversations(user.role).then(async (convs) => {
      setConversations(convs as Conversation[]);
      const msgMap: Record<string, Message[]> = {};
      await Promise.all(convs.map(async (c) => {
        const msgs = await messageService.getMessages(c.id, user.role, user.id);
        msgMap[c.id] = msgs as Message[];
      }));
      setMessagesByConv(msgMap);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handleSendMessage = async (conversationId: string, text: string) => {
    await messageService.sendMessage(conversationId, text);
  };

  const contactAdmin = async () => {
    try {
      const conversation = await messageService.startConversation({});
      // Refresh conversation list so the new/existing Admin conversation is in state
      // before we navigate — otherwise MessagingView can't select it.
      const updatedConversations = await messageService.getConversations(user!.role);
      const updatedMessages = await Promise.all(
        updatedConversations.map(async (item) => [item.id, await messageService.getMessages(item.id, user!.role, user!.id)] as const)
      );
      setConversations(updatedConversations as Conversation[]);
      setMessagesByConv(Object.fromEntries(updatedMessages) as Record<string, Message[]>);
      navigate(`/company/messages?conversationId=${conversation._id}`);
    } catch (err) {
      toast({ title: 'Could not contact admin', description: normalizeError(err).message, variant: 'error' });
    }
  };

  if (loading) return <SkeletonCard />;

  return (
    <MessagingView
      title="Messages"
      emptyTitle="No messages yet"
      emptyDescription="When applicants reach out, your conversations will appear here."
      conversations={conversations}
      messagesByConv={messagesByConv}
      onSendMessage={handleSendMessage}
      initialConversationId={conversationId}
      headerAction={<Button size="sm" variant="outline" onClick={contactAdmin}>Contact admin</Button>}
    />
  );
}
