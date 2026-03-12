// =============================================================================
// Admin Dashboard API - GET dashboard stats + recent orders
// =============================================================================

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getDashboardStats,
  getRecentOrders,
  getMonthlyRevenue,
} from "@/lib/services/admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [stats, recentOrders, monthlyRevenue] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(10),
    getMonthlyRevenue(),
  ]);

  return NextResponse.json({ stats, recentOrders, monthlyRevenue }, {
    headers: {
      "Cache-Control": "private, no-cache",
    },
  });
}
