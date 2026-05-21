"use client";

import { useState, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", phone: "", email: "",
    iban: "", address: "", website: "", instagram: "", linkedin: "",
    twitter: "", wifi_name: "", wifi_password: "", whatsapp: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("digital_cards")
      .update({
        ...formData,
        status: "Aktif"
      })
      .eq("slug", slug);

    setLoading(false);

    if (error) {
      console.error("Hata:", error);
      alert(`Kayıt Hatası: ${error.message}`);
    } else {
      router.push(`/profile/${slug}`);
    }
  };

  const inputStyle = "w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-black outline-none text-gray-900 placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans flex justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Kartını Aktifleştir</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Ad *</label><input required type="text" name="first_name" onChange={handleChange} className={inputStyle} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Soyad *</label><input required type="text" name="last_name" onChange={handleChange} className={inputStyle} /></div>
          </div>

          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Telefon *</label><input required type="tel" name="phone" onChange={handleChange} className={inputStyle} placeholder="0555..." /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp Numarası</label><input type="tel" name="whatsapp" onChange={handleChange} className={inputStyle} placeholder="5551234567" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">E-posta</label><input type="email" name="email" onChange={handleChange} className={inputStyle} /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Web Sitesi</label><input type="url" name="website" onChange={handleChange} className={inputStyle} /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">IBAN</label><input type="text" name="iban" onChange={handleChange} className={inputStyle} /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Açık Adres</label><textarea name="address" rows={2} onChange={handleChange} className={inputStyle}></textarea></div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Instagram</label><input type="text" name="instagram" onChange={handleChange} className={inputStyle} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn</label><input type="text" name="linkedin" onChange={handleChange} className={inputStyle} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-sm font-semibold text-gray-700 mb-1">Wi-Fi Adı</label><input type="text" name="wifi_name" onChange={handleChange} className={inputStyle} placeholder="Ev_Wifi" /></div>
             <div><label className="block text-sm font-semibold text-gray-700 mb-1">Wi-Fi Şifresi</label><input type="text" name="wifi_password" onChange={handleChange} className={inputStyle} placeholder="Şifre" /></div>
          </div>
          
          <div className="mt-6">
            <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              {loading ? "Kaydediliyor..." : "Kartımı Kaydet ve Yayınla"}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              * Bilgiler bir kez girilir, sonrasında değiştirilemez.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 