import { NextResponse } from "next/server";

export const runtime = "nodejs";

import { type WalletScanTransfer } from "@/lib/alchemy";
import { buildErc20ScanInfo } from "@/lib/scan/scanInfoService";
import { resolveSepoliaProtocol } from "@/lib/scan/protocolRegistry";

type ScanInfoRequestBody = {
  transfers?: WalletScanTransfer[];
  txTo?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as ScanInfoRequestBody;

    if (Array.isArray(body.transfers) && body.transfers.length > 0) {
      const scans = await buildErc20ScanInfo(body.transfers);
      return NextResponse.json({ success: true, scan: scans });
    }

    const protocolEntry = resolveSepoliaProtocol(body.txTo || null);

    return NextResponse.json({
      success: true,
      scan: {
        txTo: body.txTo || null,
        protocol: protocolEntry?.protocol ?? null,
        protocolKind: protocolEntry?.kind ?? null,
      },
    });
  } catch (error) {
    console.error("scanInfo error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
