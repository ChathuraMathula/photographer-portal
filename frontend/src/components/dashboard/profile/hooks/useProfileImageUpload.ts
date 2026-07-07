import { useRef } from "react";
import { toast } from "sonner";

export function useProfileImageUpload(
  onProfileImageUrlChange: (v: string) => void,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            onProfileImageUrlChange(canvas.toDataURL("image/jpeg", 0.7));
            toast.success(
              "Profile image uploaded and compressed successfully!",
            );
          } else {
            onProfileImageUrlChange(reader.result as string);
            toast.warning("Profile image uploaded without compression.");
          }
        };
        img.onerror = () =>
          toast.error("Failed to load image for compression.");
        img.src = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onProfileImageUrlChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return { fileInputRef, handleImageUpload, handleRemoveImage };
}
