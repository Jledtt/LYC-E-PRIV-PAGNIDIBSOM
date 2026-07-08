"use client";

export interface ToastState {
  message: string;
  variant: "success" | "error";
}

export function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  const colorClasses =
    toast.variant === "success"
      ? "bg-green-50 border-green-200 text-green-800"
      : "bg-red-50 border-red-200 text-red-700";

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 max-w-sm border rounded-lg shadow-lg px-4 py-3 text-sm flex items-start gap-3 ${colorClasses}`}
    >
      <span className="flex-1 whitespace-pre-line">{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="text-current opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
