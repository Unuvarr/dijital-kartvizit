"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function GatewayPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkCard() {
      const { data, error } = await supabase
        .from('digital_cards')
        .select('status')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error("Supabase Hatası:", error);
        setErrorMsg("Kart veritabanında bulunamadı veya bir hata oluştu.");
        return;
      }

      if (!data) {
        setErrorMsg("Bu slug için veri bulunamadı.");
        return;
      }

      if (data.status === 'Bos') {
        router.push(`/register/${slug}`);
      } else {
        router.push(`/profile/${slug}`);
      }
    }
    checkCard();
  }, [slug, router]);

  if (errorMsg) return <div className="flex h-screen items-center justify-center text-red-500">{errorMsg}</div>;
  return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;
}