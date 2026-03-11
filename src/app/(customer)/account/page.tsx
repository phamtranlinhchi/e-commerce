"use client";

// =============================================================================
// Account Dashboard - Overview of user's account
// =============================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks";
import { formatPrice, formatDateShort } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: Array<{ id: string; productName: string }>;
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

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentOrders() {
      try {
        const res = await fetch("/api/orders?pageSize=5");
        if (!res.ok) return;
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchRecentOrders();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <User className="h-6 w-6 text-neutral-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              Welcome back, {user?.name ?? "there"}!
            </h2>
            <p className="text-sm text-neutral-500">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <Link
            href="/account/orders"
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-neutral-600" />
              <div>
                <p className="font-medium">My Orders</p>
                <p className="text-sm text-neutral-500">
                  Track, return, or buy things again
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>
        </Card>
        <Card className="p-5">
          <Link
            href="/account/profile"
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-neutral-600" />
              <div>
                <p className="font-medium">Profile Settings</p>
                <p className="text-sm text-neutral-500">
                  Manage your account details
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>
        </Card>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/orders">View All</Link>
          </Button>
        </div>

        <Separator className="my-3" />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-neutral-500">
            <Package className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-2">No orders yet</p>
            <Button className="mt-4" variant="outline" size="sm" asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block"
              >
                <Card className="p-4 transition-colors hover:bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{order.orderNumber}</p>
                        <Badge variant={statusVariant(order.status)}>
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-neutral-500">
                        {formatDateShort(order.createdAt)} •{" "}
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(Number(order.totalAmount))}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
