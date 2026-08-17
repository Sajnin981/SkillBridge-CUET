import { useEffect, useState } from 'react';
import { MessagingView } from '@/components/shared/MessagingView';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { messageService } from '@/services/messageService';

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

export default function MessagingPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    messageService.getConversations(user.role).then(async (convs) => {
      setConversations(convs as Conversation[]);
      const msgMap: Record<string, Message[]> = {};
      await Promise.all(convs.map(async (c) => {
        const msgs = await messageService.getMessages(c.id);
        msgMap[c.id] = msgs as Message[];
      }));
      setMessagesByConv(msgMap);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (loading) return <SkeletonCard />;

  return (
    <MessagingView
      title="Messages"
      emptyTitle="No messages yet"
      emptyDescription="When applicants reach out, your conversations will appear here."
      conversations={conversations}
      messagesByConv={messagesByConv}
    />
  );
}
