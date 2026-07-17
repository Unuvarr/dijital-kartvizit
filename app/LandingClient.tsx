import Link from "next/link";
import Image from "next/image";
import demoEkran from "@/public/landing/demo-ekran.png";

const SHOPIER = "https://www.shopier.com/ritycard/48875910";
const INSTAGRAM = "https://instagram.com/ritycard";

/* RITY RING R logosu */
function RityMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 1000 1000" width={size} height={size} className={className} aria-hidden>
      <path
        d="M 561 846.6 A 352 352 0 1 1 753.1 744.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={36}
        strokeLinecap="round"
      />
      <g fill="none" stroke="currentColor" strokeWidth={66}>
        <path d="M 380 265 V 735" />
        <path d="M 380 300 H 512 L 585 372 L 512 445 H 380" />
        <path d="M 517 445 L 681 860" />
      </g>
    </svg>
  );
}

/* Temassız okutma halkaları */
function NfcArcs({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 14 12" width={size} height={size * (12 / 14)} className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinecap="round">
        <path d="M 1.5 4 A 2.46 2.46 0 0 1 1.5 8" />
        <path d="M 3.4 3.1 A 3.6 3.6 0 0 1 3.4 8.9" />
        <path d="M 5.3 2.2 A 4.75 4.75 0 0 1 5.3 9.8" />
        <path d="M 7.2 1.3 A 5.9 5.9 0 0 1 7.2 10.7" />
      </g>
    </svg>
  );
}

const STEPS = [
  {
    n: "1",
    t: "Kartı dokundur",
    d: "ya da arkasındaki QR kodu okut — karşı tarafta uygulama gerekmez.",
  },
  {
    n: "2",
    t: "Profilin açılır",
    d: "Fotoğrafın, telefonun, WhatsApp'ın, sosyal medyan, IBAN ve adresin — tek ekranda.",
  },
  {
    n: "3",
    t: "Rehbere kaydet",
    d: "Karşındaki tek dokunuşla seni kişilerine ekler. Yazdırma, ezberleme yok.",
  },
];

const FEATURES = [
  { t: "Uygulama gerekmez", d: "Güncel iPhone ve Android'lerde dokundur-aç; gerekirse karttaki QR kod aynı işi görür." },
  { t: "Ömür boyu güncel", d: "Numaran, işin, adresin değişse bile kartın aynı kalır — profili sen güncellersin, ücretsiz." },
  { t: "İsmine özel tasarım", d: "Siyah premium ya da renkli serbest tasarım. Onayın olmadan baskıya girmez." },
  { t: "Görüntülenme paneli", d: "Profilinin kaç kişi tarafından görüntülendiğini kendi panelinden takip et." },
  { t: "Bilgi toplama", d: "Karşı taraf tek dokunuşla sana adını ve numarasını bırakabilir." },
  { t: "Türkiye geneli kargo", d: "Kargo ücretsiz — fiyata dahil." },
];

const FAQ = [
  {
    q: "Karşı tarafta uygulama gerekir mi?",
    a: "Hayır. Kartı telefona dokundurduğunda profil doğrudan tarayıcıda açılır. NFC olmayan telefonlarda kartın arkasındaki QR kod aynı işi görür.",
  },
  {
    q: "Hangi telefonlarda çalışır?",
    a: "Dokundur-aç, son yılların iPhone'larında (iPhone XR ve sonrası) ve NFC'li Android'lerde çalışır. Daha eski cihazlarda ya da NFC kapalıysa kartın arkasındaki QR kod aynı profili açar — yani pratikte her telefonda çalışır.",
  },
  {
    q: "Bilgilerim değişirse ne olur?",
    a: "Kartın aynı kalır; profilini istediğin an kendin güncellersin. Ek ücret yok, yeni kart bastırmak yok — ömür boyu.",
  },
  {
    q: "Sipariş nasıl işliyor, ne zaman elime ulaşır?",
    a: "Shopier'den güvenli ödemeyle sipariş verirsin, sipariş notuna ad-soyadını ve telefonunu yazarsın. Tasarımını hazırlayıp onayına sunarız; onayının ardından kartın basılır ve genellikle birkaç iş günü içinde kargoya verilir. Kargo Türkiye geneli ücretsizdir.",
  },
  {
    q: "İade ve değişim var mı?",
    a: "Kart ismine özel üretildiği için onayın olmadan asla baskıya girmez — tasarımı sipariş sonrası birlikte netleştiririz. Baskı hatalı ya da kart hasarlı ulaşırsa ücretsiz yeniden basıp gönderiyoruz.",
  },
];

export default function LandingClient() {
  return (
    <div className="relative w-full bg-[#141416] text-white overflow-hidden">
      {/* arka plan dokusu: çok silik halka izleri */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full border border-white/[0.04]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-[380px] h-[380px] rounded-full border border-white/[0.05]"
      />

      {/* ÜST BAR */}
      <header className="relative max-w-5xl mx-auto flex items-center justify-between px-5 sm:px-8 py-5">
        <div className="flex items-center gap-2.5">
          <RityMark size={30} className="text-white" />
          <span className="font-bold tracking-tight text-[17px]">Rity Card</span>
        </div>
        <Link
          href="/recover"
          className="text-[13px] text-white/60 hover:text-white transition-colors px-3 py-2.5 -mx-3 -my-2.5"
        >
          Kart girişi
        </Link>
      </header>

      <main>
        {/* HERO */}
        <section className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-8 sm:pt-14 pb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="anim-rise text-[42px] sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Telefona dokundur,
                <br />
                tanış.
              </h1>
              <p className="anim-rise anim-rise-1 mt-5 text-[17px] leading-relaxed text-white/60 max-w-md">
                İsmine özel üretilen NFC kartvizit. Dokundur — fotoğrafın, telefonun,
                sosyal medyan tek ekranda açılsın. Karşı tarafta uygulama gerekmez.
              </p>
              <div className="anim-rise anim-rise-2 mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={SHOPIER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-[52px] px-8 rounded-full bg-white text-[#141416] font-bold text-[15px] hover:bg-white/90 transition-colors"
                >
                  Kartını al — 499₺
                </a>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center h-[52px] px-7 rounded-full border border-white/20 text-white font-semibold text-[15px] hover:border-white/50 transition-colors"
                >
                  Canlı demoyu dene
                </Link>
              </div>
              <p className="anim-rise anim-rise-3 mt-4 text-[13px] text-white/55">
                Kargo dahil · Shopier ile güvenli ödeme · Ömür boyu ücretsiz güncelleme
              </p>
            </div>

            {/* Telefon + kart görseli */}
            <div className="anim-rise anim-rise-2 relative flex justify-center md:justify-end">
              <div className="relative">
                {/* telefon */}
                <div className="w-[240px] sm:w-[270px] rounded-[44px] bg-[#2a2a2e] p-[10px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
                  <div className="relative rounded-[36px] overflow-hidden bg-[#0c0c0d]">
                    <Image
                      src={demoEkran}
                      alt="Rity Card dijital profil örneği — kart okutulunca açılan ekran"
                      className="w-full h-auto"
                      preload
                      sizes="(max-width: 640px) 240px, 270px"
                    />
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[72px] h-[20px] rounded-full bg-black" />
                  </div>
                </div>
                {/* kart */}
                <div className="absolute -left-24 sm:-left-32 bottom-10 w-[190px] sm:w-[220px] aspect-[85.6/54] rounded-2xl rotate-[-8deg] bg-gradient-to-br from-[#27272c] via-[#1b1b1f] to-[#141417] border border-[#3a3a41] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center">
                  <RityMark size={20} className="text-white absolute top-3 left-1/2 -translate-x-1/2" />
                  <NfcArcs size={18} className="text-white/45 absolute top-3 right-3.5" />
                  <p className="text-[11px] tracking-[0.28em] font-light mt-4">MERT</p>
                  <p className="text-[13px] tracking-[0.18em] font-bold">DEMİR</p>
                  <div className="w-6 h-[2px] bg-white mt-1.5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NASIL ÇALIŞIR */}
        <section className="relative border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">
              3 saniyede tanış.
            </h2>
            <div className="mt-12 grid sm:grid-cols-3 gap-4">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-3xl bg-[#1b1b1e] border border-white/[0.06] p-7">
                  <div className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center font-extrabold text-lg">
                    {s.n}
                  </div>
                  <h3 className="mt-5 font-bold text-[17px]">{s.t}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/60">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ÖZELLİKLER */}
        <section className="relative border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">
              Kâğıt kartvizitin yapamadığı her şey.
            </h2>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div key={f.t} className="rounded-3xl bg-[#1b1b1e] border border-white/[0.06] p-6">
                  <h3 className="font-bold text-[15px]">{f.t}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FİYAT */}
        <section className="relative border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
            <div className="max-w-md mx-auto rounded-[32px] bg-[#1b1b1e] border border-white/[0.08] p-9 text-center">
              <p className="text-[13px] tracking-[0.2em] font-semibold text-white/55">TEK KART</p>
              <p className="mt-3 text-6xl font-extrabold tracking-tight">
                499<span className="text-3xl align-top">₺</span>
              </p>
              <p className="mt-2 text-[14px] text-white/60">kargo dahil · tek seferlik · abonelik yok</p>
              <ul className="mt-6 space-y-2.5 text-left text-[14px] text-white/75">
                {[
                  "İsmine özel tasarlanmış NFC kart",
                  "Kişisel dijital profil (ritycard.one)",
                  "Sınırsız ücretsiz bilgi güncelleme",
                  "Görüntülenme paneli",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-2.5">
                    <svg viewBox="0 0 16 16" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden>
                      <path
                        d="M 2.5 8.5 L 6.5 12.5 L 13.5 4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {x}
                  </li>
                ))}
              </ul>
              <a
                href={SHOPIER}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center h-[52px] rounded-full bg-white text-[#141416] font-bold text-[15px] hover:bg-white/90 transition-colors"
              >
                Shopier&apos;den satın al
              </a>
              <p className="mt-4 text-[13px] text-white/55">
                İşletmen için 5+ kart mı lazım?{" "}
                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 text-white/75 hover:text-white transition-colors"
                >
                  Instagram&apos;dan yaz
                </a>
                , kurumsal paketi konuşalım.
              </p>
            </div>
          </div>
        </section>

        {/* SSS */}
        <section className="relative border-t border-white/[0.06]">
          <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">
              Sık sorulanlar
            </h2>
            <div className="mt-10 space-y-3">
              {FAQ.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl bg-[#1b1b1e] border border-white/[0.06] overflow-hidden"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-[15px] px-6 py-5">
                    {f.q}
                    <span
                      aria-hidden
                      className="text-white/50 transition-transform group-open:rotate-45 text-xl leading-none shrink-0"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-5 -mt-1 text-[14px] leading-relaxed text-white/60">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* KAPANIŞ CTA */}
        <section className="relative border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 text-center">
            <RityMark size={52} className="text-white mx-auto" />
            <h2 className="mt-6 text-3xl sm:text-5xl font-extrabold tracking-tight">
              Kartvizitin çağ atlasın.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={SHOPIER}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-[52px] px-8 rounded-full bg-white text-[#141416] font-bold text-[15px] hover:bg-white/90 transition-colors"
              >
                Kartını al — 499₺
              </a>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center h-[52px] px-7 rounded-full border border-white/20 text-white font-semibold text-[15px] hover:border-white/50 transition-colors"
              >
                Önce demoyu dene
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-white/55">
          <div className="flex items-center gap-2">
            <RityMark size={18} className="text-white/70" />
            <span>© 2026 Rity Card</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 hover:text-white transition-colors"
            >
              Instagram
            </a>
            <Link href="/demo" className="py-2 hover:text-white transition-colors">
              Demo
            </Link>
            <Link href="/gizlilik" className="py-2 hover:text-white transition-colors">
              Gizlilik &amp; KVKK
            </Link>
          </div>
        </div>
      </footer>

      {/* MOBİL YAPIŞKAN CTA */}
      <div className="fixed bottom-0 inset-x-0 z-50 sm:hidden bg-[#141416]/90 backdrop-blur border-t border-white/10 px-4 py-3">
        <a
          href={SHOPIER}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center h-12 rounded-full bg-white text-[#141416] font-bold text-[15px]"
        >
          Kartını al — 499₺ · kargo dahil
        </a>
      </div>
      {/* yapışkan bar içeriği örtmesin */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
