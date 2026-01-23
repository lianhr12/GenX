import Container from '@/components/layout/container';
import type { PropsWithChildren } from 'react';

export default function StylesLayout({ children }: PropsWithChildren) {
  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-6xl">{children}</div>
    </Container>
  );
}
