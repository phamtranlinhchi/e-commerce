import { NextRequest, NextResponse } from "next/server";
import { getCategoryBySlug } from "@/lib/services";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return NextResponse.json({ message: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}
