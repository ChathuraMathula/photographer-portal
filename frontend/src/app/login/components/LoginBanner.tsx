import React from "react";
import Image from "next/image";

export function LoginBanner() {
  return (
    <div className="w-full h-[40vh] md:h-screen md:w-1/2 relative bg-zinc-900 overflow-hidden order-first md:order-last">
      <Image
        src="/login-banner.png"
        alt="Photographer Portal Professional Studio"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover opacity-90 transition-transform duration-10000 hover:scale-105"
      />
      {/* Subtle decorative gradient overlay to add depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
    </div>
  );
}
