export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-app-mesh overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 motion-shimmer opacity-60"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
