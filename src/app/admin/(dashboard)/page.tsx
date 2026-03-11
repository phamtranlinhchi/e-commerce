// =============================================================================
// Admin Dashboard - Analytics overview with stat cards and recent orders
// =============================================================================

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getDashboardStats,
  getRecentOrders,
  getMonthlyRevenue,
} from "@/lib/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { formatPrice, formatDateShort } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "DELIVERED":
      return "default";
    case "SHIPPED":
    case "PROCESSING":
    case "CONFIRMED":
      return "secondary";
    case "CANCELLED":
    case "REFUNDED":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const [stats, recentOrders, monthlyRevenue] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(10),
    getMonthlyRevenue(),
  ]);

  const statCards = [
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
    },
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
    },
    {
      label: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monthly Revenue Data (JSON for chart integration) */}
      {monthlyRevenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
              {monthlyRevenue.map((m) => (
                <div key={m.month} className="text-center">
                  <div className="text-xs text-muted-foreground">
                    {m.month.slice(5)}
                  </div>
                  <div className="text-sm font-semibold">
                    {formatPrice(m.revenue)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.orders} orders
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No orders yet
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{order.user.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(Number(order.totalAmount))}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateShort(order.createdAt.toISOString())}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
