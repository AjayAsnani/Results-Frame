import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { GoogleAuth } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { NextRequest, NextResponse } from 'next/server';
import jsonData from '../../../gAuthConfig';
import { NEXT_PUBLIC_URL, SHEET } from '../../config';

interface User {
  id: string;
}

async function getResponse(req: NextRequest) {
  const sheetId = SHEET;
  const clientEmail = 'spreadsheetapi@results-frames.iam.gserviceaccount.com';

  const privateKey = (jsonData as any).private_key;

  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google Service Account credentials');
  }

  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });

  try {
    const client = await auth.getClient();
    const doc = new GoogleSpreadsheet(sheetId, client);

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const fidData = rows.map((row) => row.get('FID'));
    const statusData = rows.map((row) => row.get('Status'));

    const body: FrameRequest = await req.json();

    const fidIndex = fidData.findIndex((fid, index) => Number(fid) === body.untrustedData.fid);

    const fidStatus = statusData[fidIndex];
    console.log(fidData, statusData, fidIndex);
    if (fidStatus === 'Confirmed') {
      return new NextResponse(
        getFrameHtmlResponse({
          image: {
            src: `${NEXT_PUBLIC_URL}/selected.png`,
            aspectRatio: '1.91:1',
          },
          buttons: [
            {
              label: 'Tell it to the world',
              action: 'link',
              target:
                'https://warpcast.com/~/compose?text=Just%20got%20the%20sickest%20news%20-%20your%20fren%20is%20now%20officially%20part%20of%20the%20FBI%20crew!%20%20%20%20%20%20%20%20%20%F0%9F%95%B5%EF%B8%8F%E2%80%8D%E2%99%82%EF%B8%8F%F0%9F%94%A5%20Let%20the%20onchain%20games%20begin',
            },
          ],
        }),
      );
    }

    if (fidStatus === 'Interview') {
      return new NextResponse(
        getFrameHtmlResponse({
          image: {
            src: `${NEXT_PUBLIC_URL}/interview.png`,
            aspectRatio: '1.91:1',
          },
          buttons: [
            {
              label: 'Book a call with @Saxenasaheb',
              action: 'link',
              target: 'https://calendly.com/saxenasahab/between-two-ferns?back=1&month=2024-03',
            },
          ],
        }),
      );
    }

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
            target: 'https://forms.gle/iXwXfRVueCZGkQAP8',
          },
        ],
      }),
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return new NextResponse(
      getFrameHtmlResponse({
        image: {
          src: `${NEXT_PUBLIC_URL}/not.png`,
          aspectRatio: '1.91:1',
        },
        buttons: [
          {
            label: 'Something went wrong, please try again',
          },
        ],
      }),
    );
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
