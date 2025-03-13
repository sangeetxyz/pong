export interface BlockieImageProps {
  address?: string;
  size?: number;
  className?: string;
}

import type { NextRequest } from "next/server";
import makeBlockie from "ethereum-blockies-base64";

export const runtime = "edge";

interface RouteParams {
  params: {
    address: string;
  };
}

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<Response> {
  try {
    const { address } = params;

    if (!address || !isValidEthereumAddress(address)) {
      return new Response("Invalid Ethereum address", {
        status: 400,
      });
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
    return new Response("Failed to generate the image", {
      status: 500,
    });
  }
}
