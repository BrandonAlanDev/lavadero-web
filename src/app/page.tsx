import { auth } from "@/auth";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const session = await auth();
  return <HomeClient />;
}
