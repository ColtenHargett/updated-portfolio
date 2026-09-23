import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[100svh] place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-6 text-[clamp(3rem,12vw,9rem)] font-medium leading-none tracking-[-0.05em]">
          Lost <span className="serif italic text-gradient">the signal.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-muted">This page doesn&apos;t exist.</p>
        <Link href="/" className="mt-10 inline-flex rounded-full bg-fg px-6 py-3 text-sm font-medium text-ink">
          Back home
        </Link>
      </div>
    </main>
  );
}
