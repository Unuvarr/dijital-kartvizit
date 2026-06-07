import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass neon-border rounded-[2rem] p-10 text-center max-w-md">
        <div className="text-5xl mb-3">🔍</div>
        <h1 className="text-xl font-semibold mb-2">Bu kart bulunamadı</h1>
        <p className="text-sm text-black/55 mb-6">
          Slug yanlış olabilir veya kart silinmiş olabilir.
        </p>
        <Link
          href="/recover"
          className="btn-neon inline-block px-6 py-3 rounded-xl text-white font-semibold"
        >
          Kartına eriş
        </Link>
      </div>
    </div>
  );
}
