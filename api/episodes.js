export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const username = process.env.MUX_TOKEN_ID;
    const password = process.env.MUX_TOKEN_SECRET;

    if (!username || !password) {
      console.error("Missing Mux credentials");
      return res.status(500).json({
        error: "Mux credentials not configured",
      });
    }

    const credentials = Buffer.from(`${username}:${password}`).toString(
      "base64"
    );

    const response = await fetch("https://api.mux.com/video/v1/assets/", {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mux API error:", response.status, errorText);
      return res.status(response.status).json({
        error: `Mux API error: ${response.status}`,
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
