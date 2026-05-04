import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    if (req.method === "GET") {
      const cats = await db`SELECT * FROM categories ORDER BY parent_id NULLS FIRST, label ASC`;
      return res.json({ categories: cats });
    }

    if (req.method === "POST") {
      const { label, slug, parentId } = req.body || {};
      if (!label || !slug) return res.status(400).json({ error: "label e slug obrigatórios" });

      await db`
        INSERT INTO categories (label, slug, parent_id) VALUES (${label}, ${slug}, ${parentId || null})
        ON CONFLICT (slug) DO NOTHING
      `;
      return res.json({ success: true });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID obrigatório" });
      await db`DELETE FROM categories WHERE id = ${Number(id)}`;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
