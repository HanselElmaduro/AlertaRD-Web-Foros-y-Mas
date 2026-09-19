import { ThreadPage } from "@/components/forum/thread-page";
export const metadata = { title: "Conversación ciudadana" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ThreadPage id={id} />;
}
