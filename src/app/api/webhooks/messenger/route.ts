import { NextResponse } from 'next/server';
import { verifyWebhookToken } from '@/lib/messenger';

// Webhook Verification (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    const isValid = await verifyWebhookToken(mode, token);
    if (isValid) {
      return new Response(challenge, { status: 200 });
    }
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Receive Messenger Events (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.object === 'page') {
      body.entry?.forEach((entry: any) => {
        const webhookEvent = entry.messaging?.[0];
        console.log('Received Messenger Webhook Event:', webhookEvent);
      });

      return new Response('EVENT_RECEIVED', { status: 200 });
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  } catch (error) {
    console.error('Error handling Messenger webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
