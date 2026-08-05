"use client";

import { LoginLayout } from "./components/LoginLayout";
import { CustomerLoginForm } from "./components/CustomerLoginForm";

export default function CustomerLoginPage() {
  return (
    <LoginLayout>
      <CustomerLoginForm />
    </LoginLayout>
  );
}
