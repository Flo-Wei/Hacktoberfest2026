"use client";

import { useState } from "react";
import { cn } from "cn";
import { Crab } from "@/components/crab";

type Props = {
  product: { id: string; name: string; image_url: string | null };
  className?: string;
};

export function ProductImage({ product, className }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("flex items-center justify-center bg-secondary", className)}>
      {product.image_url && !failed ? (
        // External store links, so next/image would need every host configured.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={product.id}
          src={product.image_url}
          alt={product.name}
          draggable={false}
          onError={() => setFailed(true)}
          className="max-h-full max-w-full rounded-lg object-contain"
        />
      ) : (
        <Crab size={96} />
      )}
    </div>
  );
}
