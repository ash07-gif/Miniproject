import Link from 'next/link';
import { Newspaper } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/home" className="flex items-center gap-2" prefetch={false}>
      <Newspaper className="h-6 w-6 text-primary" />
      <span className="text-lg font-semibold font-headline tracking-tight">NewsFlash</span>
    </Link>
  );
}
