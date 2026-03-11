// =============================================================================
// Admin Orders List - View and filter all orders
// =============================================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getAdminOrders } from "@/lib/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import { formatPrice, formatDateShort } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderStatus } from "@/generated/prisma";

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

const statuses = Object.values(OrderStatus);

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;
  const page = Math.max(1, Number(params.page ?? 1));

  const { orders, pagination } = await getAdminOrders({
    status: status as OrderStatus | undefined,
    search,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-wrap gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search orders..."
              defaultValue={search}
              className="flex h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <select
              name="status"
              defaultValue={status ?? ""}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {pagination.totalItems} order{pagination.totalItems !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
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
                    <TableCell>
                      <Badge
                        variant={
                          order.paymentStatus === "PAID"
                            ? "default"
                            : order.paymentStatus === "FAILED"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(Number(order.totalAmount))}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateShort(order.createdAt.toISOString())}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/admin/orders?page=${pagination.page - 1}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
                    >
                      Previous
                    </Link>
                  </Button>
                )}
                {pagination.page < pagination.totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/admin/orders?page=${pagination.page + 1}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
                    >
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
