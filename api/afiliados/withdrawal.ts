import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { affiliateId, amount } = req.body || {};
  if (!affiliateId || !amount) return res.status(400).json({ error: "affiliateId e amount obrigatórios" });
  if (amount <= 0) return res.status(400).json({ error: "Valor inválido" });

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    const affiliates = await db`SELECT * FROM affiliates WHERE id = ${Number(affiliateId)} LIMIT 1`;
    if (affiliates.length === 0) return res.status(404).json({ error: "Afiliado não encontrado" });

    const affiliate = affiliates[0];

    if (!affiliate.pix_key) {
      return res.status(400).json({
        error: "PIX não configurado",
        code: "PIX_NOT_CONFIGURED",
        message: "Configure sua chave PIX antes de solicitar um saque.",
      });
    }

    if (Number(affiliate.balance) < Number(amount)) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    const pending = await db`
      SELECT id FROM affiliate_withdrawals
      WHERE affiliate_id = ${Number(affiliateId)} AND status = 'pending'
      LIMIT 1
    `;
    if (pending.length > 0) {
      return res.status(400).json({ error: "Você já tem uma solicitação de saque pendente." });
    }

    await db`
      INSERT INTO affiliate_withdrawals (affiliate_id, amount, pix_key, pix_name, pix_cpf)
      VALUES (${Number(affiliateId)}, ${amount}, ${affiliate.pix_key}, ${affiliate.pix_name}, ${affiliate.pix_cpf})
    `;

    res.json({ success: true, message: "Solicitação de saque enviada! Aguarde a aprovação do administrador." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
