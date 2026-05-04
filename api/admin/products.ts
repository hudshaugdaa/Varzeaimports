import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    if (req.method === "GET") {
      const products = await db`SELECT * FROM products_db ORDER BY created_at DESC`;
      const reviews = await db`SELECT * FROM reviews ORDER BY created_at DESC`;
      return res.json({ products, reviews });
    }

    if (req.method === "POST") {
      const { id, slug, name, description, price, originalPrice, images, category, subcategory, sizes, brand, inStock, badge } = req.body || {};
      if (!name || !price || !category) return res.status(400).json({ error: "Campos obrigatórios: name, price, category" });
      if (!images || images.length < 3) return res.status(400).json({ error: "Mínimo 3 imagens obrigatórias" });

      const productId = id || slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const productSlug = slug || productId;

      await db`
        INSERT INTO products_db (id, slug, name, description, price, original_price, images, category, subcategory, sizes, brand, in_stock, badge)
        VALUES (${productId}, ${productSlug}, ${name}, ${description || ""}, ${price}, ${originalPrice || null},
                ${JSON.stringify(images)}, ${category}, ${subcategory || null}, ${JSON.stringify(sizes || [])},
                ${brand || ""}, ${inStock !== false}, ${badge || null})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
          original_price = EXCLUDED.original_price, images = EXCLUDED.images, category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory, sizes = EXCLUDED.sizes, brand = EXCLUDED.brand,
          in_stock = EXCLUDED.in_stock, badge = EXCLUDED.badge, updated_at = NOW()
      `;
      return res.json({ success: true, id: productId });
    }

    if (req.method === "PUT") {
      const { id, ...fields } = req.body || {};
      if (!id) return res.status(400).json({ error: "ID obrigatório" });
      if (fields.images && fields.images.length < 3) return res.status(400).json({ error: "Mínimo 3 imagens obrigatórias" });

      await db`
        UPDATE products_db SET
          name = COALESCE(${fields.name || null}, name),
          description = COALESCE(${fields.description || null}, description),
          price = COALESCE(${fields.price || null}, price),
          original_price = COALESCE(${fields.originalPrice || null}, original_price),
          images = COALESCE(${fields.images ? JSON.stringify(fields.images) : null}, images),
          category = COALESCE(${fields.category || null}, category),
          subcategory = COALESCE(${fields.subcategory || null}, subcategory),
          sizes = COALESCE(${fields.sizes ? JSON.stringify(fields.sizes) : null}, sizes),
          brand = COALESCE(${fields.brand || null}, brand),
          in_stock = COALESCE(${fields.inStock !== undefined ? fields.inStock : null}, in_stock),
          badge = COALESCE(${fields.badge || null}, badge),
          updated_at = NOW()
        WHERE id = ${id}
      `;
      return res.json({ success: true });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID obrigatório" });
      await db`DELETE FROM reviews WHERE product_id = ${String(id)}`;
      await db`DELETE FROM products_db WHERE id = ${String(id)}`;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
