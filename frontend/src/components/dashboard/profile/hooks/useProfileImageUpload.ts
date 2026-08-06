import { useRef } from "react";
import { toast } from "sonner";

export function useProfileImageUpload(
  onProfileImageUrlChange: (v: string) => void,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const res = await fetch(`${API}/uploads/image?type=profile`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await res.json();
      onProfileImageUrlChange(data.url);
      toast.success("Profile image uploaded & converted to WebP successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload profile image.");
    }
  };

  const handleRemoveImage = () => {
    onProfileImageUrlChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return { fileInputRef, handleImageUpload, handleRemoveImage };
}
