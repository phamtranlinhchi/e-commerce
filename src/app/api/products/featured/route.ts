import { NextRequest, NextResponse } from "next/server";
import { getFeaturedProducts } from "@/lib/services";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit")) || 8;
  const products = await getFeaturedProducts(Math.min(limit, 24));
  return NextResponse.json({ products }, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
