import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCardBySlug } from "@/lib/supabaseServer";
import ProfileClient from "./ProfileClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await fetchCardBySlug(slug);
  if (!profile || profile.status !== "Aktif") {
    return { title: "Dijital Kartvizit" };
  }
  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  const subtitle = [profile.title, profile.company].filter(Boolean).join(" · ");
  const description = subtitle || "Dijital kartvizit";
  const image = profile.avatar_url || undefined;

  return {
    title: `${fullName} – Dijital Kartvizit`,
    description,
    openGraph: {
      title: fullName,
      description,
      type: "profile",
      images: image ? [{ url: image, alt: fullName }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: fullName,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = await fetchCardBySlug(slug);

  if (!profile) notFound();
  if (profile.status === "Bos") notFound();

  return <ProfileClient profile={profile} slug={slug} />;
}
