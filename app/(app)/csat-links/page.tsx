import Link from "next/link";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyButton } from "@/components/copy-button";
import { getActiveAccounts } from "@/lib/dashboard-queries";
import { prisma } from "@/lib/prisma";
import { revokeCsatLink } from "./actions";
import { CreateCsatLinkForm } from "./create-csat-link-form";

export default async function CsatLinksPage() {
  const [accounts, templates, links, hdrs] = await Promise.all([
    getActiveAccounts(),
    prisma.csatTemplate.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { questions: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.csatLink.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        account: true,
        createdBy: true,
        questions: { orderBy: { sortOrder: "asc" } },
        _count: { select: { responses: true } },
      },
    }),
    headers(),
  ]);

  const host = hdrs.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">CSAT links</h1>
        <p className="text-muted-foreground text-sm">
          Generate a link for an account and share it with one or more customer contacts. Every
          rating they submit shows up on the dashboard automatically — no manual entry needed.
        </p>
      </div>

      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>Generate a link</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCsatLinkForm accounts={accounts} templates={templates} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing links</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Created by</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => {
                const url = `${baseUrl}/csat/${link.token}`;
                const isRevoked = !!link.revokedAt;
                const questionList = link.questions.map((q) => q.text).join("\n");
                return (
                  <TableRow key={link.id}>
                    <TableCell>{link.account.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input readOnly value={url} className="h-8 max-w-md text-xs" />
                        <CopyButton text={url} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span title={questionList} className="cursor-help underline decoration-dotted">
                        {link.questions.length} question{link.questions.length === 1 ? "" : "s"}
                      </span>
                    </TableCell>
                    <TableCell>{link.createdBy.name}</TableCell>
                    <TableCell>{link._count.responses}</TableCell>
                    <TableCell>
                      <Badge variant={isRevoked ? "destructive" : "secondary"}>
                        {isRevoked ? "Revoked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/csat-links/${link.id}`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          View responses
                        </Link>
                        {!isRevoked && (
                          <form action={revokeCsatLink}>
                            <input type="hidden" name="id" value={link.id} />
                            <Button variant="outline" size="sm" type="submit">
                              Revoke
                            </Button>
                          </form>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {links.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    No CSAT links yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
