import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

// The emailed link lands here with `?token=` when valid, or with `?error=`
// and no token when it has expired or was already used.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/auth/message?webpulse=error&error_code=link-expired&flow=recovery");
  }

  return <ResetPasswordForm token={token} />;
}
