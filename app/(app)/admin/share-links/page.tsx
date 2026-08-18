import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { prisma } from "@/lib/prisma";
import { revokeShareTokenAction } from "./actions";
import { CreateShareTokenForm } from "./create-share-token-form";

export default async function AdminShareLinksPage() {
  const [tokens, hdrs] = await Promise.all([
    prisma.shareToken.findMany({ orderBy: { createdAt: "desc" } }),
    headers(),
  ]);

  const host = hdrs.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Share links</h1>
        <p className="text-muted-foreground text-sm">
          Anyone with an active link below can view the Team/Individual dashboard without logging
          in. Revoke a link at any time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a link</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateShareTokenForm />
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
                <TableHead>Label</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((t) => {
                const url = `${baseUrl}/share/${t.token}`;
                const isRevoked = !!t.revokedAt;
                return (
                  <TableRow key={t.id}>
                    <TableCell>{t.label ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input readOnly value={url} className="h-8 max-w-md text-xs" />
                        <CopyButton text={url} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isRevoked ? "destructive" : "secondary"}>
                        {isRevoked ? "Revoked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!isRevoked && (
                        <form action={revokeShareTokenAction}>
                          <input type="hidden" name="id" value={t.id} />
                          <Button variant="outline" size="sm" type="submit">
                            Revoke
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {tokens.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No share links yet.
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
