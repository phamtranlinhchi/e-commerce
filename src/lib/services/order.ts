// =============================================================================
// Order Service - Business logic for order management
// =============================================================================

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

// Generate a human-readable order number: SN-YYYYMMDD-XXXX
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SN-${dateStr}-${random}`;
}

export interface CreateOrderInput {
  userId: string;
  shippingAddressId?: string;
  shippingAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    label?: string;
  };
  notes?: string;
}

const ESTIMATED_TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 75;
const FLAT_SHIPPING_RATE = 9.99;

/** Create an order from the user's current cart */
export async function createOrder(input: CreateOrderInput) {
  const { userId, shippingAddress, shippingAddressId, notes } = input;

  // Fetch cart items with product data
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          basePrice: true,
        },
      },
      variant: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
        },
      },
    },
  });

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // Resolve or create shipping address
  let addressId = shippingAddressId ?? null;
  if (!addressId && shippingAddress) {
    const newAddress = await prisma.address.create({
      data: {
        userId,
        fullName: shippingAddress.fullName,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone ?? null,
        label: shippingAddress.label ?? null,
      },
    });
    addressId = newAddress.id;
  }

  // Calculate totals
  const orderItems = cartItems.map((item) => {
    const unitPrice = item.variant
      ? Number(item.variant.price)
      : Number(item.product.basePrice);
    return {
      productId: item.product.id,
      variantId: item.variant?.id ?? null,
      quantity: item.quantity,
      unitPrice: new Prisma.Decimal(unitPrice),
      totalPrice: new Prisma.Decimal(unitPrice * item.quantity),
      productName: item.product.name,
      productSku: item.product.sku,
      variantName: item.variant?.name ?? null,
    };
  });

  const subtotal = orderItems.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0
  );
  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const taxAmount = subtotal * ESTIMATED_TAX_RATE;
  const totalAmount = subtotal + shippingCost + taxAmount;

  // Create order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal: new Prisma.Decimal(Math.round(subtotal * 100) / 100),
        shippingCost: new Prisma.Decimal(
          Math.round(shippingCost * 100) / 100
        ),
        taxAmount: new Prisma.Decimal(Math.round(taxAmount * 100) / 100),
        discountAmount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(Math.round(totalAmount * 100) / 100),
        shippingAddressId: addressId,
        notes: notes ?? null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        shippingAddress: true,
      },
    });

    // Clear the user's cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return newOrder;
  });

  return order;
}

/** Get a single order by ID (scoped to user) */
export async function getOrderById(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: true,
      shippingAddress: true,
    },
  });
}

/** Get all orders for a user, newest first */
export async function getUserOrders(
  userId: string,
  page = 1,
  pageSize = 10
) {
  const [orders, totalItems] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
}
