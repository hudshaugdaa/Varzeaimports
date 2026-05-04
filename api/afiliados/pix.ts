import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    if (req.method === "GET") {
      const { affiliateId } = req.query;
      if (!affiliateId) return res.status(400).json({ error: "affiliateId obrigatório" });

      const affiliates = await db`SELECT pix_key, pix_name, pix_cpf FROM affiliates WHERE id = ${Number(affiliateId)} LIMIT 1`;
      if (affiliates.length === 0) return res.status(404).json({ error: "Afiliado não encontrado" });

      return res.json({ pix: affiliates[0] });
    }

    if (req.method === "POST") {
      const { affiliateId, pixKey, pixName, pixCpf } = req.body || {};
      if (!affiliateId || !pixKey || !pixName || !pixCpf) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios: affiliateId, pixKey, pixName, pixCpf" });
      }

      await db`
        UPDATE affiliates SET pix_key = ${pixKey}, pix_name = ${pixName}, pix_cpf = ${pixCpf}
        WHERE id = ${Number(affiliateId)}
      `;

      return res.json({ success: true, message: "Chave PIX salva com sucesso!" });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
