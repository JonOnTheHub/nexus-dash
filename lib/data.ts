import { prisma } from "@/lib/prisma";

// ─── Overview metrics ───────────────────────────────────────────

export async function getOverviewMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

  const [
    currentRevenue,
    previousRevenue,
    currentOrders,
    previousOrders,
    totalCustomers,
    newCustomers,
    lowStockCount,
  ] = await Promise.all([
    // Revenue last 30 days
    prisma.order.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      _sum: { total: true },
    }),
    // Revenue previous 30 days
    prisma.order.aggregate({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      _sum: { total: true },
    }),
    // Orders last 30 days
    prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    // Orders previous 30 days
    prisma.order.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    // Total customers
    prisma.customer.count(),
    // New customers last 30 days
    prisma.customer.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    // Low stock products (under 10 units)
    prisma.product.count({
      where: { stock: { lte: 10 }, isActive: true },
    }),
  ]);

  const rev = currentRevenue._sum.total ?? 0;
  const prevRev = previousRevenue._sum.total ?? 0;
  const revDelta = prevRev > 0 ? ((rev - prevRev) / prevRev) * 100 : 0;
  const orderDelta =
    previousOrders > 0
      ? ((currentOrders - previousOrders) / previousOrders) * 100
      : 0;

  return {
    revenue: rev,
    revenueDelta: parseFloat(revDelta.toFixed(1)),
    orders: currentOrders,
    ordersDelta: parseFloat(orderDelta.toFixed(1)),
    customers: totalCustomers,
    newCustomers,
    lowStock: lowStockCount,
  };
}

// ─── Revenue chart (last 30 days, daily) ────────────────────────

export async function getRevenueChart() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      status: { notIn: ["CANCELLED", "REFUNDED"] },
    },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Build a map of date → { revenue, orders }
  const map = new Map<string, { revenue: number; orders: number }>();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const existing = map.get(key);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    }
  }

  return Array.from(map.entries()).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: parseFloat(data.revenue.toFixed(2)),
    orders: data.orders,
  }));
}

// ─── Recent orders ───────────────────────────────────────────────

export async function getRecentOrders(limit = 8) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, email: true } },
      items: { select: { quantity: true, unitPrice: true } },
    },
  });
}

// ─── All orders (paginated) ──────────────────────────────────────

export async function getOrders({
  page = 1,
  limit = 20,
  status,
}: {
  page?: number;
  limit?: number;
  status?: string;
} = {}) {
  const where = status ? { status: status as never } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true, city: true } },
        items: { select: { quantity: true, unitPrice: true, product: { select: { name: true } } } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, pages: Math.ceil(total / limit) };
}

// ─── Products ────────────────────────────────────────────────────

export async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orderItems: true } },
    },
  });
}

// ─── Customers ───────────────────────────────────────────────────

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { totalSpent: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });
}

// ─── Top products by revenue ─────────────────────────────────────

export async function getTopProducts(limit = 5) {
  const items = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { unitPrice: true, quantity: true },
    orderBy: { _sum: { unitPrice: "desc" } },
    take: limit,
  });

  const ids = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
  });

  return items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      name: product?.name ?? "Unknown",
      sku: product?.sku ?? "",
      revenue: (item._sum.unitPrice ?? 0) * (item._sum.quantity ?? 1),
      units: item._sum.quantity ?? 0,
    };
  });
}

// ─── Order status breakdown ──────────────────────────────────────

export async function getOrderStatusBreakdown() {
  const grouped = await prisma.order.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return grouped.map((g) => ({
    status: g.status,
    count: g._count.status,
  }));
}