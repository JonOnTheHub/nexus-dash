import { prisma } from "@/lib/prisma";

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

// Realistic first + last name pools
const FIRST_NAMES = [
  "Amara", "Kofi", "Zainab", "Emre", "Priya", "Lucas", "Hitomi", "Fatima",
  "Marcus", "Ingrid", "Chen", "Yuki", "Omar", "Sofia", "Kwame", "Aisha",
  "Dmitri", "Layla", "Thragg", "Nkechi", "Henry", "Elif", "Soren", "Adaeze",
  "Henrik", "Yemi", "Cleo", "Tariq", "Ese", "Jide", "Astrid", "Babajide",
  "Ibrahim", "Oge", "Luca", "Kimiko", "Mateo", "Zara", "Hassan",
  "Amina", "Leo", "Anika", "Jasper", "Malik", "Esme", "Billy",
  "Salma", "Arjun", "Freja", "Isak", "Nadia", "Oluwaseun",
  "Karim", "Elena", "Samir", "Ngozi", "Tunde", "Leila",
  "Hugo", "Naomi", "Mark", "Farah"
];

const LAST_NAMES = [
  "Osei", "Mensah", "Yusuf", "Demir", "Nair", "Ferreira", "Tanaka", "Webb",
  "Holm", "Wei", "Nakamura", "Hassan", "Petrov", "Reyes", "Asante", "Müller",
  "Johansson", "Adeyemi", "Okonkwo", "Singh", "Andersen", "Kimura", "Bakr",
  "Diallo", "Eriksen", "Abubakar", "Itua", "Fernandez", "Okoro", "Patel",
  "Garcia", "Silva", "Ibrahim", "Khan", "Ali", "Nguyen", "Hernandez",
  "Lopez", "Gonzalez", "Dangote", "Costa", "Rossi", "Bianchi",
  "Moreau", "Dubois", "Schmidt", "Kowalski", "Novak",
  "Popov", "Obi", "Suleiman", "Okafor", "Balogun",
  "Eze", "Chowdhury", "Rahman", "Sato", "Yamamoto",
  "Park", "Choi"
];

const CITIES = [
  "Lagos", "Accra", "Abuja", "Nairobi", "Kano", "Cape Town", "Istanbul",
  "Mumbai", "São Paulo", "Atlanta", "Tokyo", "Oslo", "Shanghai", "London",
  "Dubai", "Amsterdam", "Berlin", "Toronto", "Singapore", "Johannesburg",
  "Paris", "Madrid", "Rome", "Barcelona", "Milan", "Zurich",
  "Vienna", "Brussels", "Copenhagen", "Stockholm", "Helsinki",
  "Dublin", "Lisbon", "Prague", "Warsaw", "Budapest",
  "Doha", "Riyadh", "Kuala Lumpur", "Maitama", "Jakarta",
  "Manila", "Seoul", "Beijing", "Hong Kong", "Sydney",
  "Melbourne", "Auckland", "Vancouver", "Montreal"
];

const STATUSES = [
  "DELIVERED", "DELIVERED",
  "SHIPPED", "SHIPPED",
  "PROCESSING",
  "PENDING",
  "CANCELLED",
  "REFUNDED",
] as const;

function generateEmail(first: string, last: string): string {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com", "proton.me"];
  const variants = [
    `${first.toLowerCase()}.${last.toLowerCase()}`,
    `${first.toLowerCase()}${randomBetween(10, 999)}`,
    `${last.toLowerCase()}.${first.charAt(0).toLowerCase()}`,
  ];
  return `${pick(variants)}@${pick(domains)}`;
}

export async function runSimulatorTick() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ select: { id: true } }),
    prisma.product.findMany({
      where: { isActive: true, stock: { gt: 2 } },
      select: { id: true, price: true, stock: true, name: true },
    }),
  ]);

  if (!products.length) return { skipped: true, reason: "no stock" };

  const results: string[] = [];

  // ── 1. Maybe create a new customer (25% chance per tick) ──
  if (Math.random() < 0.25) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const email = generateEmail(first, last);

    // avoid duplicate emails
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (!existing) {
      await prisma.customer.create({
        data: {
          name: `${first} ${last}`,
          email,
          phone: null,
          city: pick(CITIES),
          totalOrders: 0,
          totalSpent: 0,
        },
      });
      results.push("new_customer");
    }
  }

  // Refresh customer list after possible addition
  const allCustomers = await prisma.customer.findMany({
    select: { id: true },
  });

  if (!allCustomers.length) return { skipped: true, reason: "no customers" };

  // ── 2. Conservative order volume ──
  // 60% chance of 1 order, 25% chance of 2, 15% chance of 0
  const roll = Math.random();
  const orderCount = roll < 0.15 ? 0 : roll < 0.75 ? 1 : 2;

  for (let i = 0; i < orderCount; i++) {
    const customer = pick(allCustomers);

    // 1-2 items per order (conservative)
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, randomBetween(1, 2));

    const items = selected.map((p) => ({
      productId: p.id,
      quantity: 1, // almost always 1 unit, occasionally 2
      unitPrice: p.price,
    }));

    // Occasionally qty 2
    if (Math.random() < 0.15 && items.length > 0) {
      items[0].quantity = 2;
    }

    const total = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: pick(STATUSES),
        total: parseFloat(total.toFixed(2)),
        items: { create: items },
      },
    });

    // Decrement stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Update customer totals
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: parseFloat(total.toFixed(2)) },
      },
    });

    results.push(order.id);
  }

  // ── 3. Realistic price variance (±2% on random product, 20% chance) ──
  if (Math.random() < 0.2 && products.length > 0) {
    const product = pick(products);
    const delta = randomFloat(-0.02, 0.02); // -2% to +2%
    const newPrice = parseFloat((product.price * (1 + delta)).toFixed(2));
    // Clamp to ±15% of original to prevent drift
    const minPrice = product.price * 0.85;
    const maxPrice = product.price * 1.15;
    const clamped = Math.min(Math.max(newPrice, minPrice), maxPrice);

    await prisma.product.update({
      where: { id: product.id },
      data: { price: clamped },
    });

    results.push(`price_adjusted:${product.name}`);
  }

  // ── 4. Restock only critically low items (≤5 units, 25% chance) ──
  const criticalStock = await prisma.product.findMany({
    where: { stock: { lte: 5 }, isActive: true },
    select: { id: true, name: true },
  });

  if (criticalStock.length > 0 && Math.random() < 0.25) {
    const toRestock = pick(criticalStock);
    await prisma.product.update({
      where: { id: toRestock.id },
      data: { stock: { increment: randomBetween(10, 25) } },
    });
    results.push(`restocked:${toRestock.name}`);
  }

  return {
    results,
    orderCount,
    timestamp: new Date(),
  };
}