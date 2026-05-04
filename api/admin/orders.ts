import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    const { status, search, limit = "100" } = req.query as Record<string, string>;

    let orders;

    if (search) {
      orders = await db`
        SELECT id, customer_name, customer_email, customer_cpf, customer_phone,
               items, address, total, status, affiliate_ref, pix_transaction_id, created_at, updated_at
        FROM orders
        WHERE
          customer_name ILIKE ${"%" + search + "%"}
          OR customer_email ILIKE ${"%" + search + "%"}
          OR customer_cpf ILIKE ${"%" + search + "%"}
        ORDER BY created_at DESC
        LIMIT ${Number(limit)}
      `;
    } else if (status && status !== "all") {
      orders = await db`
        SELECT id, customer_name, customer_email, customer_cpf, customer_phone,
               items, address, total, status, affiliate_ref, pix_transaction_id, created_at, updated_at
        FROM orders
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT ${Number(limit)}
      `;
    } else {
      orders = await db`
        SELECT id, customer_name, customer_email, customer_cpf, customer_phone,
               items, address, total, status, affiliate_ref, pix_transaction_id, created_at, updated_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT ${Number(limit)}
      `;
    }

    const stats = await db`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'paid') as paid,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COALESCE(SUM(total) FILTER (WHERE status = 'paid'), 0) as revenue
      FROM orders
    `;

    res.json({ orders, stats: stats[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
