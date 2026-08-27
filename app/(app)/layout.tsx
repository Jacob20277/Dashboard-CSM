import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="header-gradient">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
            <Link href="/dashboard" className="mr-2 flex items-center rounded-md bg-white px-2 py-1">
              <BrandLogo className="h-6 w-auto" />
            </Link>
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <Link href="/log" className="hover:text-white">
              Log Activity
            </Link>
            <Link href="/csat-links" className="hover:text-white">
              CSAT Links
            </Link>
            <Link href="/accounts" className="hover:text-white">
              Accounts
            </Link>
            {isAdmin && (
              <>
                <span className="text-white/40">|</span>
                <Link href="/admin/users" className="hover:text-white">
                  Users
                </Link>
                <Link href="/admin/taxonomy" className="hover:text-white">
                  Taxonomy
                </Link>
                <Link href="/admin/csat-templates" className="hover:text-white">
                  CSAT Templates
                </Link>
                <Link href="/admin/share-links" className="hover:text-white">
                  Share Links
                </Link>
                <Link href="/admin/import" className="hover:text-white">
                  Import
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/80">
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
