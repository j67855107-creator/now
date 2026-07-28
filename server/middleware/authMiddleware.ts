import { Request, Response, NextFunction } from "express";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const allowedKey = process.env.API_PROTECTION_KEY || "WN3FBAF2GYF";
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  if (apiKey === allowedKey) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid API Key" });
  }
}
