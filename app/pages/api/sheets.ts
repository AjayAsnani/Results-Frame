import { getFrameHtmlResponse } from "@coinbase/onchainkit";
import { GoogleAuth } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import jsonData from "../../../results-frames-757179e87fa8.json";
import { NEXT_PUBLIC_URL, SHEET } from "../../config";

interface User {
	id: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const sheetId = SHEET;
	const clientEmail = "spreadsheetapi@results-frames.iam.gserviceaccount.com";
	const privateKey = (jsonData as any).private_key;

	if (!clientEmail || !privateKey) {
		throw new Error("Missing Google Service Account credentials");
	}

	const auth = new GoogleAuth({
		scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
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

		const userIds: string[] = rows.map((row) => row.get("ID"));

		console.log(req.body);

		const { userId }: { userId: string } = req.body;

		if (userIds.includes(userId)) {
			return new NextResponse(
				getFrameHtmlResponse({
					image: {
						src: `${NEXT_PUBLIC_URL}/interview.png`,
						aspectRatio: "1.91:1",
					},
					buttons: [
						{
							label: "Book a call with @Saxenasaheb",
							action: "link",
							target: "https://onchainkit.xyz",
						},
					],
				}),
			);
		}
		{
			return new NextResponse(
				getFrameHtmlResponse({
					image: {
						src: `${NEXT_PUBLIC_URL}/not.png`,
						aspectRatio: "1.91:1",
					},
					buttons: [
						{
							label: "Appeal this decision",
							action: "link",
							target: "https://onchainkit.xyz",
						},
					],
				}),
			);
		}
	} catch (error) {
		console.error("Error fetching data:", error);
		res.status(500).json({ message: "Error processing request" });
	}
}
