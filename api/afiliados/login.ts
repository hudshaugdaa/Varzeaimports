import type { VercelRequest, VercelResponse } from "@vercel/node";

function generateToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 86400000 }));
  const sig = btoa(`${header}.${body}.${process.env.JWT_SECRET || "varzea-secret"}`);
  return `${header}.${body}.${sig}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email e senha obrigatórios" });

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    const affiliates = await db`SELECT * FROM affiliates WHERE email = ${email} AND active = true LIMIT 1`;
    if (affiliates.length === 0) return res.status(401).json({ error: "Email ou senha incorretos" });

    const affiliate = affiliates[0];
    if (affiliate.password_hash !== password) return res.status(401).json({ error: "Email ou senha incorretos" });

    const token = generateToken({ role: "affiliate", affiliateId: affiliate.id, email: affiliate.email });
    res.json({
      success: true,
      token,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        refCode: affiliate.ref_code,
        percentage: affiliate.percentage,
        balance: affiliate.balance,
        hasPixConfigured: !!affiliate.pix_key,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
