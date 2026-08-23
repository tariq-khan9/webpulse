import { AuthBackground } from "@/components/auth/auth-background";

export default function SimpleAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthBackground>{children}</AuthBackground>;
}
