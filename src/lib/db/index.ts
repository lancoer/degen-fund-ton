import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle as neonDrizzleAdapter } from "drizzle-orm/neon-http";
import { drizzle as httpProxyDrizzleAdapter } from "drizzle-orm/pg-proxy";
import axios from "axios";

export const getRwDb = async () => {
  const sql = neon(process.env.NEON_URL!);
  return neonDrizzleAdapter(sql);
};

export const getDb = async () => {
  const sql = neon(process.env.NEON_URL!);
  return neonDrizzleAdapter(sql);
};
