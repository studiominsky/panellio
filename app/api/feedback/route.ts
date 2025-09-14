import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import FeedbackTemplate from '@/components/feedback-template';

const { NEXT_PUBLIC_RESEND_API_KEY } = process.env;

const resend = new Resend(NEXT_PUBLIC_RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, emoji } = await req.json();

    if (!message && !emoji) {
      return NextResponse.json(
        { error: 'Either a message or an emoji is required.' },
        { status: 400 }
      );
    }

    if (!NEXT_PUBLIC_RESEND_API_KEY) {
      console.error('Resend API key is not set.');
      return NextResponse.json(
        { error: 'Email service is not configured properly.' },
        { status: 500 }
      );
    }

    const emailData = await resend.emails.send({
      from: 'Panellio <hello@panellio.com>',
      to: 'panellio@proton.me',
      subject: name
        ? `${name} has a message!`
        : 'Anonymous feedback received',
      react: FeedbackTemplate({
        name: name || null,
        email: email || null,
        message: message || '',
        emoji: emoji || '',
      }),
      text: `Hi, you have a new feedback from Panellio.\n\n
      Message: ${message || 'No message provided.'}\n
      Emoji: ${emoji || 'No emoji provided.'}\n
      ${name ? `From: ${name}` : 'Anonymous feedback'}\n
      ${email ? `Email: ${email}` : ''}`,
    });

    return NextResponse.json(emailData);
  } catch (error) {
    console.error('Error sending feedback:', error);

    return NextResponse.json(
      { error: 'Failed to send feedback. Please try again later.' },
      { status: 500 }
    );
  }
}
