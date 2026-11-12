import Link from "next/link";
import { CakeMark } from "@/components/ui/Logo";
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-blush px-4 text-center">
      <CakeMark className="h-20 w-20" />
      <p className="mt-6 font-heading text-8xl font-semibold text-brand">404</p>
      <h1 className="mt-2 text-3xl">Oops! This page has been eaten.</h1>
      <p className="mt-3 max-w-md">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-outline">
          Go home
        </Link>
        <Link href="/shop" className="btn-dark">
          Back to shop
        </Link>
      </div>
    </main>
  );
}
