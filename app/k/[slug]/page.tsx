import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// DİKKAT: Next.js 15 ve 16'da params artık asenkron (Promise) oldu, türünü güncelledik
export default async function NFCRouterPage({ params }: { params: Promise<{ slug: string }> }) {
  // await ile slug'ı çözümlüyoruz
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const { data: profile, error } = await supabase
    .from('digital_cards')
    .select('status')
    .eq('slug', slug)
    .single();

  // AJANLARIMIZ: Hatayı VS Code terminaline yazdırıyoruz
  console.log("--- TEST BAŞLADI ---");
  console.log("ARANAN KART (SLUG):", slug);
  console.log("SUPABASE HATASI:", error);
  console.log("SUPABASE'DEN GELEN VERİ:", profile);
  console.log("--------------------");

  if (error || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-800">
        <h1 className="text-xl font-bold">Geçersiz Kart veya Link Bulunamadı.</h1>
      </div>
    );
  }

  if (profile.status === 'Bos') {
    redirect(`/register/${slug}`);
  } else {
    redirect(`/profile/${slug}`);
  }
}