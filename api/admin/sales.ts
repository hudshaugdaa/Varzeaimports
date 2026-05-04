// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    const sales = await db`
      SELECT id, customer_name, customer_email, total, status, affiliate_ref, pix_transaction_id, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const balanceResult = await db`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'paid'`;
    const pendingResult = await db`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'pending'`;
    const countResult = await db`SELECT COUNT(*) as count FROM orders WHERE status = 'paid'`;

    res.json({
      sales,
      balance: Number(balanceResult[0]?.total || 0),
      pending: Number(pendingResult[0]?.total || 0),
      totalOrders: Number(countResult[0]?.count || 0),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
