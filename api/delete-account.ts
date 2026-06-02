import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const USER_TABLES = [
  "expenses",
  "expense_templates",
  "template_groups",
  "salaries",
  "salary_records",
  "salary_settings",
  "stock_periods",
  "stocks_settings",
  "user_settings",
] as const;

function setCorsHeaders(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

function getBearerToken(req: VercelRequest) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: "Supabase admin is not configured" });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ error: "Invalid authorization token" });
  }

  try {
    const { data: avatarFiles, error: listError } = await supabaseAdmin.storage
      .from("avatars")
      .list(user.id);

    if (listError) {
      console.warn("Failed to list avatar files:", listError.message);
    }

    if (avatarFiles?.length) {
      const paths = avatarFiles.map((file) => `${user.id}/${file.name}`);
      const { error: removeError } = await supabaseAdmin.storage
        .from("avatars")
        .remove(paths);

      if (removeError) {
        console.warn("Failed to remove avatar files:", removeError.message);
      }
    }

    for (const table of USER_TABLES) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq("user_id", user.id);

      if (error) {
        throw new Error(`Failed to delete ${table}: ${error.message}`);
      }
    }

    const { error: deleteUserError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      throw deleteUserError;
    }

    return res.status(200).json({ deleted: true });
  } catch (error) {
    console.error("Account deletion failed:", error);
    return res.status(500).json({ error: "Failed to delete account" });
  }
}
