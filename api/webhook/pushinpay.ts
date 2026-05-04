// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const expectedToken = process.env.PUSHINPAY_WEBHOOK_TOKEN;
  if (expectedToken) {
    const receivedToken = req.headers["x-pushinpay-token"];
    if (receivedToken !== expectedToken) {
      return res.status(401).json({ error: "Token inválido" });
    }
  }

  try {
    const { id, status } = req.body || {};
    if (!id) return res.status(400).json({ error: "ID ausente" });

    const isPaid = status === "paid" || status === "completed" || status === "approved";

    if (isPaid) {
      const { getDb } = await import("../db");
      const db = getDb();

      const orders = await db`SELECT * FROM orders WHERE pix_transaction_id = ${String(id)} LIMIT 1`;
      if (orders.length > 0) {
        const order = orders[0];
        await db`UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = ${order.id}`;

        if (order.affiliate_ref) {
          const affiliates = await db`SELECT * FROM affiliates WHERE ref_code = ${order.affiliate_ref} LIMIT 1`;
          if (affiliates.length > 0) {
            const affiliate = affiliates[0];
            const commission = (Number(order.total) * Number(affiliate.percentage)) / 100;
            await db`
              INSERT INTO affiliate_sales (affiliate_id, order_id, amount, commission)
              VALUES (${affiliate.id}, ${order.id}, ${order.total}, ${commission})
            `;
            await db`
              UPDATE affiliates SET balance = balance + ${commission} WHERE id = ${affiliate.id}
            `;
          }
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
