// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    if (req.method === "GET") {
      const withdrawals = await db`
        SELECT w.*, a.name as affiliate_name, a.email as affiliate_email, a.ref_code
        FROM affiliate_withdrawals w
        JOIN affiliates a ON w.affiliate_id = a.id
        ORDER BY w.requested_at DESC
      `;
      return res.json({ withdrawals });
    }

    if (req.method === "POST") {
      const { id, action } = req.body || {};
      if (!id || !action) return res.status(400).json({ error: "id e action obrigatórios" });
      if (action !== "approve" && action !== "reject") return res.status(400).json({ error: "action deve ser approve ou reject" });

      const withdrawals = await db`SELECT * FROM affiliate_withdrawals WHERE id = ${id} LIMIT 1`;
      if (withdrawals.length === 0) return res.status(404).json({ error: "Saque não encontrado" });

      const withdrawal = withdrawals[0];

      if (action === "approve") {
        await db`
          UPDATE affiliate_withdrawals SET status = 'approved', processed_at = NOW() WHERE id = ${id}
        `;
        await db`
          UPDATE affiliates SET balance = balance - ${withdrawal.amount} WHERE id = ${withdrawal.affiliate_id}
        `;
        return res.json({ success: true, message: "Saque aprovado. Desconto aplicado no saldo do afiliado." });
      } else {
        await db`
          UPDATE affiliate_withdrawals SET status = 'rejected', processed_at = NOW() WHERE id = ${id}
        `;
        return res.json({ success: true, message: "Saque reprovado." });
      }
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
