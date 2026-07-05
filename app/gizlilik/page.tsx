import type { Metadata } from "next";
import BackLink from "@/components/BackLink";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK Aydınlatma Metni – Rity Card",
  description:
    "Rity Card dijital kartvizit hizmetinde kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
};

// İletişim e-postanı buraya yaz (gerçek, ulaşılabilir bir adres olmalı).
const CONTACT_EMAIL = "destek@ritycard.one";
const LAST_UPDATED = "16 Haziran 2026";

export default function GizlilikPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto neon-border">
        <div className="glass rounded-[2rem] p-8 sm:p-10">
          <h1 className="text-2xl font-bold neon-text mb-1">
            Gizlilik & KVKK Aydınlatma Metni
          </h1>
          <p className="text-xs text-black/45 mb-8">
            Son güncelleme: {LAST_UPDATED}
          </p>

          <div className="space-y-6 text-sm text-black/70 leading-relaxed">
            <Section title="1. Veri Sorumlusu">
              Rity Card (“Hizmet”), dijital kartvizit oluşturma ve paylaşma
              hizmeti sunar. Bu metin, 6698 sayılı Kişisel Verilerin Korunması
              Kanunu (“KVKK”) kapsamında kişisel verilerinizin nasıl işlendiğini
              açıklar.
            </Section>

            <Section title="2. İşlenen Veriler">
              <strong className="text-[#1d1d1f]">Kart sahibi olarak</strong> sen
              kaydolurken: ad, soyad, ünvan, şirket, telefon, e-posta, profil/
              kapak fotoğrafı, sosyal medya bağlantıları, IBAN ve adres gibi
              paylaşmayı seçtiğin bilgiler.
              <br />
              <br />
              <strong className="text-[#1d1d1f]">Ziyaretçi olarak</strong> bir
              kartta “bilgini bırak” formunu doldurursan: ad, telefon, e-posta,
              şirket ve mesaj bilgilerin, ilgili kart sahibine iletilmek üzere.
              <br />
              <br />
              <strong className="text-[#1d1d1f]">Otomatik olarak</strong>:
              kartın kaç kez görüntülendiği (istatistik) ve kötüye kullanımı
              önlemek için sınırlı teknik veriler.
            </Section>

            <Section title="3. İşleme Amaçları">
              Dijital kartvizitin oluşturulması ve gösterilmesi; kart sahibi ile
              ziyaretçiler arasında iletişimin sağlanması; hizmetin güvenliği,
              kötüye kullanımın önlenmesi ve temel istatistiklerin sunulması.
            </Section>

            <Section title="4. Hukuki Sebep">
              Veriler, KVKK m.5 uyarınca açık rızanız, sözleşmenin kurulması/ifası
              ve veri sorumlusunun meşru menfaati hukuki sebeplerine dayanılarak
              işlenir.
            </Section>

            <Section title="5. Aktarım ve Hizmet Sağlayıcılar">
              Veriler, hizmetin sunulabilmesi için aşağıdaki altyapı
              sağlayıcılarında barındırılır/işlenir:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Veritabanı &amp; depolama: Supabase</li>
                <li>Barındırma: Vercel</li>
                <li>E-posta gönderimi: Resend</li>
              </ul>
              Bu sağlayıcılar verileri yalnızca hizmetin işletilmesi için işler.
            </Section>

            <Section title="6. Saklama Süresi">
              Veriler, kart aktif olduğu sürece ve ilgili mevzuatın gerektirdiği
              süreler boyunca saklanır. Kartını/sildirme talebini ilettiğinde
              verilerin silinir.
            </Section>

            <Section title="7. Haklarınız (KVKK m.11)">
              Kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep
              etme, düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme
              ve zararın giderilmesini talep etme haklarına sahipsiniz.
              Taleplerinizi aşağıdaki e-posta ile iletebilirsiniz.
            </Section>

            <Section title="8. Çerezler">
              Hizmet, oturumu ve sahiplik tanımayı sürdürmek için tarayıcınızın
              yerel depolamasını (localStorage) kullanır. Reklam/üçüncü taraf
              takip çerezleri kullanılmaz.
            </Section>

            <Section title="9. İletişim">
              Her türlü soru ve KVKK talebi için:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#141416] font-medium hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </Section>

            <p className="text-xs text-black/40 pt-4 border-t border-black/[0.06]">
              Bu metin genel bilgilendirme amaçlıdır; ticari kullanımda bir hukuk
              danışmanıyla gözden geçirilmesi önerilir.
            </p>
          </div>

          <div className="mt-8">
            <BackLink />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-[#1d1d1f] mb-2">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
