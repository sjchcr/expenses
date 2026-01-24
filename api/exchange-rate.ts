import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { from, to } = req.query;

  if (!from || !to || typeof from !== "string" || typeof to !== "string") {
    return res.status(400).json({ error: "Missing from or to currency" });
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`
    );
    const data = await response.json();

    if (data.result === "success") {
      return res.status(200).json({
        rate: data.conversion_rate,
        from: data.base_code,
        to: data.target_code,
      });
    } else {
      return res.status(400).json({ error: data["error-type"] || "API error" });
    }
  } catch (error) {
    console.error("Exchange rate API error:", error);
    return res.status(500).json({ error: "Failed to fetch exchange rate" });
  }
}
