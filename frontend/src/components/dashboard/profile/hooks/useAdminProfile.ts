import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { setCredentials } from "@/store/slices/authSlice";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

const AdminProfileSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  phone: Yup.string(),
  password: Yup.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match"),
});

export function useAdminProfile() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const formik = useFormik({
    initialValues: { firstName: "", lastName: "", email: "", role: "", phone: "", password: "", confirmPassword: "" },
    validationSchema: AdminProfileSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const body: any = { firstName: values.firstName, lastName: values.lastName, phone: values.phone };
        if (values.password) body.password = values.password;
        const res = await fetch(`${API}/users/me`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include" });
        if (!res.ok) throw new Error("Failed to update profile");
        const data = await res.json();
        dispatch(setCredentials({ id: data.id, email: data.email, role: data.role, firstName: data.firstName }));
        toast.success("Profile settings updated successfully!");
        formik.setFieldValue("password", "");
        formik.setFieldValue("confirmPassword", "");
      } catch (err: any) {
        toast.error(err.message || "An error occurred while updating profile");
      } finally {
        setSaving(false);
      }
    },
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API}/users/me`, { credentials: "include" });
        if (!res.ok) throw new Error("Could not load user profile");
        const data = await res.json();
        formik.setValues({ firstName: data.firstName, lastName: data.lastName, email: data.email, role: data.role, phone: data.phone || "", password: "", confirmPassword: "" });
      } catch (err: any) {
        toast.error(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { formik, loading, saving };
}
