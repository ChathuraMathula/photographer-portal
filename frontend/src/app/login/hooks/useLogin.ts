"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export function useLogin() {
  const [apiError, setApiError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      email: "admin@photoportal.com",
      password: "SuperSecret123!",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError("");

      try {
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        dispatch(
          setCredentials({
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            firstName: data.user.firstName,
          }),
        );

        router.push("/dashboard");
      } catch (err: unknown) {
        if (err instanceof Error) setApiError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return {
    formik,
    apiError,
  };
}
