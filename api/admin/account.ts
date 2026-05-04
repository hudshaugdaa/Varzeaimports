// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { getDb } = await import("../db");
    const db = getDb();

    if (req.method === "GET") {
      const sessions = await db`SELECT * FROM admin_sessions ORDER BY last_seen DESC LIMIT 20`;
      const bannedIps = await db`SELECT * FROM banned_ips ORDER BY created_at DESC`;
      return res.json({ sessions, bannedIps });
    }

    if (req.method === "PUT") {
      const { newUsername, newPassword } = req.body || {};
      if (!newUsername || !newPassword) return res.status(400).json({ error: "Novo usuário e senha obrigatórios" });

      const admins = await db`SELECT id FROM admin_users LIMIT 1`;
      if (admins.length === 0) {
        await db`INSERT INTO admin_users (username, password_hash) VALUES (${newUsername}, ${newPassword})`;
      } else {
        await db`UPDATE admin_users SET username = ${newUsername}, password_hash = ${newPassword}, updated_at = NOW() WHERE id = ${admins[0].id}`;
      }
      return res.json({ success: true, message: "Login atualizado com sucesso!" });
    }

    if (req.method === "DELETE") {
      const { sessionId, ip, action } = req.body || {};

      if (action === "remove_session" && sessionId) {
        await db`DELETE FROM admin_sessions WHERE id = ${Number(sessionId)}`;
        return res.json({ success: true });
      }

      if (action === "ban_ip" && ip) {
        await db`INSERT INTO banned_ips (ip) VALUES (${ip}) ON CONFLICT (ip) DO NOTHING`;
        await db`DELETE FROM admin_sessions WHERE ip = ${ip}`;
        return res.json({ success: true, message: `IP ${ip} banido com sucesso!` });
      }

      if (action === "unban_ip" && ip) {
        await db`DELETE FROM banned_ips WHERE ip = ${ip}`;
        return res.json({ success: true });
      }

      return res.status(400).json({ error: "Ação inválida" });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    res.status(500).json({ error: message });
  }
}
