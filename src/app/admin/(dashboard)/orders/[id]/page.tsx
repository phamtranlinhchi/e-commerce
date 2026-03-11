"use client";

// =============================================================================
// Admin Order Detail - View order info and update status
// =============================================================================

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: string | number;
  shippingCost: string | number;
  taxAmount: string | number;
  totalAmount: string | number;
  notes: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPrice: string | number;
    totalPrice: string | number;
  }>;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
}

export default function AdminOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setOrder(data);
        setStatus(data.status);
        setPaymentStatus(data.paymentStatus);
      })
      .catch(() => setError("Failed to load order"));
  }, [id]);

  async function handleUpdate() {
    if (!order) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update order");
      }

      const updated = await res.json();
      setOrder(updated);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!order && !error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.productName}</div>
                        {item.variantName && (
                          <div className="text-xs text-muted-foreground">
                            {item.variantName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(Number(item.unitPrice))}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(Number(item.totalPrice))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 space-y-1 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(Number(order.shippingCost))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(Number(order.taxAmount))}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-bold">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.totalAmount))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-medium">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.user.name ?? "—"}</p>
                <p className="text-muted-foreground">{order.user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {ORDER_STATUS_LABELS[s] ?? s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {PAYMENT_STATUS_LABELS[s] ?? s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                onClick={handleUpdate}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Updating..." : "Update Order"}
              </Button>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
