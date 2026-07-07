import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type ModalLayoutProps = {
  title: string;
  onClose: () => void;
  onSubmit?: (e?: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string; // e.g. "max-w-xl", "max-w-md"
  asForm?: boolean;
};

export function ModalLayout({
  title,
  onClose,
  onSubmit,
  children,
  footer,
  maxWidth = "max-w-xl",
  asForm = true,
}: ModalLayoutProps) {
  const Container: any = asForm ? "form" : "div";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Container
        {...(asForm && onSubmit ? { onSubmit } : {})}
        className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 shrink-0">
          <h2 className="text-title-medium text-primary-dark dark:text-white font-bold">
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 shrink-0">
            {footer}
          </div>
        )}
      </Container>
    </div>
  );
}
