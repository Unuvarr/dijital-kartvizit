import { supabase } from "./supabaseClient";

/**
 * Bir resim dosyasini 'avatars' bucket'ina yukler ve herkese acik URL'yi doner.
 * Dosya adi slug'a gore benzersiz tutulur (uzerine yazilabilir).
 */
export async function uploadAvatar(slug: string, file: File): Promise<string> {
  // Dosyalar sahibin uid klasörüne yazılır. RLS bu klasöre yalnız sahibin
  // yazmasına izin verir → başkası kimsenin avatarını üzerine yazamaz (defacement önlemi).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = user?.id;
  if (!uid) throw new Error("Oturum bulunamadı, sayfayı yenileyip tekrar dene.");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${uid}/${slug}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600" });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
