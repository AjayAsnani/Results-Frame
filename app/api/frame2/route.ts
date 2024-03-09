import { FrameRequest, getFrameHtmlResponse, getFrameMessage } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  const text = message.input || '';
  let state = {
    page: 0,
  };
  try {
    state = JSON.parse(decodeURIComponent(message.state?.serialized));
  } catch (e) {
    console.error(e);
  }

  let selectedButton = message?.button;

  const buttons = [
    {
      label: 'Appeal this decision',
      action: 'link',
      target: 'https://onchainkit.xyz',
    },
  ];

  return new NextResponse(
    getFrameHtmlResponse({
      image: {
        src: `${NEXT_PUBLIC_URL}/not.png`,
        aspectRatio: '1.91:1',
      },
      buttons: [
        {
          label: 'Appeal this decision',
          action: 'link',
          target: 'https://onchainkit.xyz',
        },
      ],
      postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
      state: {
        page: state?.page + 1,
        time: new Date().toISOString(),
      },
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
