import { MessagingView } from '@/components/shared/MessagingView';

const conversations = [
  { id: '1', name: 'Sadia Islam', avatar: 'SI', role: 'ML Research Applicant', last: 'Hi, I wanted to ask about the interview…', time: '2m', unread: 2, online: true },
  { id: '2', name: 'Rahim Ahmed', avatar: 'RA', role: 'Frontend Engineer Applicant', last: 'Thank you for the opportunity!', time: '1h', unread: 0, online: true },
  { id: '3', name: 'Nusrat Jahan', avatar: 'NJ', role: 'UI/UX Design Applicant', last: 'I have attached my portfolio.', time: '3h', unread: 1, online: false },
  { id: '4', name: 'Maliha Chowdhury', avatar: 'MC', role: 'Full-stack Applicant', last: 'Looking forward to the interview.', time: '1d', unread: 0, online: false },
];

const messagesByConv: Record<string, { id: string; from: 'me' | 'them'; text: string; time: string }[]> = {
  '1': [
    { id: 'm1', from: 'them', text: 'Hi! Thank you for reviewing my application. I wanted to ask about the interview schedule.', time: '10:30 AM' },
    { id: 'm2', from: 'me', text: 'Hi Sadia! Thanks for reaching out. We\'d like to schedule an interview for this Thursday at 2 PM. Does that work for you?', time: '10:32 AM' },
    { id: 'm3', from: 'them', text: 'Yes, that works perfectly! Should I prepare anything specific?', time: '10:33 AM' },
    { id: 'm4', from: 'me', text: 'Just be ready to discuss your ML projects and a small coding problem. We\'ll send a Google Meet link.', time: '10:35 AM' },
  ],
};

export default function MessagingPage() {
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
