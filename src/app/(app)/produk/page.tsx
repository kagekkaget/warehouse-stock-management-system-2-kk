import { asc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { can, getSessionUser } from "@/lib/auth";
import { ProductsManager } from "@/components/products-manager";

export const metadata = { title: "Produk & Stok — GudangKu" };

export default async function ProdukPage() {
  const user = (await getSessionUser())!;
  const rows = await db.select().from(products).orderBy(asc(products.name));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">
          Produk &amp; Stok
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Kelola inventaris, pantau stok minimum, dan masa kedaluwarsa produk.
        </p>
      </header>
      <ProductsManager
        products={rows.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          unit: p.unit,
          costPrice: p.costPrice,
          sellPrice: p.sellPrice,
          stock: p.stock,
          minStock: p.minStock,
          expiryDate: p.expiryDate,
          supplier: p.supplier,
        }))}
        canManage={can.manageProducts(user.role)}
      />
    </div>
  );
}
