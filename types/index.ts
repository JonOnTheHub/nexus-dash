import type { Order, Customer, Product, OrderItem, OrderStatus, Category } from "@prisma/client";

export type { OrderStatus, Category };

export type OrderWithCustomer = Order & {
  customer: Customer;
  items: OrderItem[];
};

export type ProductWithStats = Product & {
  _count?: { orderItems: number };
  revenue?: number;
};

export type CustomerWithOrders = Customer & {
  orders: Order[];
};

export type MetricCard = {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  trend?: "up" | "down" | "neutral";
};

export type RevenueDataPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type AIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};