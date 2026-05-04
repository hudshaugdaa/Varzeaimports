// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initDb } from "./db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const result = await initDb();
    res.json({ success: true, message: "Banco de dados inicializado com sucesso!", ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    res.status(500).json({ success: false, error: message });
  }
}
