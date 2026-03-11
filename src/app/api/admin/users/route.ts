// =============================================================================
// Admin Users API - GET (list), PATCH (update role)
// =============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminUsers } from "@/lib/services/admin";
import { UserRole } from "@/generated/prisma";

const validRoles = new Set<string>(Object.values(UserRole));

// GET /api/admin/users
export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const result = await getAdminUsers({
    search: searchParams.get("search") ?? undefined,
    role: searchParams.get("role") ?? undefined,
    page: Math.max(1, Number(searchParams.get("page") ?? 1)),
    pageSize: Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20))),
  });

  return NextResponse.json(result);
}

// PATCH /api/admin/users - Update user role
export async function PATCH(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 },
      );
    }

    if (!validRoles.has(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 },
      );
    }

    // Prevent admin from demoting themselves
    if (userId === session.user.id && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error("[ADMIN_USERS_PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
