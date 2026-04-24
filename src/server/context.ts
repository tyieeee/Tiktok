import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import type { Context } from "./trpc";

export async function createContext(): Promise<Context> {
  const session = await auth().catch(() => null);
  return { db, session };
}
