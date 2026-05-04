// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";

const PUSHINPAY_BASE = "https://api.pushinpay.com.br/api/pix";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido" });

  const token = process.env.PUSHINPAY_TOKEN;
  if (!token) return res.status(500).json({ error: "PUSHINPAY_TOKEN não configurado" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "ID da transação obrigatório" });

  try {
    const pixRes = await fetch(`${PUSHINPAY_BASE}/cashIn/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!pixRes.ok) {
      const err = await pixRes.text();
      return res.status(pixRes.status).json({ error: `PushinPay: ${err}` });
    }

    const data = await pixRes.json();
    const isPaid = data.status === "paid" || data.status === "completed" || data.status === "approved";

    if (isPaid) {
      try {
        const { getDb } = await import("../db");
        const db = getDb();
        await db`UPDATE orders SET status = 'paid', updated_at = NOW() WHERE pix_transaction_id = ${String(id)} AND status != 'paid'`;
      } catch {}
    }

    res.json({
      id: data.id || id,
      status: isPaid ? "paid" : data.status === "created" ? "pending" : (data.status || "pending"),
      qr_code: data.qr_code,
      qr_code_base64: data.qr_code_base64,
      value: data.value,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
