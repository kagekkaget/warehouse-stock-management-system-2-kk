/* Seed awal: pengguna demo + data contoh warung. Jalankan: npx tsx src/db/seed.ts */
import "dotenv/config";
import { hashSync } from "bcryptjs";
import { db } from "./index";
import {
  customers,
  orderItems,
  orders,
  products,
  stockMovements,
  users,
  wasteLogs,
} from "./schema";

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function daysAgo(days: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 15, 0, 0);
  return d;
}

async function main() {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length) {
    console.log("Seed dilewati — data sudah ada.");
    return;
  }

  const [owner, manager, staff] = await db
    .insert(users)
    .values([
      {
        name: "Bu Hartini",
        email: "owner@gudangku.id",
        passwordHash: hashSync("owner123", 10),
        role: "owner",
      },
      {
        name: "Pak Bambang",
        email: "manager@gudangku.id",
        passwordHash: hashSync("manager123", 10),
        role: "manager",
      },
      {
        name: "Rina Maulida",
        email: "staff@gudangku.id",
        passwordHash: hashSync("staff123", 10),
        role: "staff",
      },
    ])
    .returning();

  const seededProducts = await db
    .insert(products)
    .values([
      {
        name: "Beras Premium 5kg",
        sku: "SMB-BRS-5",
        category: "Sembako",
        unit: "bungkus",
        costPrice: 68000,
        sellPrice: 75000,
        stock: 24,
        minStock: 8,
        expiryDate: addDays(240),
        supplier: "CV Sumber Pangan",
      },
      {
        name: "Minyak Goreng Sania 1L",
        sku: "SMB-MNY-1",
        category: "Sembako",
        unit: "botol",
        costPrice: 16500,
        sellPrice: 19000,
        stock: 6,
        minStock: 12,
        expiryDate: addDays(300),
        supplier: "CV Sumber Pangan",
      },
      {
        name: "Gula Pasir Gulaku 1kg",
        sku: "SMB-GLA-1",
        category: "Sembako",
        unit: "bungkus",
        costPrice: 15500,
        sellPrice: 18000,
        stock: 18,
        minStock: 10,
        expiryDate: addDays(400),
        supplier: "CV Sumber Pangan",
      },
      {
        name: "Telur Ayam 1kg",
        sku: "SMB-TLR-1",
        category: "Sembako",
        unit: "kg",
        costPrice: 26000,
        sellPrice: 29500,
        stock: 4,
        minStock: 6,
        expiryDate: addDays(9),
        supplier: "Pak Slamet Farm",
      },
      {
        name: "Indomie Goreng",
        sku: "MKN-IDM-GR",
        category: "Makanan Ringan",
        unit: "pcs",
        costPrice: 2900,
        sellPrice: 3500,
        stock: 140,
        minStock: 40,
        expiryDate: addDays(160),
        supplier: "PT Indofood Distributor",
      },
      {
        name: "Roti Tawar Sari Roti",
        sku: "MKN-RTI-TW",
        category: "Makanan Ringan",
        unit: "bungkus",
        costPrice: 13500,
        sellPrice: 16000,
        stock: 5,
        minStock: 4,
        expiryDate: addDays(-2),
        supplier: "Agen Sari Roti",
      },
      {
        name: "Susu UHT Ultra 1L",
        sku: "MNM-SUS-1",
        category: "Minuman",
        unit: "kotak",
        costPrice: 17000,
        sellPrice: 20000,
        stock: 11,
        minStock: 8,
        expiryDate: addDays(45),
        supplier: "PT Ultrajaya Depo",
      },
      {
        name: "Kopi Kapal Api 165g",
        sku: "MNM-KOP-KA",
        category: "Minuman",
        unit: "bungkus",
        costPrice: 12500,
        sellPrice: 14500,
        stock: 3,
        minStock: 10,
        expiryDate: addDays(200),
        supplier: "PT Santos Jaya Abadi",
      },
      {
        name: "Teh Botol Sosro 350ml",
        sku: "MNM-TBS-350",
        category: "Minuman",
        unit: "botol",
        costPrice: 3200,
        sellPrice: 4000,
        stock: 48,
        minStock: 24,
        expiryDate: addDays(12),
        supplier: "Depo Sinar Sosro",
      },
      {
        name: "Air Mineral Aqua 600ml",
        sku: "MNM-AQA-600",
        category: "Minuman",
        unit: "botol",
        costPrice: 2500,
        sellPrice: 3500,
        stock: 96,
        minStock: 30,
        expiryDate: addDays(365),
        supplier: "Agen Aqua Bu Yanti",
      },
      {
        name: "Sabun Mandi Lifebuoy 110g",
        sku: "PRW-LFB-110",
        category: "Perawatan & Kebersihan",
        unit: "pcs",
        costPrice: 4200,
        sellPrice: 5500,
        stock: 22,
        minStock: 10,
        expiryDate: null,
        supplier: "Unilever Distributor",
      },
      {
        name: "Kecap Bango 275ml",
        sku: "SMB-KCP-BG",
        category: "Sembako",
        unit: "botol",
        costPrice: 11500,
        sellPrice: 13500,
        stock: 7,
        minStock: 8,
        expiryDate: addDays(6),
        supplier: "Unilever Distributor",
      },
    ])
    .returning();

  const p = (sku: string) => seededProducts.find((x) => x.sku === sku)!;

  const seededCustomers = await db
    .insert(customers)
    .values([
      {
        name: "Warung Bu Sri",
        phone: "0812-3456-7801",
        email: "warungbusri@gmail.com",
        address: "Jl. Melati No. 12, RT 03/RW 05",
        preferences: "Langganan kopi & mie, kirim tiap Senin pagi",
      },
      {
        name: "Toko Maju Jaya",
        phone: "0813-9922-1144",
        email: null,
        address: "Pasar Induk Blok C-7",
        preferences: "Bayar tempo 3 hari, ambil sendiri",
      },
      {
        name: "Katering Dedi",
        phone: "0857-1188-2299",
        email: "kateringdedi@yahoo.com",
        address: "Jl. Kenanga Raya No. 3",
        preferences: "Butuh beras & minyak jumlah besar tiap Kamis",
      },
      {
        name: "Ibu Ratna",
        phone: "0821-5566-7788",
        email: null,
        address: "Perum Griya Asri B-14",
        preferences: "Suka produk mendekati diskon",
      },
      {
        name: "Minimarket Cerah",
        phone: "021-7788-9900",
        email: "purchasing@cerahmart.id",
        address: "Jl. Raya Bogor KM 28",
        preferences: "PO resmi, pembayaran transfer H+7",
      },
    ])
    .returning();

  const c = (name: string) => seededCustomers.find((x) => x.name === name)!;

  // --- Orders + items + stock movements ---
  const orderDefs = [
    {
      customer: c("Warung Bu Sri"),
      days: 18,
      payment: "lunas",
      status: "selesai",
      items: [
        { sku: "MKN-IDM-GR", qty: 20 },
        { sku: "MNM-KOP-KA", qty: 4 },
      ],
    },
    {
      customer: c("Toko Maju Jaya"),
      days: 15,
      payment: "lunas",
      status: "selesai",
      items: [
        { sku: "SMB-BRS-5", qty: 5 },
        { sku: "SMB-GLA-1", qty: 6 },
      ],
    },
    {
      customer: c("Katering Dedi"),
      days: 11,
      payment: "dp",
      status: "selesai",
      items: [
        { sku: "SMB-BRS-5", qty: 8 },
        { sku: "SMB-MNY-1", qty: 6 },
      ],
    },
    {
      customer: c("Minimarket Cerah"),
      days: 8,
      payment: "belum_bayar",
      status: "selesai",
      items: [
        { sku: "MNM-AQA-600", qty: 48 },
        { sku: "MNM-TBS-350", qty: 24 },
        { sku: "MKN-IDM-GR", qty: 40 },
      ],
    },
    {
      customer: c("Ibu Ratna"),
      days: 5,
      payment: "lunas",
      status: "selesai",
      items: [
        { sku: "SMB-TLR-1", qty: 2 },
        { sku: "MNM-SUS-1", qty: 2 },
        { sku: "MKN-RTI-TW", qty: 2 },
      ],
    },
    {
      customer: c("Warung Bu Sri"),
      days: 2,
      payment: "belum_bayar",
      status: "diproses",
      items: [
        { sku: "MNM-KOP-KA", qty: 6 },
        { sku: "SMB-KCP-BG", qty: 3 },
      ],
    },
    {
      customer: c("Katering Dedi"),
      days: 1,
      payment: "lunas",
      status: "diproses",
      items: [
        { sku: "SMB-BRS-5", qty: 4 },
        { sku: "SMB-MNY-1", qty: 4 },
        { sku: "SMB-TLR-1", qty: 3 },
      ],
    },
  ];

  for (const def of orderDefs) {
    const createdAt = daysAgo(def.days);
    const orderNumber = `INV-${(Date.now() - def.days * 86400000)
      .toString(36)
      .toUpperCase()}`;
    let total = 0;
    const itemRows = def.items.map((it) => {
      const prod = p(it.sku);
      const subtotal = prod.sellPrice * it.qty;
      total += subtotal;
      return {
        productId: prod.id,
        productName: prod.name,
        qty: it.qty,
        price: prod.sellPrice,
        subtotal,
      };
    });

    const inserted = await db
      .insert(orders)
      .values({
        orderNumber,
        customerId: def.customer.id,
        status: def.status,
        paymentStatus: def.payment,
        total,
        notes: null,
        createdBy: manager.id,
        createdAt,
      })
      .returning();

    await db.insert(orderItems).values(
      itemRows.map((r) => ({ ...r, orderId: inserted[0].id }))
    );

    for (const it of def.items) {
      const prod = p(it.sku);
      await db.insert(stockMovements).values({
        productId: prod.id,
        type: "keluar",
        qty: it.qty,
        note: `Penjualan ${orderNumber}`,
        userId: manager.id,
        createdAt,
      });
    }
  }

  // --- Incoming stock movements ---
  await db.insert(stockMovements).values([
    {
      productId: p("SMB-BRS-5").id,
      type: "masuk",
      qty: 30,
      note: "Restok dari CV Sumber Pangan",
      userId: staff.id,
      createdAt: daysAgo(20, 9),
    },
    {
      productId: p("MKN-IDM-GR").id,
      type: "masuk",
      qty: 100,
      note: "Kiriman bulanan PT Indofood",
      userId: staff.id,
      createdAt: daysAgo(14, 8),
    },
    {
      productId: p("MNM-AQA-600").id,
      type: "masuk",
      qty: 60,
      note: "Restok agen Bu Yanti",
      userId: manager.id,
      createdAt: daysAgo(6, 13),
    },
  ]);

  // --- Waste logs ---
  await db.insert(wasteLogs).values([
    {
      productId: p("MKN-RTI-TW").id,
      qty: 4,
      reason: "kedaluwarsa",
      note: "Roti tidak terjual sampai masa ED",
      loss: 4 * p("MKN-RTI-TW").costPrice,
      userId: manager.id,
      createdAt: daysAgo(3, 17),
    },
    {
      productId: p("MNM-SUS-1").id,
      qty: 1,
      reason: "rusak",
      note: "Kemasan bocor saat diturunkan dari rak",
      loss: 1 * p("MNM-SUS-1").costPrice,
      userId: staff.id,
      createdAt: daysAgo(7, 11),
    },
  ]);

  console.log("Seed selesai: 3 pengguna, %d produk, %d pelanggan.", seededProducts.length, seededCustomers.length);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
