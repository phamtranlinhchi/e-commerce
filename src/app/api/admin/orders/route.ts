// =============================================================================
// Admin Orders API - GET (list all orders with filters)
// =============================================================================

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminOrders } from "@/lib/services/admin";
import { OrderStatus } from "@/generated/prisma";

const validStatuses = new Set<string>(Object.values(OrderStatus));

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");

  const result = await getAdminOrders({
    status:
      statusParam && validStatuses.has(statusParam)
        ? (statusParam as OrderStatus)
        : undefined,
    search: searchParams.get("search") ?? undefined,
    page: Math.max(1, Number(searchParams.get("page") ?? 1)),
    pageSize: Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20))),
  });

  return NextResponse.json(result);
}
