import {
  ApiError,
  can,
  handleApiError,
  requireUser,
} from "@/lib/auth";
import { toCSV } from "@/lib/format";
import {
  getInventoryReport,
  getSalesReport,
  getWasteReport,
  type ReportResult,
} from "@/lib/reports";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (!can.exportReports(user.role)) {
      throw new ApiError(403, "Hanya pemilik/manajer yang dapat mengekspor laporan.");
    }
    const url = new URL(req.url);
    const type = url.searchParams.get("type") ?? "";
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    let report: ReportResult;
    let slug: string;
    if (type === "inventory") {
      report = await getInventoryReport();
      slug = "laporan-inventaris";
    } else if (type === "sales") {
      report = await getSalesReport(from, to);
      slug = "laporan-penjualan";
    } else if (type === "waste") {
      report = await getWasteReport(from, to);
      slug = "laporan-limbah";
    } else {
      throw new ApiError(400, "Jenis laporan tidak valid.");
    }

    const csv = toCSV(report.headers, report.rows);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    return handleApiError(err);
  }
}
