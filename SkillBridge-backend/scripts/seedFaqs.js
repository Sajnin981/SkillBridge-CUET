require('dotenv').config();
const mongoose = require('mongoose');
const FAQ = require('../src/models/FAQ');

const faqs = [
  { question: 'What is SkillBridge CUET?', answer: 'SkillBridge CUET connects students and companies for internships, jobs, and career growth opportunities.', order: 1 },
  { question: 'How does student registration work?', answer: 'Students create an account with a valid email, complete profile details, and upload a student ID card for admin verification.', order: 2 },
  { question: 'Do I need a CUET email?', answer: 'No. Any valid email address can be used for student registration.', order: 3 },
  { question: 'How is student verification done?', answer: 'Admin verifies student identity manually using the uploaded student ID card and submitted profile details.', order: 4 },
  { question: 'How does company verification work?', answer: 'Companies register and submit trade license and company details. Admin reviews and approves or rejects.', order: 5 },
  { question: 'How do I apply for an opportunity?', answer: 'Students can open an opportunity and submit an application directly from the platform.', order: 6 },
  { question: 'Is CV required to apply?', answer: 'No. CV is optional when applying to opportunities.', order: 7 },
  { question: 'How can I message a company?', answer: 'After application or from supported profile actions, students can start or continue conversations with companies.', order: 8 },
  { question: 'How does shortlisting work?', answer: 'Company reviews applications and can mark applicants as New, Shortlisted, or Rejected.', order: 9 },
  { question: 'How can I upload my CV?', answer: 'Students can upload or replace CV from Profile or AI Resume page.', order: 10 },
  { question: 'How does AI Resume work?', answer: 'Students provide professional details and generate a structured PDF resume that can be previewed and downloaded.', order: 11 },
  { question: 'Can I update my profile?', answer: 'Yes. Students and companies can update profile details, skills, social links, and media from settings/profile pages.', order: 12 },
  { question: 'How do notifications work?', answer: 'Notifications are generated for key events like new applications, status changes, and messages.', order: 13 },
  { question: 'How can companies post opportunities?', answer: 'Verified companies can create, edit, and manage opportunities from the company dashboard.', order: 14 },
  { question: 'How can I contact an applicant?', answer: 'Companies can open an applicant record and start messaging directly from the applicants flow.', order: 15 },
  { question: 'How can I report a problem?', answer: 'Contact platform administration through official support channels maintained by SkillBridge CUET admins.', order: 16 },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined');

  await mongoose.connect(uri);
  for (const item of faqs) {
    await FAQ.updateOne(
      { question: item.question },
      { $set: { answer: item.answer, order: item.order, isPublished: true } },
      { upsert: true }
    );
  }
  console.log(`Seeded ${faqs.length} FAQs`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
