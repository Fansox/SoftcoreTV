import jwt from "jsonwebtoken";
import { env } from "@/lib/config/env";

export const signSession = (username: string) => jwt.sign({ sub: username, role: "admin" }, env.jwtSecret, { expiresIn: "8h" });
