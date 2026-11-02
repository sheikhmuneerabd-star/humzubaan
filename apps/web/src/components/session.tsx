"use client";

import { createContext, useContext } from "react";

export type SessionUser = { id: string; name: string; email: string; role: string };

export const SessionContext = createContext<SessionUser | null>(null);

export function useUser(): SessionUser {
  const user = useContext(SessionContext);
  if (!user) throw new Error("useUser sirf dashboard ke andar use karein");
  return user;
}