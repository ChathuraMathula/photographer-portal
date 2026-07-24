import React from "react";
import loginBanner from "../../../../public/login-banner.jpg";

export function LoginBanner() {
  return (
    <div className="w-full h-[40vh] md:h-screen md:w-1/2 relative bg-zinc-900 overflow-hidden order-first md:order-last">
      <img
        src={loginBanner.src}
        alt="Photographer Portal Professional Studio"
        className="w-full h-full object-cover opacity-90 transition-transform duration-[10000ms] ease-in-out hover:scale-105"
      />
      {/* <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" /> */}
    </div>
  );
}
