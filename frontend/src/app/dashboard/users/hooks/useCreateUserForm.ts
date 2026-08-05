"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { UserRole } from "@/store/slices/authSlice";
import { type CreateUserValues } from "@/components/modals/CreateUserModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

const CreateUserSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  role: Yup.string()
    .oneOf(Object.values(UserRole))
    .required("Role is required"),
  phone: Yup.string(),
  bookingSlug: Yup.string(),
  bio: Yup.string(),
  baseLocation: Yup.string(),
});

interface UseCreateUserFormProps {
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  onSuccess: () => void;
}

export function useCreateUserForm({
  authFetch,
  onSuccess,
}: UseCreateUserFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [specsInput, setSpecsInput] = useState("");
  const [specsList, setSpecsList] = useState<string[]>([]);

  const formik = useFormik<CreateUserValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: UserRole.ADMIN,
      phone: "",
      bookingSlug: "",
      bio: "",
      baseLocation: "",
      city: "",
      district: "",
      locationMapLink: "",
      coordinates: "",
    },
    validationSchema: CreateUserSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitError("");
      try {
        // Exclude transient frontend form fields (e.g. coordinates) not accepted by backend CreateUserDto
        const { coordinates, ...restValues } = values;
        const body = {
          ...restValues,
          specializations:
            values.role === UserRole.PHOTOGRAPHER ? specsList : undefined,
        };
        const res = await authFetch(`${API}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create user");
        setShowModal(false);
        resetForm();
        setSpecsList([]);
        setSpecsInput("");
        onSuccess();
      } catch (err: any) {
        setSubmitError(err.message || "Failed to create user");
      }
    },
  });

  const handleAddSpec = () => {
    if (specsInput.trim() && !specsList.includes(specsInput.trim())) {
      setSpecsList((prev) => [...prev, specsInput.trim()]);
      setSpecsInput("");
    }
  };

  const handleRemoveSpec = (spec: string) => {
    setSpecsList((prev) => prev.filter((s) => s !== spec));
  };

  return {
    showModal,
    setShowModal,
    submitError,
    specsInput,
    setSpecsInput,
    specsList,
    formik,
    handleAddSpec,
    handleRemoveSpec,
  };
}
