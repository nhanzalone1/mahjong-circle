import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await getCurrentUser();
    // If already logged in, redirect to dashboard
    if (user) {
      redirect("/dashboard");
    }
  } catch {
    // Auth check failed, show auth page
  }

  return <>{children}</>;
}
