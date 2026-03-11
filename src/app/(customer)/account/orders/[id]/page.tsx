"use client";

// =============================================================================
// Order Detail Page - View a single order's full details
// =============================================================================

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: string;
  shippingCost: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productName: string;
    productSku: string | null;
    variantName: string | null;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string | null;
  } | null;
}

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "DELIVERED":
    case "PAID":
      return "default";
    case "SHIPPED":
    case "PROCESSING":
    case "CONFIRMED":
      return "secondary";
    case "CANCELLED":
    case "REFUNDED":
    case "FAILED":
      return "destructive";
    default:
      return "outline";
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error("Not found");
        setOrder(await res.json());
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-16 w-16 text-neutral-300" />
        <h2 className="mt-4 text-xl font-semibold">Order not found</h2>
        <Button className="mt-6" variant="outline" asChild>
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/account/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={statusVariant(order.status)}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </Badge>
          <Badge variant={statusVariant(order.paymentStatus)}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
          </Badge>
        </div>
      </div>

      {/* Items */}
      <Card className="p-6">
        <h3 className="font-semibold">Items</h3>
        <Separator className="my-3" />
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                {item.variantName && (
                  <p className="text-sm text-neutral-500">{item.variantName}</p>
                )}
                {item.productSku && (
                  <p className="text-xs text-neutral-400">
                    SKU: {item.productSku}
                  </p>
                )}
                <p className="mt-1 text-sm text-neutral-500">
                  {formatPrice(Number(item.unitPrice))} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                {formatPrice(Number(item.totalPrice))}
              </p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Shipping</span>
            <span>
              {Number(order.shippingCost) === 0
                ? "Free"
                : formatPrice(Number(order.shippingCost))}
            </span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Tax</span>
            <span>{formatPrice(Number(order.taxAmount))}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(Number(order.discountAmount))}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(Number(order.totalAmount))}</span>
          </div>
        </div>
      </Card>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <Card className="p-6">
          <h3 className="font-semibold">Shipping Address</h3>
          <Separator className="my-3" />
          <div className="text-sm text-neutral-600">
            <p className="font-medium text-neutral-900">
              {order.shippingAddress.fullName}
            </p>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && (
              <p className="mt-1">{order.shippingAddress.phone}</p>
            )}
          </div>
        </Card>
      )}

      {/* Notes */}
      {order.notes && (
        <Card className="p-6">
          <h3 className="font-semibold">Order Notes</h3>
          <Separator className="my-3" />
          <p className="text-sm text-neutral-600">{order.notes}</p>
        </Card>
      )}
    </div>
  );
}
