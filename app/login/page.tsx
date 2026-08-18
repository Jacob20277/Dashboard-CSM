import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Dashboard-CSM</CardTitle>
          <CardDescription>Sign in with your email and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={callbackUrl ?? "/dashboard"} />
        </CardContent>
      </Card>
    </div>
  );
}
