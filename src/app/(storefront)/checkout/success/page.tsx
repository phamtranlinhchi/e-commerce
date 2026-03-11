"use client";

// =============================================================================
// Order Confirmation Page - Shows order details after successful checkout
// =============================================================================

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  shippingCost: string;
  taxAmount: string;
  totalAmount: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
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
  } | null;
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          <p className="mt-4 text-neutral-500">Loading order details...</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Order not found");
        const data = await res.json();
        setOrder(data);
      } catch {
        setError("Could not load order details");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        <p className="mt-4 text-neutral-500">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
        <Package className="h-16 w-16 text-neutral-300" />
        <h1 className="mt-4 text-xl font-bold">Order Not Found</h1>
        <p className="mt-2 text-neutral-500">{error}</p>
        <Button className="mt-6" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* Success Banner */}
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">
          Order Confirmed!
        </h1>
        <p className="mt-2 text-neutral-500">
          Thank you for your order. We&apos;ll send you a confirmation email
          shortly.
        </p>
      </div>

      {/* Order Details */}
      <Card className="mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">Order Number</p>
            <p className="text-lg font-bold">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Status</p>
            <p className="font-medium text-neutral-900">
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </p>
          </div>
        </div>

        <p className="mt-2 text-sm text-neutral-400">
          Placed on {formatDate(order.createdAt)}
        </p>

        <Separator className="my-4" />

        {/* Items */}
        <h3 className="font-semibold">Items</h3>
        <div className="mt-3 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-neutral-500">{item.variantName}</p>
                )}
                <p className="text-neutral-500">
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
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(Number(order.totalAmount))}</span>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <>
            <Separator className="my-4" />
            <h3 className="font-semibold">Shipping Address</h3>
            <div className="mt-2 text-sm text-neutral-600">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </>
        )}
      </Card>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/account/orders">View My Orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
