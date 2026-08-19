import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/log">Log Activity</Link>
            <Link href="/csat-links">CSAT Links</Link>
            {isAdmin && (
              <>
                <span className="text-muted-foreground">|</span>
                <Link href="/admin/accounts">Accounts</Link>
                <Link href="/admin/users">Users</Link>
                <Link href="/admin/taxonomy">Taxonomy</Link>
                <Link href="/admin/csat-templates">CSAT Templates</Link>
                <Link href="/admin/share-links">Share Links</Link>
                <Link href="/admin/import">Import</Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {session.user.name} ({session.user.role})
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
