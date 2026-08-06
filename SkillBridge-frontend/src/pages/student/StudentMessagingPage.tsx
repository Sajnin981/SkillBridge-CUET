import { MessagingView } from '@/components/shared/MessagingView';

const conversations = [
  { id: '1', name: 'Brain Station 23', avatar: 'BS', role: 'Recruiter', last: 'Hi Rahim, we liked your profile!', time: '5m', unread: 1, online: true },
  { id: '2', name: 'Pathao', avatar: 'PA', role: 'Recruiter', last: 'Your interview is scheduled for Thursday.', time: '2h', unread: 0, online: false },
];

const messagesByConv: Record<string, { id: string; from: 'me' | 'them'; text: string; time: string }[]> = {
  '1': [
    { id: 'm1', from: 'them', text: 'Hi Rahim, we liked your profile! Would you be interested in the Frontend Engineer Intern role?', time: '9:00 AM' },
    { id: 'm2', from: 'me', text: 'Hi! Yes, absolutely. I\'d love to learn more about the role.', time: '9:05 AM' },
  ],
};

export default function StudentMessagingPage() {
  return (
    <MessagingView
      title="Messages"
      emptyTitle="No messages yet"
      emptyDescription="When companies respond to your applications, your conversations will appear here."
      conversations={conversations}
      messagesByConv={messagesByConv}
    />
  );
}
