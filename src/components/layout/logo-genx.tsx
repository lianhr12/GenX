import { cn } from '@/lib/utils';
import Image from 'next/image';

export function GenXLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Logo of GenX"
      title="Logo of GenX"
      width={96}
      height={96}
      className={cn('size-8 rounded-md', className)}
    />
  );
}
