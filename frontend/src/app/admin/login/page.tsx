"use client";

import { LoginLayout } from "../../login/components/LoginLayout";
import { AdminLoginForm } from "../../login/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <LoginLayout>
      <AdminLoginForm />
    </LoginLayout>
  );
}
