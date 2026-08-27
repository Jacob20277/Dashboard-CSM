import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: admin access required");
  }
  return user;
}

// Anyone can view every account, but editing is restricted to admins and the
// account's own assigned CSM.
export async function requireAccountEditAccess(csmUserId: string | null) {
  const user = await requireUser();
  if (user.role === "ADMIN") return user;
  if (csmUserId && csmUserId === user.id) return user;
  throw new Error("Forbidden: you can only edit accounts you're the CSM for");
}
