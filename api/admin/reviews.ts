import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    if (req.method === "POST") {
      const { productId, author, rating, comment, date, verified } = req.body || {};
      if (!productId || !author || !rating) return res.status(400).json({ error: "Campos obrigatórios: productId, author, rating" });

      const result = await db`
        INSERT INTO reviews (product_id, author, rating, comment, date, verified)
        VALUES (${productId}, ${author}, ${rating}, ${comment || ""}, ${date || new Date().toISOString().split("T")[0]}, ${verified !== false})
        RETURNING id
      `;
      return res.json({ success: true, id: result[0].id });
    }

    if (req.method === "PUT") {
      const { id, author, rating, comment, date, verified } = req.body || {};
      if (!id) return res.status(400).json({ error: "ID obrigatório" });

      await db`
        UPDATE reviews SET
          author = COALESCE(${author || null}, author),
          rating = COALESCE(${rating || null}, rating),
          comment = COALESCE(${comment || null}, comment),
          date = COALESCE(${date || null}, date),
          verified = COALESCE(${verified !== undefined ? verified : null}, verified)
        WHERE id = ${id}
      `;
      return res.json({ success: true });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID obrigatório" });
      await db`DELETE FROM reviews WHERE id = ${Number(id)}`;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
