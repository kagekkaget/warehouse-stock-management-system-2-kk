import { desc, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { customers, orderItems, orders } from "@/db/schema";
import { can, getSessionUser } from "@/lib/auth";
import { CustomerDetail } from "@/components/customer-detail";

export const metadata = { title: "Detail Pelanggan — GudangKu" };

export default async function PelangganDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = (await getSessionUser())!;
  const { id } = await params;
  const cid = Number(id);
  if (!Number.isInteger(cid) || cid <= 0) notFound();

  const rows = await db
    .select()
    .from(customers)
    .where(eq(customers.id, cid))
    .limit(1);
  if (!rows.length) notFound();
  const customer = rows[0];

  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, cid))
    .orderBy(desc(orders.createdAt));

  const items = orderRows.length
    ? await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderRows.map((o) => o.id)))
    : [];

  const totalSpend = orderRows
    .filter((o) => o.status !== "dibatalkan")
    .reduce((s, o) => s + o.total, 0);

  return (
    <CustomerDetail
      customer={{
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        preferences: customer.preferences,
        orderCount: orderRows.length,
        totalSpend,
      }}
      orders={orderRows.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt.toISOString(),
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        notes: o.notes,
        items: items
          .filter((it) => it.orderId === o.id)
          .map((it) => ({
            productName: it.productName,
            qty: it.qty,
            subtotal: it.subtotal,
          })),
      }))}
      canEdit={can.editCustomer(user.role)}
      canDelete={can.deleteCustomer(user.role)}
    />
  );
}
