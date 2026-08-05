"use client";

import { LoginLayout } from "../../login/components/LoginLayout";
import { PhotographerLoginForm } from "../../login/components/PhotographerLoginForm";

export default function PhotographerLoginPage() {
  return (
    <LoginLayout>
      <PhotographerLoginForm />
    </LoginLayout>
  );
}
