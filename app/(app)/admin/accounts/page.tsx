import { redirect } from "next/navigation";

// This page moved to /accounts (visible to all users, not just admins).
// Keep this redirect so old bookmarks/links to /admin/accounts still work.
export default function AdminAccountsRedirect() {
  redirect("/accounts");
}
