// =============================================================================
// Profile API Route - PATCH to update user profile
// =============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// PATCH /api/auth/profile - Update current user's profile
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, phone } = await request.json();

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(typeof name === "string" ? { name: name.trim() || null } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
