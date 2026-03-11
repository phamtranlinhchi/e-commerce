// =============================================================================
// Admin Service - Dashboard analytics and admin-specific queries
// =============================================================================

import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@/generated/prisma";

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [revenueResult, totalOrders, totalUsers, totalProducts] =
    await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
      }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
    ]);

  return {
    totalRevenue: Number(revenueResult._sum.totalAmount ?? 0),
    totalOrders,
    totalUsers,
    totalProducts,
  };
}

// ─── Recent Orders ───────────────────────────────────────────────────────────

export async function getRecentOrders(limit = 10) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });
}

// ─── Monthly Revenue (last 12 months) ────────────────────────────────────────

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: twelveMonthsAgo },
      status: { notIn: ["CANCELLED", "REFUNDED"] },
    },
    select: {
      totalAmount: true,
      createdAt: true,
    },
  });

  const monthMap = new Map<string, { revenue: number; orders: number }>();

  // Initialize all 12 months
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, { revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthMap.get(key);
    if (entry) {
      entry.revenue += Number(order.totalAmount);
      entry.orders += 1;
    }
  }

  return Array.from(monthMap.entries()).map(([month, data]) => ({
    month,
    ...data,
  }));
}

// ─── Admin Products ──────────────────────────────────────────────────────────

export interface AdminProductFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}

export async function getAdminProducts(filters: AdminProductFilters = {}) {
  const {
    search,
    categoryId,
    isActive,
    isFeatured,
    page = 1,
    pageSize = 20,
  } = filters;

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (isActive !== undefined) where.isActive = isActive;
  if (isFeatured !== undefined) where.isFeatured = isFeatured;

  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { variants: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
}

// ─── Admin Orders ────────────────────────────────────────────────────────────

export interface AdminOrderFilters {
  status?: OrderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getAdminOrders(filters: AdminOrderFilters = {}) {
  const { status, search, page = 1, pageSize = 20 } = filters;

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, totalItems] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
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

// ─── Admin Users ─────────────────────────────────────────────────────────────

export interface AdminUserFilters {
  search?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}

export async function getAdminUsers(filters: AdminUserFilters = {}) {
  const { search, role, page = 1, pageSize = 20 } = filters;

  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role as Prisma.EnumUserRoleFilter["equals"];

  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
}

// ─── Admin Categories ────────────────────────────────────────────────────────

export async function getAdminCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      parent: { select: { id: true, name: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}
