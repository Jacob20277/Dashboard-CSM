import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return <div className="space-y-6">{children}</div>;
}
