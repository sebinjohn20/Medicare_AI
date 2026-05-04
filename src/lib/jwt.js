import jwt from "jsonwebtoken";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not defined. Add it to your .env.local file."
    );
  }
  return secret;
}

export function createToken(payload, expiresIn = "24h") {
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}
