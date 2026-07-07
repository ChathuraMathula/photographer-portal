"use client";

import { Suspense } from "react";
import { useLogin } from "./hooks/useLogin";
import { BrandLogo } from "./components/BrandLogo";
import { LoginForm } from "./components/LoginForm";
import { LoginBanner } from "./components/LoginBanner";

function LoginPageContent() {
  const { formik, apiError, isDeactivated } = useLogin();

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 relative">
      <BrandLogo />

      {/* Left Column: Form Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:py-24 md:px-16 lg:px-24 bg-white dark:bg-zinc-900 rounded-t-3xl -mt-6 md:mt-0 relative z-10 md:rounded-none md:bg-transparent md:dark:bg-transparent order-last md:order-first">
        <LoginForm
          formik={formik}
          apiError={apiError}
          isDeactivated={isDeactivated}
        />
      </div>

      {/* Right Column: Visual Banner */}
      <LoginBanner />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
