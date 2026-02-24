import { auth } from "@/auth";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) { redirect("/login"); }

  return (
  <>
    {session?.user && <DashboardPanel user={session.user} />}
  </>
  );
}