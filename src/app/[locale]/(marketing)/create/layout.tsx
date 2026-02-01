import type { PropsWithChildren } from 'react';

export default function CreateLayout({ children }: PropsWithChildren) {
  return <div className="w-full">{children}</div>;
}
