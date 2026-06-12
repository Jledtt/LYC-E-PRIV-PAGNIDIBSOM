"use client";

import { useState, useTransition } from "react";
import { updateArticleStatus } from "./actions";

interface PublishToggleProps {
  id: string;
  status: string;
}

export default function PublishToggle({ id, status }: PublishToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isPublished = status === "published";

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await updateArticleStatus(id, isPublished ? "draft" : "published");
      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={[
          "px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap",
          isPublished
            ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            : "bg-accent-100 text-accent-800 hover:bg-accent-200",
        ].join(" ")}
      >
        {isPublished ? "Dépublier" : "Publier"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
