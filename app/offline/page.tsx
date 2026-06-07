export default function Offline() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass neon-border rounded-[2rem] p-10 text-center max-w-md">
        <div className="text-5xl mb-3">📡</div>
        <h1 className="text-xl font-semibold mb-2">Çevrimdışısın</h1>
        <p className="text-sm text-black/55">
          İnternet bağlantın yok. Bağlanınca tekrar denenecek.
        </p>
      </div>
    </div>
  );
}
