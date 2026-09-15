import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { customers, orderItems, orders, products } from "@/db/schema";
import { can, getSessionUser } from "@/lib/auth";
import { OrdersManager } from "@/components/orders-manager";

export const metadata = { title: "Pesanan — GudangKu" };

export default async function PesananPage() {
  const user = (await getSessionUser())!;

  const orderRows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      createdAt: orders.createdAt,
      total: orders.total,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      customerId: orders.customerId,
      customerName: customers.name,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .orderBy(desc(orders.createdAt));

  const itemCounts = await db
    .select({
      orderId: orderItems.orderId,
      qty: sql<number>`coalesce(sum(${orderItems.qty}), 0)::int`,
    })
    .from(orderItems)
    .groupBy(orderItems.orderId);
  const qtyMap = new Map(itemCounts.map((r) => [r.orderId, r.qty]));

  const [productRows, customerRows] = await Promise.all([
    db.select().from(products).orderBy(asc(products.name)),
    db.select().from(customers).orderBy(asc(customers.name)),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Pesanan</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Catat penjualan ke pelanggan — stok gudang berkurang otomatis dan
          tercatat sebagai barang keluar.
        </p>
      </header>
      <OrdersManager
        orders={orderRows.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          createdAt: o.createdAt.toISOString(),
          customerName: o.customerName ?? "—",
          customerId: o.customerId,
          total: o.total,
          status: o.status,
          paymentStatus: o.paymentStatus,
          itemCount: qtyMap.get(o.id) ?? 0,
        }))}
        products={productRows.map((p) => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          sellPrice: p.sellPrice,
          unit: p.unit,
        }))}
        customers={customerRows.map((c) => ({ id: c.id, name: c.name }))}
        canDelete={can.deleteOrder(user.role)}
        canCreate={can.createOrder(user.role)}
      />
    </div>
  );
}
