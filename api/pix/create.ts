import type { VercelRequest, VercelResponse } from "@vercel/node";

const PUSHINPAY_BASE = "https://api.pushinpay.com.br/api/pix";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const token = process.env.PUSHINPAY_TOKEN;
  if (!token) return res.status(500).json({ error: "PUSHINPAY_TOKEN não configurado na Vercel" });

  const { amount, customer, items, address, affiliateRef } = req.body || {};
  if (!amount || amount <= 0) return res.status(400).json({ error: "Valor inválido" });

  if (amount > 150) {
    return res.status(400).json({
      error: "Valor acima do limite",
      code: "LIMIT_EXCEEDED",
      message: "O valor máximo por pedido via PIX é R$ 150,00. Por favor, remova alguns itens e faça um novo pedido.",
    });
  }

  try {
    const amountInCents = Math.round(amount * 100);
    const webhookUrl = process.env.PUSHINPAY_WEBHOOK_URL || null;

    const body: Record<string, unknown> = { value: amountInCents, webhook_url: webhookUrl };

    const pixRes = await fetch(`${PUSHINPAY_BASE}/cashIn`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!pixRes.ok) {
      const err = await pixRes.text();
      return res.status(pixRes.status).json({ error: `PushinPay: ${err}` });
    }

    const data = await pixRes.json();

    try {
      const { getDb } = await import("../db");
      const db = getDb();
      if (customer) {
        const itemsJson = JSON.stringify(items || []);
        const addressJson = address ? JSON.stringify(address) : null;

        await db`
          INSERT INTO orders (
            customer_name, customer_email, customer_cpf, customer_phone,
            items, address, total, status, affiliate_ref, pix_transaction_id
          )
          VALUES (
            ${customer.name || ""},
            ${customer.email || ""},
            ${customer.cpf || ""},
            ${customer.phone || ""},
            ${itemsJson}::jsonb,
            ${addressJson}::jsonb,
            ${amount},
            'pending',
            ${affiliateRef || null},
            ${data.id}
          )
        `;
      }
    } catch {}

    res.json({
      id: data.id,
      status: data.status === "created" ? "pending" : data.status,
      qr_code: data.qr_code,
      qr_code_base64: data.qr_code_base64,
      value: data.value,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
