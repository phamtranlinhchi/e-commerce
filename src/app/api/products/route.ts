import { NextRequest, NextResponse } from "next/server";
import { productQuerySchema } from "@/lib/validators";
import { getProducts } from "@/lib/services";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);

  const parsed = productQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid query parameters", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const result = await getProducts(parsed.data);
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
