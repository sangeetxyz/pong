import type { NextRequest } from "next/server";
import makeBlockie from "ethereum-blockies-base64";
import { Buffer } from "node:buffer";

export const runtime = "node";

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Parse the URL.
    const url = new URL(request.url);
    // Split the pathname and grab the last segment.
    // For a route file at /api/blockie/[address]/route.ts,
    // the address should be the last segment.
    const segments = url.pathname.split("/");
    const address = segments[segments.length - 1];

    if (!address || !isValidEthereumAddress(address)) {
      return new Response("Invalid Ethereum address", { status: 400 });
    }

    const blockieBase64: string = makeBlockie(address);
    const imageData: string = blockieBase64.replace(
      /^data:image\/png;base64,/,
      "",
    );
    const buffer: Buffer = Buffer.from(imageData, "base64");

    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response("Failed to generate the image", { status: 500 });
  }
}
