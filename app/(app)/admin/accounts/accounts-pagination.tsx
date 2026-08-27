import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function AccountsPagination({
  page,
  pageCount,
  totalCount,
  currentParams,
}: {
  page: number;
  pageCount: number;
  totalCount: number;
  currentParams: Record<string, string | undefined>;
}) {
  if (totalCount === 0) return null;

  function hrefForPage(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(currentParams)) {
      if (value) params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    else params.delete("page");
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t px-2 pt-3">
      <p className="text-muted-foreground text-sm">
        Page {page} of {pageCount}
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefForPage(page - 1)}
          aria-disabled={page <= 1}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: page <= 1 ? "pointer-events-none opacity-50" : "",
          })}
        >
          Previous
        </Link>
        <Link
          href={hrefForPage(page + 1)}
          aria-disabled={page >= pageCount}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: page >= pageCount ? "pointer-events-none opacity-50" : "",
          })}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
