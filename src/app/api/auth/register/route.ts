// =============================================================================
// Registration API Route - POST /api/auth/register
// =============================================================================

import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { createUser } from "@/lib/services/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const user = await createUser(parsed.data);

    return NextResponse.json(
      { message: "Account created successfully", user },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Email already registered") {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
