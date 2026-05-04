import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido" });

  const { affiliateId } = req.query;
  if (!affiliateId) return res.status(400).json({ error: "affiliateId obrigatório" });

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    const sales = await db`
      SELECT s.*, o.customer_name, o.total as order_total, o.status as order_status, o.created_at as order_date
      FROM affiliate_sales s
      JOIN orders o ON s.order_id = o.id
      WHERE s.affiliate_id = ${Number(affiliateId)}
      ORDER BY s.created_at DESC
    `;

    const affiliate = await db`SELECT balance, pix_key, pix_name, pix_cpf FROM affiliates WHERE id = ${Number(affiliateId)} LIMIT 1`;

    const totalSales = sales.length;
    const totalCommission = sales.reduce((sum: number, s: { commission: string }) => sum + Number(s.commission), 0);

    res.json({
      sales,
      totalSales,
      totalCommission,
      balance: affiliate[0]?.balance || 0,
      hasPixConfigured: !!affiliate[0]?.pix_key,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
