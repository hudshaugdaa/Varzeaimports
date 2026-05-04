import type { VercelRequest, VercelResponse } from "@vercel/node";

function generateRefCode(name: string): string {
  const base = name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "").substring(0, 8);
  const rand = Math.random().toString(36).substring(2, 6);
  return `${base}${rand}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    if (req.method === "GET") {
      const affiliates = await db`
        SELECT a.*, COALESCE(s.total_sales, 0) as total_sales, COALESCE(s.total_commission, 0) as total_commission
        FROM affiliates a
        LEFT JOIN (
          SELECT affiliate_id, COUNT(*) as total_sales, SUM(commission) as total_commission
          FROM affiliate_sales GROUP BY affiliate_id
        ) s ON a.id = s.affiliate_id
        ORDER BY a.created_at DESC
      `;
      return res.json({ affiliates });
    }

    if (req.method === "POST") {
      const { name, email, password, percentage } = req.body || {};
      if (!name || !email || !password) return res.status(400).json({ error: "Nome, email e senha obrigatórios" });

      const existing = await db`SELECT id FROM affiliates WHERE email = ${email} LIMIT 1`;
      if (existing.length > 0) return res.status(400).json({ error: "Email já cadastrado" });

      const refCode = generateRefCode(name);
      const affiliateLink = `https://varzeaimports.online/ref=${refCode}`;

      await db`
        INSERT INTO affiliates (name, email, password_hash, ref_code, percentage)
        VALUES (${name}, ${email}, ${password}, ${refCode}, ${percentage || 5})
      `;

      return res.json({
        success: true,
        refCode,
        affiliateLink,
        message: `Afiliado criado! Link: ${affiliateLink}`,
      });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID obrigatório" });
      await db`UPDATE affiliates SET active = false WHERE id = ${Number(id)}`;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
