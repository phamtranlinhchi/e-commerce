// =============================================================================
// Admin Auth Guard - Reusable helper for admin API routes
// =============================================================================

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type AdminSession = {
  user: {
    id: string;
    role: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

/**
 * Get authenticated admin session or return null.
 * Use in server components / service layer.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session as AdminSession;
}

/**
 * Require admin session for API routes.
 * Returns the session or a 401/403 NextResponse.
 */
export async function requireAdmin(): Promise<
  | { session: AdminSession; error?: never }
  | { session?: never; error: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session: session as AdminSession };
}
