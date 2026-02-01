'use client';

import { ProductTabs } from '../header/product-tabs';
import { PromptInput } from './prompt-input';

export function MainInputArea() {
  return (
    <div className="relative w-full max-w-[980px] mx-auto pt-14">
      {/* Tabs positioned above the input box */}
      <div className="absolute top-0 hidden min-h-20 w-full self-stretch lg:flex">
        <ProductTabs />
      </div>

      {/* Input Container */}
      <div className="relative z-10">
        <div className="relative mx-auto rounded-3xl transition-all duration-300 will-change-[max-width]">
          <div className="relative h-full rounded-3xl border border-border/50 bg-card/80 p-4 backdrop-blur-[100px]">
            <PromptInput />
          </div>
        </div>
      </div>
    </div>
  );
}
