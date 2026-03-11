"use client";

// =============================================================================
// Order History Page - List of all user orders
// =============================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDateShort } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    quantity: number;
  }>;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

function statusVariant(
  status: string
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

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?page=${page}&pageSize=10`);
        if (!res.ok) return;
        const data = await res.json();
        setOrders(data.orders ?? []);
        setPagination(data.pagination ?? null);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [page]);

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-16 w-16 text-neutral-300" />
        <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>
        <p className="mt-2 text-neutral-500">
          When you place orders, they&apos;ll appear here.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Order History</h2>
      <p className="mt-1 text-sm text-neutral-500">
        {pagination?.totalItems ?? 0} order
        {(pagination?.totalItems ?? 0) !== 1 ? "s" : ""} total
      </p>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="block"
          >
            <Card className="p-5 transition-colors hover:bg-neutral-50">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">{order.orderNumber}</p>
                    <Badge variant={statusVariant(order.status)}>
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    {formatDateShort(order.createdAt)}
                  </p>
                  <div className="mt-2 text-sm text-neutral-600">
                    {order.items.slice(0, 3).map((item) => (
                      <p key={item.id}>
                        {item.productName}
                        {item.variantName ? ` (${item.variantName})` : ""} ×{" "}
                        {item.quantity}
                      </p>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-neutral-400">
                        +{order.items.length - 3} more item
                        {order.items.length - 3 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-lg font-bold">
                  {formatPrice(Number(order.totalAmount))}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-neutral-500">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
