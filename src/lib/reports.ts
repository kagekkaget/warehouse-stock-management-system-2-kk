import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  customers,
  orderItems,
  orders,
  products,
  users,
  wasteLogs,
} from "@/db/schema";
import {
  formatDate,
  formatDateTime,
  PAYMENT_LABEL,
  ORDER_STATUS_LABEL,
  productStockState,
  rupiah,
  STOCK_STATE_META,
  WASTE_REASON_LABEL,
} from "./format";

export type ReportRow = (string | number)[];

export type ReportResult = {
  title: string;
  headers: string[];
  rows: ReportRow[];
  summary: { label: string; value: string }[];
};

function periodCondition(column: any, from?: string, to?: string) {
  const conds = [];
  if (from) conds.push(gte(column, new Date(`${from}T00:00:00`)));
  if (to) conds.push(lte(column, new Date(`${to}T23:59:59`)));
  return conds.length ? and(...conds) : undefined;
}

export async function getInventoryReport(): Promise<ReportResult> {
  const prods = await db.select().from(products).orderBy(asc(products.name));

  let totalValue = 0;
  let totalQty = 0;
  let low = 0;
  let expiring = 0;

  const rows: ReportRow[] = prods.map((p) => {
    const state = productStockState(p);
    const value = p.stock * p.costPrice;
    totalValue += value;
    totalQty += p.stock;
    if (state === "menipis" || state === "habis") low += 1;
    if (state === "hampir-kedaluwarsa" || state === "kedaluwarsa")
      expiring += 1;
    return [
      p.sku,
      p.name,
      p.category,
      `${p.stock} ${p.unit}`,
      p.minStock,
      rupiah(p.costPrice),
      rupiah(p.sellPrice),
      p.expiryDate ? formatDate(p.expiryDate) : "—",
      STOCK_STATE_META[state].label,
      rupiah(value),
    ];
  });

  return {
    title: "Laporan Inventaris Gudang",
    headers: [
      "SKU",
      "Nama Produk",
      "Kategori",
      "Stok",
      "Stok Min.",
      "Harga Beli",
      "Harga Jual",
      "Tgl Kedaluwarsa",
      "Status",
      "Nilai Stok",
    ],
    rows,
    summary: [
      { label: "Jenis Produk", value: String(prods.length) },
      { label: "Total Unit Stok", value: String(totalQty) },
      { label: "Nilai Stok", value: rupiah(totalValue) },
      { label: "Perlu Restok", value: String(low) },
      { label: "Perlu Tindakan ED", value: String(expiring) },
    ],
  };
}

export async function getSalesReport(
  from?: string,
  to?: string
): Promise<ReportResult> {
  const period = periodCondition(orders.createdAt, from, to);
  const orderRows = await db
    .select({
      order: orders,
      customerName: customers.name,
      createdBy: users.name,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(users, eq(orders.createdBy, users.id))
    .where(period)
    .orderBy(desc(orders.createdAt));

  const itemCounts = await db
    .select({
      orderId: orderItems.orderId,
      qty: sql<number>`coalesce(sum(${orderItems.qty}), 0)::int`,
    })
    .from(orderItems)
    .groupBy(orderItems.orderId);
  const qtyByOrder = new Map(itemCounts.map((r) => [r.orderId, r.qty]));

  let revenue = 0;
  let unpaid = 0;
  let active = 0;

  const rows: ReportRow[] = orderRows.map(({ order, customerName, createdBy }) => {
    if (order.status !== "dibatalkan") {
      active += 1;
      revenue += order.total;
      if (order.paymentStatus !== "lunas") unpaid += order.total;
    }
    return [
      order.orderNumber,
      formatDateTime(order.createdAt),
      customerName ?? "—",
      `${qtyByOrder.get(order.id) ?? 0} item`,
      ORDER_STATUS_LABEL[order.status] ?? order.status,
      PAYMENT_LABEL[order.paymentStatus] ?? order.paymentStatus,
      rupiah(order.total),
      createdBy ?? "—",
    ];
  });

  return {
    title: "Laporan Penjualan",
    headers: [
      "No. Pesanan",
      "Tanggal",
      "Pelanggan",
      "Jumlah Item",
      "Status",
      "Pembayaran",
      "Total",
      "Dicatat Oleh",
    ],
    rows,
    summary: [
      { label: "Total Pesanan", value: String(orderRows.length) },
      { label: "Pesanan Aktif", value: String(active) },
      { label: "Omzet", value: rupiah(revenue) },
      { label: "Belum Dibayar", value: rupiah(unpaid) },
    ],
  };
}

export async function getWasteReport(
  from?: string,
  to?: string
): Promise<ReportResult> {
  const period = periodCondition(wasteLogs.createdAt, from, to);
  const logs = await db
    .select({
      log: wasteLogs,
      productName: products.name,
      unit: products.unit,
      userName: users.name,
    })
    .from(wasteLogs)
    .leftJoin(products, eq(wasteLogs.productId, products.id))
    .leftJoin(users, eq(wasteLogs.userId, users.id))
    .where(period)
    .orderBy(desc(wasteLogs.createdAt));

  let totalQty = 0;
  let totalLoss = 0;

  const rows: ReportRow[] = logs.map(({ log, productName, unit, userName }) => {
    totalQty += log.qty;
    totalLoss += log.loss;
    return [
      formatDateTime(log.createdAt),
      productName ?? "—",
      `${log.qty} ${unit ?? "unit"}`,
      WASTE_REASON_LABEL[log.reason] ?? log.reason,
      log.note ?? "—",
      userName ?? "—",
      rupiah(log.loss),
    ];
  });

  return {
    title: "Laporan Limbah / Produk Terbuang",
    headers: [
      "Tanggal",
      "Produk",
      "Jumlah",
      "Alasan",
      "Catatan",
      "Dicatat Oleh",
      "Estimasi Rugi",
    ],
    rows,
    summary: [
      { label: "Kejadian", value: String(logs.length) },
      { label: "Unit Terbuang", value: String(totalQty) },
      { label: "Estimasi Kerugian", value: rupiah(totalLoss) },
    ],
  };
}
