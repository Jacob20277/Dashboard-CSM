import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; passwordChanged?: string }>;
}) {
  const { callbackUrl, passwordChanged } = await searchParams;

  return (
    <div className="from-background to-accent flex flex-1 items-center justify-center gap-10 bg-gradient-to-b p-6">
      <div className="hidden max-w-md flex-1 justify-end lg:flex">
        <Image
          src="/zuper-business-analyst.png"
          alt=""
          width={556}
          height={620}
          className="h-auto w-full max-w-sm"
          priority
        />
      </div>
      <Card className="w-full max-w-sm border-t-4 border-t-primary shadow-lg">
        <CardHeader className="items-center text-center">
          <BrandLogo className="mb-2 h-10 w-auto" />
          <CardTitle>Dashboard-CSM</CardTitle>
          <CardDescription>Sign in with your email and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {passwordChanged && (
            <p className="text-sm text-green-600">
              Password updated — sign in with your new password.
            </p>
          )}
          <LoginForm callbackUrl={callbackUrl ?? "/dashboard"} />
        </CardContent>
      </Card>
    </div>
  );
}
