import { asc } from "drizzle-orm";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { can, getSessionUser } from "@/lib/auth";
import { CustomersManager } from "@/components/customers-manager";

export const metadata = { title: "Pelanggan — GudangKu" };

export default async function PelangganPage() {
  const user = (await getSessionUser())!;
  const [customerRows, orderRows] = await Promise.all([
    db.select().from(customers).orderBy(asc(customers.name)),
    db
      .select({
        customerId: orders.customerId,
        total: orders.total,
        status: orders.status,
      })
      .from(orders),
  ]);

  const stats = new Map<number, { count: number; spend: number }>();
  for (const o of orderRows) {
    const s = stats.get(o.customerId) ?? { count: 0, spend: 0 };
    s.count += 1;
    if (o.status !== "dibatalkan") s.spend += o.total;
    stats.set(o.customerId, s);
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Pelanggan</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Profil pelanggan, preferensi belanja, dan ringkasan transaksi.
        </p>
      </header>
      <CustomersManager
        customers={customerRows.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          address: c.address,
          preferences: c.preferences,
          orderCount: stats.get(c.id)?.count ?? 0,
          totalSpend: stats.get(c.id)?.spend ?? 0,
        }))}
        canEdit={can.editCustomer(user.role)}
      />
    </div>
  );
}
