// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";

const ADMIN_USER = process.env.ADMIN_USERNAME || "admin2000";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "pecúnia2000";

function generateToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 86400000 }));
  const sig = btoa(`${header}.${body}.${process.env.JWT_SECRET || "varzea-secret"}`);
  return `${header}.${body}.${sig}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { username, password, ip, deviceInfo, location } = req.body || {};

  if (!username || !password) return res.status(400).json({ error: "Usuário e senha obrigatórios" });

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Usuário ou senha incorretos" });
  }

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    const admins = await db`SELECT id FROM admin_users WHERE username = ${username} LIMIT 1`;
    let adminId: number;

    if (admins.length === 0) {
      const inserted = await db`
        INSERT INTO admin_users (username, password_hash) VALUES (${username}, ${password}) RETURNING id
      `;
      adminId = inserted[0].id;
    } else {
      adminId = admins[0].id;
    }

    await db`
      INSERT INTO admin_sessions (admin_id, ip, device_info, location)
      VALUES (${adminId}, ${ip || req.headers["x-forwarded-for"] || ""}, ${deviceInfo || ""}, ${location || ""})
    `;
  } catch {}

  const token = generateToken({ role: "admin", username });
  res.json({ success: true, token });
}
