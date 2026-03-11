"use client";

// =============================================================================
// Checkout Page - Shipping address form + order summary + place order
// =============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores";
import { useAuth, useMounted } from "@/hooks";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 75;

interface ShippingForm {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

const initialForm: ShippingForm = {
  fullName: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  phone: "",
};

function computeSummary(items: { price: number; quantity: number }[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const estimatedShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + estimatedShipping + estimatedTax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    estimatedTax: Math.round(estimatedTax * 100) / 100,
    estimatedShipping: Math.round(estimatedShipping * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const mounted = useMounted();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [form, setForm] = useState<ShippingForm>(initialForm);
  const [errors, setErrors] = useState<Partial<ShippingForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!mounted || authLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <div className="mt-8 animate-pulse space-y-4">
          <div className="h-64 rounded-lg bg-neutral-100" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Please Sign In</h1>
        <p className="mt-2 text-neutral-500">
          You need to be signed in to complete checkout.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/login?callbackUrl=/checkout">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 text-center">
        <ShoppingBag className="h-20 w-20 text-neutral-300" />
        <h1 className="mt-6 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-neutral-500">
          Add some products before checking out.
        </p>
        <Button className="mt-8" asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const summary = computeSummary(items);

  function updateField(field: keyof ShippingForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: Partial<ShippingForm> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.street.trim()) newErrors.street = "Street address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.postalCode.trim()) newErrors.postalCode = "Postal code is required";
    if (!form.country.trim()) newErrors.country = "Country is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handlePlaceOrder() {
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName: form.fullName.trim(),
            street: form.street.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            postalCode: form.postalCode.trim(),
            country: form.country.trim(),
            phone: form.phone.trim() || undefined,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to place order");
      }

      const order = await res.json();
      // Clear local cart state
      clearCart();
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href="/cart">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
      </Button>

      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Shipping Address Form */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Shipping Address</h2>
            <Separator className="my-4" />

            {apiError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {apiError}
              </div>
            )}

            <div className="grid gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="John Doe"
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={form.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  placeholder="123 Main St, Apt 4"
                  className={errors.street ? "border-red-500" : ""}
                />
                {errors.street && (
                  <p className="mt-1 text-xs text-red-500">{errors.street}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="New York"
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    placeholder="NY"
                    className={errors.state ? "border-red-500" : ""}
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-red-500">{errors.state}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={form.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    placeholder="10001"
                    className={errors.postalCode ? "border-red-500" : ""}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="US"
                    className={errors.country ? "border-red-500" : ""}
                  />
                  {errors.country && (
                    <p className="mt-1 text-xs text-red-500">{errors.country}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-6">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <Separator className="my-4" />

            {/* Items */}
            <div className="max-h-60 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    {item.image ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.altText ?? item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-400">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-neutral-500">
                        {item.variant.name}
                      </p>
                    )}
                    <p className="text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Shipping</span>
                <span>
                  {summary.estimatedShipping === 0
                    ? "Free"
                    : formatPrice(summary.estimatedShipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Tax</span>
                <span>{formatPrice(summary.estimatedTax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(summary.total)}</span>
              </div>
            </div>

            <Button
              className="mt-6 w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                `Place Order • ${formatPrice(summary.total)}`
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
