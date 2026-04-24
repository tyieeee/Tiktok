"use client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_root";

export const trpc = createTRPCReact<AppRouter>();
