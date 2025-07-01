import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🔍 Debug broadcast - Método:", req.method);
  console.log("🔍 Debug broadcast - Body:", req.body);
  console.log("🔍 Debug broadcast - Headers:", req.headers);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { authToken } = req.body;
  const expectedToken = process.env.SOCKET_AUTH_TOKEN || "default-secret-token";

  console.log("🔍 Debug - Token esperado:", JSON.stringify(expectedToken));
  console.log("🔍 Debug - Token recibido:", JSON.stringify(authToken));
  console.log("🔍 Debug - Son iguales:", authToken === expectedToken);

  if (authToken !== expectedToken) {
    console.log("❌ Debug - Token inválido");
    return res.status(401).json({
      error: "Token inválido",
      debug: {
        expected: expectedToken,
        received: authToken,
        equal: authToken === expectedToken,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: "Debug broadcast exitoso",
    tokenVerified: true,
  });
}
