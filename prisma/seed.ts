import { PrismaClient, Category, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const PRODUCTS = [
  { name: "Arc Wireless Headphones", sku: "ELEC-001", category: Category.ELECTRONICS, price: 149.99, stock: 42 },
  { name: "Void Mechanical Keyboard", sku: "ELEC-002", category: Category.ELECTRONICS, price: 219.00, stock: 18 },
  { name: "Prism 4K Monitor", sku: "ELEC-003", category: Category.ELECTRONICS, price: 589.00, stock: 7 },
  { name: "Flux USB-C Hub", sku: "ELEC-004", category: Category.ELECTRONICS, price: 64.99, stock: 95 },
  { name: "Onyx Desk Lamp", sku: "HOME-001", category: Category.HOME, price: 89.00, stock: 33 },
  { name: "Grid Storage Shelf", sku: "HOME-002", category: Category.HOME, price: 129.00, stock: 22 },
  { name: "Haze Ceramic Mug Set", sku: "HOME-003", category: Category.HOME, price: 38.00, stock: 60 },
  { name: "Vector Running Shoes", sku: "SPRT-001", category: Category.SPORTS, price: 174.99, stock: 55 },
  { name: "Core Resistance Bands", sku: "SPRT-002", category: Category.SPORTS, price: 29.99, stock: 120 },
  { name: "Apex Yoga Mat", sku: "SPRT-003", category: Category.SPORTS, price: 68.00, stock: 40 },
  { name: "Noir Slim Jacket", sku: "APRL-001", category: Category.APPAREL, price: 210.00, stock: 28 },
  { name: "Phase Cotton Tee", sku: "APRL-002", category: Category.APPAREL, price: 42.00, stock: 85 },
  { name: "Pulse Serum", sku: "BEAU-001", category: Category.BEAUTY, price: 54.00, stock: 70 },
  { name: "Aura SPF Moisturiser", sku: "BEAU-002", category: Category.BEAUTY, price: 38.50, stock: 90 },
  { name: "Raw Protein Blend", sku: "FOOD-001", category: Category.FOOD, price: 49.99, stock: 200 },
];

const CUSTOMERS = [
  { name: "Josephine Igbi", email: "josii@example.com", phone: "+234 801 234 5678", city: "Lagos" },
  { name: "Kofi Mensah", email: "kofi@example.com", phone: "+233 244 567 890", city: "Accra" },
  { name: "Zainab Yusuf", email: "zainab@example.com", phone: "+234 802 345 6789", city: "Abuja" },
  { name: "Emre Demir", email: "emre@example.com", phone: "+90 532 123 4567", city: "Istanbul" },
  { name: "Priya Nair", email: "priya@example.com", phone: "+91 98765 43210", city: "Mumbai" },
  { name: "Lucas Ferreira", email: "lucas@example.com", phone: "+55 11 91234 5678", city: "São Paulo" },
  { name: "Hitomi Tanaka", email: "hitomita@example.com", phone: "+81 90 1234 5678", city: "Tokyo" },
  { name: "Fatima Al-Hassan", email: "fatima@example.com", phone: "+234 803 456 7890", city: "Kano" },
  { name: "Marcus Webb", email: "marcus@example.com", phone: "+1 555 234 5678", city: "Atlanta" },
  { name: "Jon Osaghae", email: "jon@example.com", phone: "+234 805 678 9012", city: "Lagos" },
  { name: "Karen Fukuhara", email: "karen@example.com", phone: "+86 138 0013 8000", city: "Shanghai" },
  { name: "Ingrid Holm", email: "ingrid@example.com", phone: "+47 412 34 567", city: "Oslo" },
];

const STATUSES: OrderStatus[] = [
  OrderStatus.DELIVERED,
  OrderStatus.DELIVERED,
  OrderStatus.DELIVERED,
  OrderStatus.SHIPPED,
  OrderStatus.PROCESSING,
  OrderStatus.PENDING,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
];

async function main() {
  console.log("🌱 Seeding Nexus Dash...");

  // Clear existing
  await prisma.aILog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Admin user
  await prisma.user.create({
    data: {
      name: "Jon Nexus",
      email: "admin@nexus.com",
      role: "ADMIN",
    },
  });

  // Products
  const products = await Promise.all(
    PRODUCTS.map((p) => prisma.product.create({ data: p }))
  );

  // Customers + Orders
  const now = new Date();

  for (const customerData of CUSTOMERS) {
    const orderCount = randomBetween(3, 12);
    let totalSpent = 0;

    const customer = await prisma.customer.create({
      data: { ...customerData, totalOrders: orderCount },
    });

    for (let i = 0; i < orderCount; i++) {
      const daysAgo = randomBetween(1, 180);
      const createdAt = new Date(now.getTime() - daysAgo * 86400000);
      const itemCount = randomBetween(1, 4);
      const selectedProducts = [...products]
        .sort(() => Math.random() - 0.5)
        .slice(0, itemCount);

      const items = selectedProducts.map((p) => ({
        productId: p.id,
        quantity: randomBetween(1, 3),
        unitPrice: p.price,
      }));

      const total = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      totalSpent += total;

      await prisma.order.create({
        data: {
          customerId: customer.id,
          status: pick(STATUSES),
          total: parseFloat(total.toFixed(2)),
          createdAt,
          items: { create: items },
        },
      });
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: { totalSpent: parseFloat(totalSpent.toFixed(2)) },
    });
  }

  const orderCount = await prisma.order.count();
  const customerCount = await prisma.customer.count();
  console.log(`✅ Done — ${customerCount} customers, ${orderCount} orders, ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());