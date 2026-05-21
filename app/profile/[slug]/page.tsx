"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  FaInstagram, FaLinkedin, FaTwitter, 
  FaDownload, FaEnvelope, FaGlobe, FaCopy, FaCheck, 
  FaWifi, FaMapMarkerAlt, FaExternalLinkAlt, FaWhatsapp 
} from 'react-icons/fa';

export default function ProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('digital_cards')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, [slug]);

  const handleCopy = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadVCard = () => {
    if (!profile) return;
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.first_name} ${profile.last_name}\nTEL:${profile.phone}\nEMAIL:${profile.email}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.first_name}.vcf`;
    link.click();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Kart bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        {/* Başlık */}
        <div className="text-center mb-6">
          <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <span className="text-3xl font-bold text-gray-400">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.first_name} {profile.last_name}</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-wider">Dijital Kimlik</p>
        </div>

        {/* Aksiyon Butonu (Siyah) */}
        <div className="mb-8">
          <button onClick={downloadVCard} className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2">
            <FaDownload /> Rehbere Kaydet
          </button>
        </div>

        {/* Sosyal Medya */}
        {(profile.instagram || profile.linkedin || profile.twitter || profile.whatsapp) && (
          <div className="flex justify-center gap-6 mb-8">
            {[
              { icon: FaInstagram, val: profile.instagram, col: "hover:text-pink-600" },
              { icon: FaLinkedin, val: profile.linkedin, col: "hover:text-blue-700" },
              { icon: FaTwitter, val: profile.twitter, col: "hover:text-sky-500" },
              { icon: FaWhatsapp, val: profile.whatsapp, link: `https://wa.me/90${profile.whatsapp?.replace(/\D/g, '')}`, col: "hover:text-green-600" }
            ].map((item, idx) => item.val && (
              <a key={idx} href={item.link || item.val} target="_blank" rel="noopener noreferrer" className={`p-3 bg-gray-50 rounded-full text-gray-600 transition ${item.col}`}>
                <item.icon size={20}/>
              </a>
            ))}
          </div>
        )}

        {/* Detaylar (Beyaz zemin üzerine siyah detaylar) */}
        <div className="space-y-3">
          <button onClick={() => handleCopy(profile.email, 'email')} className="w-full p-4 border rounded-xl flex items-center justify-between hover:bg-gray-50 transition text-gray-700">
            <div className="flex items-center gap-3"><FaEnvelope /> E-Posta</div>
            {copied === 'email' ? <FaCheck className="text-green-500"/> : <span className="text-xs text-gray-400 font-medium">KOPYALA</span>}
          </button>

          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="w-full p-4 border rounded-xl flex items-center justify-between hover:bg-gray-50 transition text-gray-700">
              <div className="flex items-center gap-3"><FaGlobe /> Web Sitesi</div>
              <FaExternalLinkAlt className="text-gray-400"/>
            </a>
          )}

          {profile.iban && (
             <button onClick={() => handleCopy(profile.iban, 'iban')} className="w-full p-4 border rounded-xl flex items-center justify-between hover:bg-gray-50 transition text-gray-700">
             <div className="flex items-center gap-3"><FaCopy /> IBAN</div>
             {copied === 'iban' ? <FaCheck className="text-green-500"/> : <span className="text-xs text-gray-400 font-medium">KOPYALA</span>}
           </button>
          )}

          {profile.address && (
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`} target="_blank" rel="noopener noreferrer" className="w-full p-4 border rounded-xl flex items-center justify-between hover:bg-gray-50 transition text-gray-700">
              <div className="flex items-center gap-3"><FaMapMarkerAlt /> Konum</div>
              <FaExternalLinkAlt className="text-gray-400"/>
            </a>
          )}

          {profile.wifi_password && (
            <button onClick={() => handleCopy(profile.wifi_password, 'wifi')} className="w-full p-4 border rounded-xl flex items-center justify-between hover:bg-gray-50 transition text-gray-700">
              <div className="flex items-center gap-3">
                <FaWifi /> {profile.wifi_name ? `Wi-Fi: ${profile.wifi_name}` : "Wi-Fi Şifresi"}
              </div>
              {copied === 'wifi' ? <FaCheck className="text-green-500"/> : <span className="text-xs text-gray-400 font-medium">KOPYALA</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}