import { GenXLogo } from '@/components/layout/logo-genx';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BuiltWithButton() {
  return (
    <Link
      target="_blank"
      href="https://genx.art"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'border border-border px-4 rounded-md'
      )}
    >
      <span>Built with</span>
      <span>
        <GenXLogo className="size-5 rounded-full" />
      </span>
      <span className="font-semibold">GenX</span>
    </Link>
  );
}
