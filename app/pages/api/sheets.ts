import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { GoogleAuth } from 'google-auth-library'; // Import GoogleAuth class
import { NEXT_PUBLIC_URL, SHEET } from '../../config';

interface User {
  id: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sheetId = SHEET;

  // Use environment variables for secure credential storage
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

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
    const doc = new GoogleSpreadsheet(sheetId);
    doc.useApi(client);
    await doc.loadInfo(); // Load sheet information
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const userIds: string[] = rows.map((row) => row.get('ID'));

    const { userId }: { userId: string } = req.body;

    if (userIds.includes(userId)) {
      res.status(200).json({ postUrl: `${NEXT_PUBLIC_URL}/api/frame2` });
    } else {
      res.status(200).json({ postUrl: `${NEXT_PUBLIC_URL}/api/frame3` });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
}
