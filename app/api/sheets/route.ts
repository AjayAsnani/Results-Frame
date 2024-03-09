import { FrameRequest, getFrameHtmlResponse } from "@coinbase/onchainkit";
import { GoogleAuth } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { NextRequest, NextResponse } from "next/server";
import jsonData from "../../../gAuthConfig";
import { NEXT_PUBLIC_URL, SHEET } from "../../config";

interface User {
	id: string;
}

async function getResponse(req: NextRequest) {
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

		const body: FrameRequest = await req.json();
		const {
			untrustedData: { url },
		} = body;

		const shouldBookInterview = true;

		if (shouldBookInterview) {
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
							target:
								"https://calendly.com/saxenasahab/between-two-ferns?back=1&month=2024-03",
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
		return new NextResponse(
			getFrameHtmlResponse({
				image: {
					src: `${NEXT_PUBLIC_URL}/not.png`,
					aspectRatio: "1.91:1",
				},
				buttons: [
					{
						label: "Something went wrong, please try again",
						// Route back to home
						// target: "https://onchainkit",
					},
				],
			}),
		);
	}
}

export async function POST(req: NextRequest): Promise<Response> {
	return getResponse(req);
}

export const dynamic = "force-dynamic";
