import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { GoogleAuth } from 'google-auth-library';
import { NEXT_PUBLIC_URL, SHEET } from '../../config';
import { NextResponse } from 'next/server';
import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import { private_key } from '../../../results-frames-757179e87fa8.json';

interface User {
  id: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sheetId = SHEET;
  const clientEmail = 'spreadsheetapi@results-frames.iam.gserviceaccount.com';
  const privateKey = private_key;

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

    const userIds: string[] = rows.map((row) => row.get('ID'));

    const { userId }: { userId: string } = req.body;

    if (userIds.includes(userId)) {
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
              target: 'https://onchainkit.xyz',
            },
          ],
        }),
      );
    } else {
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
        }),
      );
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
}
