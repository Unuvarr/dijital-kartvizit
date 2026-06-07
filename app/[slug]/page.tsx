import { notFound, redirect } from "next/navigation";
import { fetchCardBySlug } from "@/lib/supabaseServer";

type Props = { params: Promise<{ slug: string }> };

// /[slug] -> kart Bos ise /register/[slug], Aktif ise /profile/[slug]
export default async function Gateway({ params }: Props) {
  const { slug } = await params;
  const card = await fetchCardBySlug(slug);
  if (!card) notFound();
  if (card.status === "Bos") redirect(`/register/${slug}`);
  redirect(`/profile/${slug}`);
}
